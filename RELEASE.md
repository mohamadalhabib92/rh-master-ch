# Release next

`release/next` est la ligne qui part vers TestFlight. `main` déploie la PWA sur GitHub Pages. Ne pas fusionner cette branche dans `main` sans l’accord explicite de Mohamed.

Cette branche part de `cursor/rh-learning-parcours-fce5` (tête des builds préparés pour TestFlight : parcours, contrat de données, iPhone, iPad/Mac, tvOS). Le contrat `cursor/rh-content-data-contract-c966` y est déjà inclus. Les contrôles de `ci/pr-checks-2026-11-19` y sont intégrés et étendus. La branche `ux/passe-plaisir-2026-11-04` n’y est pas : elle réécrit les mêmes écrans (accueil, réglages, quiz, focus, kit UI) que le parcours a déjà remplacés, et le module Android `focus-lock` y est désactivé.

Aucune branche n’est supprimée. Aucun secret n’est ajouté. Les identifiants de bundle, la signature et les entitlements ne changent pas. La clé locale reste `rhmaster:v1`.

## Ce que fait l’intégration continue

À chaque push et à chaque pull request, `.github/workflows/pr-checks.yml` lance, sans secret et sans déploiement :

1. `npm ci`
2. `npx tsc --noEmit`
3. `npm test`
4. `npx expo export -p web`

Le workflow Pages (`.github/workflows/pages.yml`) ne déploie que les pushes sur `main`. Un export web dans cette CI ne publie rien.

## TestFlight — iPhone et iPad

Depuis un checkout de `release/next`, avec une session EAS déjà autorisée sur le projet `39c8cdc7-9a26-42d3-b971-15a635950a11` :

```sh
eas build -p ios --profile production
eas submit -p ios --profile production
```

Le profil `production` incrémente le numéro de build à distance. Le bundle versionné reste `com.vibecode.rhmasterch-yqj32g`, `buildNumber` « 1 » dans le dépôt. L’app App Store Connect est `6786222151`, équipe `Y9XF9RY2BU`.

`eas submit` lit la clé API dans l’environnement (`EXPO_ASC_API_KEY_PATH`, `EXPO_ASC_KEY_ID`, `EXPO_ASC_ISSUER_ID`). Ces valeurs ne sont pas dans le dépôt.

Le même binaire iOS contient l’iPhone (portrait) et l’iPad. Sur un Mac Apple Silicon, TestFlight installe cette app iPad : App Store Connect → app 6786222151 → Tarification et disponibilité → apps iPhone et iPad sur les Mac Apple Silicon → rendre l’app disponible. Pas de fiche macOS séparée.

## TestFlight — Apple TV

Ne pas utiliser `production` pour la télé.

```sh
eas build -p ios --profile production-tv
eas submit -p ios --profile production-tv
```

`production-tv` pose `EXPO_TV=1`, `autoIncrement: false`, et le plugin réécrit `CFBundleVersion` à 2. Même bundle, même app `6786222151`, plateforme tvOS à ajouter dans App Store Connect si elle n’y est pas. Certificat et profil de distribution tvOS sur le projet Expo ci-dessus. Si le compteur iPhone remplace quand même le 2, ne pas incrémenter l’iPhone pour compenser : il faudra alors un projet Expo séparé.

Le salon TV reprend le parcours, les leçons, les quiz et la progression. Les surfaces Verre y restent opaques.

## Ce que cette branche ne fait pas

Pas de soumission App Store, pas de build EAS lancé depuis l’agent, pas de migration ni de déploiement Supabase, pas de changement de signature.
