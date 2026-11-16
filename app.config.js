/**
 * Config dynamique. Le baseUrl web reste /rh-master-ch dans app.json.
 * EAS_BUILD le retire : ce champ ne concerne que le web.
 * Sans EXPO_TV, le bundle iOS com.vibecode.rhmasterch-yqj32g et le buildNumber 1
 * ne sont pas modifiés. Le profil production-tv pose EXPO_TV=1.
 */
const IOS_BUNDLE_ID = 'com.vibecode.rhmasterch-yqj32g';
const IPHONE_BUILD = '1';
const TV_BUILD = '2';
const EAS_PROJECT = '39c8cdc7-9a26-42d3-b971-15a635950a11';

const TV_IMAGES = {
  iconSmallLayers: { front: './assets/tv/icon-home-front.png', back: './assets/tv/icon-home-back.png' },
  iconSmall2xLayers: { front: './assets/tv/icon-home-front@2x.png', back: './assets/tv/icon-home-back@2x.png' },
  iconLayers: { front: './assets/tv/icon-store-front.png', back: './assets/tv/icon-store-back.png' },
  topShelf: './assets/tv/top-shelf.png',
  topShelf2x: './assets/tv/top-shelf@2x.png',
  topShelfWide: './assets/tv/top-shelf-wide.png',
  topShelfWide2x: './assets/tv/top-shelf-wide@2x.png',
};

function withAppleTv(config) {
  const experiments = { ...(config.experiments ?? {}) };
  if (process.env.EAS_BUILD) delete experiments.baseUrl;
  const plugins = (config.plugins || []).filter((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name === 'expo-router' || name === 'expo-font' || name === 'expo-status-bar';
  });
  plugins.push([
    '@react-native-tvos/config-tv',
    { isTV: true, tvosDeploymentTarget: '16.4', appleTVImages: TV_IMAGES },
  ]);
  plugins.push('./plugins/with-tv-pods.js');
  const info = { ...(config.ios?.infoPlist || {}) };
  const next = {
    ...config,
    orientation: 'landscape',
    plugins,
    experiments,
    ios: {
      ...config.ios,
      bundleIdentifier: IOS_BUNDLE_ID,
      buildNumber: TV_BUILD,
      requireFullScreen: true,
      infoPlist: info,
    },
    extra: {
      ...(config.extra || {}),
      eas: { ...(config.extra?.eas || {}), projectId: EAS_PROJECT },
    },
  };
  delete next.splash;
  return next;
}

module.exports = ({ config }) => {
  if (process.env.EXPO_TV === '1') return withAppleTv(config);
  const experiments = { ...(config.experiments ?? {}) };
  if (process.env.EAS_BUILD) {
    delete experiments.baseUrl;
  }
  return {
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: IOS_BUNDLE_ID,
      buildNumber: config.ios?.buildNumber || IPHONE_BUILD,
    },
    experiments,
  };
};

module.exports.IOS_BUNDLE_ID = IOS_BUNDLE_ID;
module.exports.IPHONE_BUILD = IPHONE_BUILD;
module.exports.TV_BUILD = TV_BUILD;
module.exports.EAS_PROJECT = EAS_PROJECT;
module.exports.TV_IMAGES = TV_IMAGES;
