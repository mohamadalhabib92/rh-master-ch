# Contrat de fondation — RH Master CH

Ce dossier ne valide aucun contenu et ne prépare pas une publication.

## Deux titres, non reliés aux questions

`exam-reference.json` décrit deux examens distincts, d'après les PDF HRSE lus le 7 novembre 2026 (empreintes SHA-256 dans le fichier) :

- le certificat d'association « Gestionnaire RH avec certificat HRSE » ;
- le brevet fédéral de spécialiste RH, options A, B et C.

Les ambiguïtés de version (règlement mars 2026 contre publication mars 2027 ; modification 2022 du brevet non citée par la publication 2026 ; pondération du brevet non chiffrée) restent dans le JSON. `mappedQuestionCount` est 0. Le titre d'un module n'est pas une compétence officielle.

## Validité et licence

`content-contract.json` fixe le statut de toute la banque : `a_valider`, validité juridique non établie, licence non établie, alignement non évalué. Aucun test ne passe une question à `valide`. Une relecture humaine reste le passage obligé. Le code ne la remplace pas.

Les 137 identifiants figés sont dans `question-ids.json`. Les renommer casse la progression locale.

## Progression `rhmaster:v1`

`learning-state.schema.json` et `fixtures/learning/` décrivent l'état déjà sur l'appareil. Une sauvegarde sans `schemaVersion` est relue. Une `schemaVersion` supérieure à 1 n'est pas réécrite. Les clés inconnues restent dans le blob.

## Vacances

`vacation(4, 12, 50)` renvoie 20 jours : le taux d'activité n'est pas appliqué. Ce n'est pas une règle de temps partiel. Ne pas diviser les jours par deux sans source. Détail dans le backlog du contrat.

## Voir le résultat sans build payant

Depuis la racine du dépôt :

```bash
npm test
npx tsc --noEmit
npx expo start --web
```

`npm test` et `tsc` ne publient rien. `expo start --web` ouvre l'app en local. Pas de soumission EAS, TestFlight, App Store ni GitHub Pages depuis cette branche.
