import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);

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

test('iPhone config keeps the bundle, build 1, tablet support and does not block Mac', () => {
  const phone = loadConfig(false);
  const { applyIpadMacPlist, MAC_BLOCKED_CAPABILITIES } = require(path.join(root, 'plugins/with-ipad-mac.js'));
  assert.equal(phone.ios.bundleIdentifier, 'com.vibecode.rhmasterch-yqj32g');
  assert.equal(phone.ios.buildNumber, '1');
  assert.equal(phone.ios.supportsTablet, true);
  assert.equal(phone.extra.eas.projectId, '39c8cdc7-9a26-42d3-b971-15a635950a11');
  const names = (phone.plugins || []).map((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin));
  assert.ok(names.includes('./plugins/with-ipad-mac.js'));
  assert.equal(names.includes('@react-native-tvos/config-tv'), false);
  const plist = applyIpadMacPlist({
    UIRequiredDeviceCapabilities: ['telephony', 'armv7'],
    UIRequiresFullScreen: true,
    UISupportedInterfaceOrientations: ['UIInterfaceOrientationPortrait'],
  });
  assert.deepEqual(plist.UIDeviceFamily, [1, 2]);
  assert.equal(plist.UIRequiresFullScreen, undefined);
  assert.equal(plist.UIRequiredDeviceCapabilities, undefined);
  assert.deepEqual(plist.UISupportedInterfaceOrientations, ['UIInterfaceOrientationPortrait']);
  assert.ok(plist['UISupportedInterfaceOrientations~ipad'].includes('UIInterfaceOrientationLandscapeLeft'));
  const dumped = JSON.stringify(plist);
  for (const capability of MAC_BLOCKED_CAPABILITIES) assert.equal(dumped.includes(capability), false);
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  assert.equal(app.expo.ios.supportsTablet, true);
  assert.equal(app.expo.ios.buildNumber, '1');
  assert.equal(JSON.stringify(app).includes('UIRequiredDeviceCapabilities'), false);
});

test('Apple TV config is unchanged by the Mac plugin', () => {
  const tv = loadConfig(true);
  const names = (tv.plugins || []).map((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin));
  assert.equal(names.includes('./plugins/with-ipad-mac.js'), false);
  assert.equal(tv.ios.buildNumber, '2');
  assert.equal(tv.ios.requireFullScreen, true);
});
