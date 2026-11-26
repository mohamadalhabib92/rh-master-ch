# Kaizen

Petites améliorations sur `release/next`. Rien n’est fusionné dans `main`. La clé `rhmaster:v1` n’est pas modifiée : les marques de relecture restent dans l’écran.

## 2026-11-23

Écart visé : un entraînement au format d’un examen HRSE (minuté, relecture, source nommée). Ce n’est pas un sujet officiel et l’app ne délivre aucun titre.

### 1. Examen blanc : marque et relecture

Avant : le blanc était déjà minuté. On voyait l’explication au fil de l’eau, puis une note. Impossible de marquer une question ni de relire le sujet à la fin.

Après : un bouton marque la question en cours. À la fin (rendu ou temps écoulé), une relecture liste chaque item, les marqués d’abord, avec le statut correct, incorrect ou sans réponse, l’explication et la source. Les marques ne sont pas écrites dans `rhmaster:v1`. `saveMock` enregistre toujours seulement l’identifiant, la note et la date.

Fichiers : `src/app/mock/[id].tsx`, `src/lib/exam-session.ts`, `src/i18n/strings.ts`.

Tests : `src/lib/exam-session.test.ts` (ordre de relecture).

### 2. Source nommée, sinon « à vérifier »

Avant : le quiz affichait `YOUR_LEGAL_SOURCE` quand le code de loi n’était pas dans le dictionnaire. Les items d’un blanc, d’un exercice ou d’un cas ne montraient pas la source déjà portée par l’épreuve.

Après : si le code est dans `LAWS` (CO, LTr, etc.), le nom déjà écrit s’affiche. Si l’épreuve a déjà un `source.name` (CO, LTr, règlement HRSE lu dans le catalogue), ce nom s’affiche. Sinon : « à vérifier ». Aucun numéro d’article n’est ajouté.

Fichiers : `src/lib/exam-session.ts`, `src/app/quiz/[id].tsx`, `src/app/drill/[id].tsx`, `src/app/case/[id].tsx`.

Tests : `src/lib/exam-session.test.ts` (source connue, placeholder, absence d’article inventé).

### 3. Horloge lisible

Avant : le temps restant était arrondi à la minute supérieure (`Math.ceil`), donc « 1 min » jusqu’à la dernière seconde.

Après : l’horloge est `mm:ss`, en titre, et passe à la couleur danger dans la dernière minute. Le mouvement du blanc n’est pas ajouté : seul le texte change.

Fichiers : `src/app/mock/[id].tsx`, `src/lib/exam-session.ts`.

Tests : `src/lib/exam-session.test.ts` (`formatClock`).

## 2026-11-26

Demande : un module compact de comptabilité suisse pour les métiers RH, sur une branche à part, sans fusion dans `main`. Ce n’est pas un sujet officiel et l’app ne délivre aucun titre.

Avant : le parcours couvrait le droit du travail, la paie et les assurances, sans leçons d’écritures comptables.

Après : compétence « Comptabilité suisse », six leçons (obligation CO art. 957 ss, bilan et compte de résultat, plan PME classes 1 à 9, partie double, TVA 8,1 / 2,6 / 3,8 et méthode effective, salaires, bouclement), six cartes, 44 questions (QCM, vrai/faux, ordre, écritures chiffrées) et un blanc de huit questions sur le minuteur déjà en place. Les taux 2026 d’AVS/AI/APG et d’AC sont ceux des fiches existantes. Le reste sans taux fédéral unique est marqué « à vérifier ».

Fichiers : `src/curriculum/accounting-math.ts`, `src/curriculum/accounting-content.ts`, `src/curriculum/catalog.ts`, `src/app/(tabs)/learn.tsx`.

Tests : `src/curriculum/accounting-math.test.ts`, `src/curriculum/accounting-content.test.ts` (une seule bonne réponse, explications non vides, montants et écritures équilibrées). La clé `rhmaster:v1` n’est pas modifiée.
