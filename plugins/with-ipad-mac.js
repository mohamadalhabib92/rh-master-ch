const { withInfoPlist } = require('expo/config-plugins');

/** Capacités qui font refuser l’app iOS sur Mac (« Designed for iPad »). */
const MAC_BLOCKED_CAPABILITIES = [
  'telephony',
  'sms',
  'gps',
  'location-services',
  'magnetometer',
  'gyroscope',
  'accelerometer',
  'camera-flash',
  'auto-focus-camera',
  'front-facing-camera',
  'still-camera',
  'video-camera',
  'armv7',
  'wifi',
  'bluetooth-le',
  'nfc',
  'healthkit',
];

const IPAD_ORIENTATIONS = [
  'UIInterfaceOrientationPortrait',
  'UIInterfaceOrientationPortraitUpsideDown',
  'UIInterfaceOrientationLandscapeLeft',
  'UIInterfaceOrientationLandscapeRight',
];

/**
 * iPhone reste portrait. iPad et la fenêtre Mac peuvent tourner et se redimensionner.
 * Aucune capacité matérielle exigée : Mac n’est pas exclu.
 * Ce plugin n’est pas branché sur le profil Apple TV.
 */
function applyIpadMacPlist(plist) {
  const next = { ...plist };
  next.UIDeviceFamily = [1, 2];
  next.UISupportedInterfaceOrientations = ['UIInterfaceOrientationPortrait'];
  next['UISupportedInterfaceOrientations~ipad'] = IPAD_ORIENTATIONS;
  delete next.UIRequiresFullScreen;
  delete next.UIRequiredDeviceCapabilities;
  return next;
}

function withIpadMac(config) {
  config.ios = config.ios || {};
  config.ios.supportsTablet = true;
  if (config.ios.requireFullScreen) delete config.ios.requireFullScreen;
  return withInfoPlist(config, (cfg) => {
    cfg.modResults = applyIpadMacPlist(cfg.modResults);
    return cfg;
  });
}

module.exports = withIpadMac;
module.exports.applyIpadMacPlist = applyIpadMacPlist;
module.exports.MAC_BLOCKED_CAPABILITIES = MAC_BLOCKED_CAPABILITIES;
module.exports.IPAD_ORIENTATIONS = IPAD_ORIENTATIONS;
