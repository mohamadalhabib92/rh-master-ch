/**
 * Config dynamique. Le baseUrl web reste /rh-master-ch dans app.json.
 * EAS_BUILD le retire : ce champ ne concerne que le web.
 * Le bundle iOS com.vibecode.rhmasterch-yqj32g n'est pas modifié.
 */
const IOS_BUNDLE_ID = 'com.vibecode.rhmasterch-yqj32g';

module.exports = ({ config }) => {
  const experiments = { ...(config.experiments ?? {}) };
  if (process.env.EAS_BUILD) {
    delete experiments.baseUrl;
  }
  return {
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: IOS_BUNDLE_ID,
    },
    experiments,
  };
};
