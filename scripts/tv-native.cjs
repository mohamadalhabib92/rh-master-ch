/**
 * Modules retirés du lien natif Apple TV. Une seule liste, lue par le hook EAS,
 * le plugin Podfile et react-native.config.js. Inerte tant que EXPO_TV n’est pas 1.
 *
 * expo-haptics et expo-speech n’ont pas de place sur le salon : le focus est
 * visuel, le texte est à l’écran. expo-router est patché à part.
 */
const TV_AUTOLINK_EXCLUDE = ['expo-haptics', 'expo-speech'];

/** Les xcframework Maven sont le cœur iOS upstream, pas le fork tvOS. */
const TV_RN_CORE_FROM_SOURCE = '0';

/** Version écrite dans le binaire tvOS. L’iPhone reste à 1. */
const TV_BUNDLE_VERSION = '2';

module.exports = { TV_AUTOLINK_EXCLUDE, TV_RN_CORE_FROM_SOURCE, TV_BUNDLE_VERSION };
