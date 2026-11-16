import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);

function pngSize(file) {
  const buf = fs.readFileSync(file);
  assert.equal(buf.toString('ascii', 1, 4), 'PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function loadConfig(tv) {
  const prev = process.env.EXPO_TV;
  if (tv) process.env.EXPO_TV = '1';
  else delete process.env.EXPO_TV;
  const file = path.join(root, 'app.config.js');
  delete require.cache[require.resolve(file)];
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
  const result = require(file)({ config: structuredClone(app) });
  if (prev === undefined) delete process.env.EXPO_TV;
  else process.env.EXPO_TV = prev;
  return result;
}

test('iPhone config keeps bundle, build 1 and the Expo project', () => {
  const phone = loadConfig(false);
  assert.equal(phone.ios.bundleIdentifier, 'com.vibecode.rhmasterch-yqj32g');
  assert.equal(phone.ios.buildNumber, '1');
  assert.equal(phone.slug, 'rh-master-ch');
  assert.equal(phone.orientation, 'portrait');
  assert.equal(phone.extra.eas.projectId, '39c8cdc7-9a26-42d3-b971-15a635950a11');
  const names = (phone.plugins || []).map((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin));
  assert.equal(names.includes('@react-native-tvos/config-tv'), false);
  assert.equal(names.includes('./plugins/with-tv-pods.js'), false);
  assert.equal(phone.splash.backgroundColor, '#C8102E');
});

test('production-tv config is landscape, build 2, deployment 16.4 and brand assets', () => {
  const tv = loadConfig(true);
  assert.equal(tv.ios.bundleIdentifier, 'com.vibecode.rhmasterch-yqj32g');
  assert.equal(tv.ios.buildNumber, '2');
  assert.equal(tv.orientation, 'landscape');
  assert.equal(tv.extra.eas.projectId, '39c8cdc7-9a26-42d3-b971-15a635950a11');
  assert.equal(tv.splash, undefined);
  const configTv = tv.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === '@react-native-tvos/config-tv');
  assert.ok(configTv);
  assert.equal(configTv[1].isTV, true);
  assert.equal(configTv[1].tvosDeploymentTarget, '16.4');
  assert.equal(tv.plugins.at(-1), './plugins/with-tv-pods.js');
  const eas = JSON.parse(fs.readFileSync(path.join(root, 'eas.json'), 'utf8'));
  assert.equal(eas.build.production.autoIncrement, true);
  assert.equal(eas.build['production-tv'].autoIncrement, false);
  assert.equal(eas.build['production-tv'].env.EXPO_TV, '1');
  assert.equal(eas.build['production-tv'].env.RCT_USE_PREBUILT_RNCORE, '0');
  assert.equal(eas.build.production.env.EXPO_TV, undefined);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies['react-native'], '0.88.0');
  assert.equal(pkg.scripts['eas-build-pre-install'], 'node scripts/eas-tv-preinstall.mjs');
});

test('brand catalog has the sizes Apple validates', () => {
  const expected = {
    'icon-home-back.png': [400, 240],
    'icon-home-front.png': [400, 240],
    'icon-home-back@2x.png': [800, 480],
    'icon-home-front@2x.png': [800, 480],
    'icon-store-back.png': [1280, 768],
    'icon-store-front.png': [1280, 768],
    'top-shelf.png': [1920, 720],
    'top-shelf@2x.png': [3840, 1440],
    'top-shelf-wide.png': [2320, 720],
    'top-shelf-wide@2x.png': [4640, 1440],
  };
  for (const [name, [width, height]] of Object.entries(expected)) {
    const size = pngSize(path.join(root, 'assets/tv', name));
    assert.deepEqual([size.width, size.height], [width, height], name);
  }
});

test('router podspec gains tvOS 16.4 and drops Link Preview and Toolbar', () => {
  const { patchExpoRouterPodspecSource } = require(path.join(root, 'scripts/tv-native-patch.cjs'));
  const source = fs.readFileSync(path.join(root, 'node_modules/expo-router/ios/ExpoRouter.podspec'), 'utf8');
  const next = patchExpoRouterPodspecSource(source);
  assert.match(next, /:tvos => '16.4'/);
  assert.match(next, /s\.tvos\.exclude_files = 'LinkPreview\/\*\*\/\*', 'Toolbar\/\*\*\/\*'/);
  assert.equal(patchExpoRouterPodspecSource(next), next);
});

test('tvOS module provider drops LinkPreviewNativeModule and RouterToolbarModule only', () => {
  const { patchAppleModuleConfig } = require(path.join(root, 'scripts/tv-native-patch.cjs'));
  const config = {
    apple: {
      modules: ['ExpoHeadModule', 'LinkPreviewNativeModule', 'RouterToolbarModule'],
      appDelegateSubscribers: ['ExpoHeadAppDelegateSubscriber'],
    },
  };
  const next = patchAppleModuleConfig(config, new Set(['LinkPreviewNativeModule', 'RouterToolbarModule']));
  assert.deepEqual(next.apple.modules, ['ExpoHeadModule']);
  assert.deepEqual(next.apple.appDelegateSubscribers, ['ExpoHeadAppDelegateSubscriber']);
});

test('Podfile is tvOS 16.4, compiles RN from source, and excludes haptics and speech', () => {
  const { patchPodfileSource, forceBundleVersion, TV_BUNDLE_VERSION } = require(path.join(root, 'plugins/with-tv-pods.js'));
  const sample = ['require File.join(File.dirname(`node --print "require.resolve(\'expo/package.json\')"`, "scripts/autolinking")', 'platform :ios, \'16.4\'', 'target \'RHMasterCH\' do', '  use_expo_modules!', '  post_install do |installer|', '  end', 'end'].join('\n');
  const next = patchPodfileSource(sample);
  assert.match(next, /platform :tvos, '16.4'/);
  assert.match(next, /RCT_USE_PREBUILT_RNCORE'\] = '0'/);
  assert.match(next, /use_expo_modules!\(exclude: \['expo-haptics', 'expo-speech'\]\)/);
  assert.match(next, /TVOS_DEPLOYMENT_TARGET'\] = '16.4'/);
  const plist = '<key>CFBundleVersion</key>\n    <string>1</string>';
  assert.match(forceBundleVersion(plist), new RegExp(`<string>${TV_BUNDLE_VERSION}</string>`));
  assert.equal(TV_BUNDLE_VERSION, '2');
});

test('focus treatment is one shared scale, thick border and dim unfocused state', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/tv/ui.tsx'), 'utf8');
  const focus = fs.readFileSync(path.join(root, 'src/lib/tv-focus.ts'), 'utf8');
  assert.match(focus, /scale: 1\.08/);
  assert.match(focus, /borderWidth: 6/);
  assert.match(focus, /unfocusedOpacity: 0\.62/);
  assert.match(focus, /horizontal: 90/);
  assert.match(focus, /vertical: 60/);
  assert.match(source, /TvFocusable/);
  assert.match(source, /hasTVPreferredFocus/);
  assert.match(source, /TVFocusGuideView/);
  assert.match(source, /scrollTo/);
  assert.equal(source.includes('expo-haptics'), false);
  assert.equal(source.includes('expo-speech'), false);
});

test('phone package is not rewritten unless this is an EAS TV build', async () => {
  const { shouldSwapReactNativeOnEas, patchPackageForTv } = await import('./tv-build.mjs');
  assert.equal(shouldSwapReactNativeOnEas({}), false);
  assert.equal(shouldSwapReactNativeOnEas({ EXPO_TV: '1' }), false);
  assert.equal(shouldSwapReactNativeOnEas({ EXPO_TV: '1', EAS_BUILD: 'true' }), true);
  const patched = patchPackageForTv({ dependencies: { 'react-native': '0.88.0' }, expo: {} });
  assert.equal(patched.dependencies['react-native'], 'npm:react-native-tvos@0.87-stable');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies['react-native'], '0.88.0');
});
