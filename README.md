# RH Master CH — Droit du travail & RH en Suisse

Application Expo (React Native, expo-router et TypeScript). Elle fonctionne sur **iOS, Android et Web**, où elle s'installe comme une PWA.
Elle a été reconstruite à partir de la spécification Vibecode « RH Master CH ».

> ⚠️ **Contenu pédagogique, pas un conseil juridique.** Les contenus résument le droit suisse du travail en citant uniquement **le nom des lois** (CO, LTr, LAA, LACI, LEg, LPGA…), jamais des numéros d'article inventés. Les valeurs incertaines portent la mention « à vérifier ». Faites valider le contenu par un·e juriste avant tout usage professionnel. Le bandeau d'avertissement est affiché en permanence.

## Fonctionnalités

- **9 modules** :
  1. Contrat
  2. Temps de travail
  3. Salaire
  4. Vacances et jours fériés
  5. Maladie et accident
  6. Fin des rapports de travail
  7. Égalité et protection
  8. Recrutement et données
  9. Santé et sécurité
- Chaque module contient :
  - une fiche de points clés, à marquer comme lue ;
  - les lois de référence ;
  - un quiz.
- **Quiz** : environ 137 questions.
  - Les options sont mélangées et chaque réponse est expliquée avec sa loi de référence.
  - Vous obtenez un score, avec le meilleur score par module.
  - Un mode **« Revoir mes erreurs »** est disponible.
- **Calculateurs indicatifs**, avec des taux modifiables marqués « valeur indicative — à vérifier » :
  - salaire brut → net (AVS/AI/APG, AC avec plafond, AANP, LPP) ;
  - vacances au prorata ;
  - heures supplémentaires ;
  - délai de congé et date de fin (CDI) ;
  - période de protection contre le congé (maladie ou accident).
- **Glossaire** : 108 termes en FR, DE, IT et EN.
  - La recherche est debouncée, insensible aux accents, et surligne les résultats.
- **Actualités RH** : affichées « À venir ». Aucune fausse actualité n'est incluse ; seules des sources réelles et datées seront ajoutées.
- **Sources officielles** : Fedlex, SECO, AVS/AI, OFAS, etc. Le lien `YOUR_LEGAL_SOURCE` est à remplacer par votre propre source.
- **Langues** :
  - L'interface est en FR (par défaut), DE, IT et EN.
  - Les fiches et les deux premières questions de chaque module sont traduites. Le reste s'affiche en français avec une mention.
  - Les traductions sont **provisoires**.
- **Hors ligne** : la progression est stockée localement et un service worker PWA est inclus. Aucun compte ni serveur n'est nécessaire.

## Développement

```bash
npm install
npm run web          # ou: npx expo start
npm run typecheck    # tsc --noEmit
npm run export:web   # expo export -p web + manifest/service worker -> dist/
```

Pour régénérer les icônes : `python3 scripts/make-icons.py "#C8102E" "#FFFFFF" "RH" "#FFFFFF"`.

## Publication sur GitHub Pages (à faire par vous)

1. Créez un dépôt GitHub nommé **`rh-master-ch`** (`experiments.baseUrl` = `/rh-master-ch`).
2. Ajoutez le dépôt distant et poussez : `git remote add origin git@github.com:<vous>/rh-master-ch.git && git push -u origin main`.
3. Dans *Settings → Pages*, choisissez **Source : GitHub Actions**. Le workflow `.github/workflows/pages.yml` construit et déploie l'app.
4. L'app est alors disponible sur `https://<vous>.github.io/rh-master-ch/`.

## Phase 2 (optionnelle, non activée)

Un assistant IA de questions-réponses RH pourrait être ajouté **hors du parcours principal**. Il passerait par un backend qui garde la clé côté serveur : `OPENAI_API_KEY=YOUR_OPENAI_API_KEY`. Cette clé ne doit jamais être mise dans une variable `EXPO_PUBLIC_*`. Ses réponses devraient citer des sources vérifiables.

## Structure

```
src/app/          routes (onglets, module/[id], quiz/[id], disclaimer)
src/components/   UI, bandeau d'avertissement, champs, cartes
src/data/         modules M1–M9, traductions, glossaire, lois et sources
src/lib/          store persistant, i18n, calculs
scripts/pwa.mjs   manifest, service worker, 404.html
```
