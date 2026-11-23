# Design system — RH Master CH

Consulté avec le parcours le 15 novembre 2026. Le but est une interface calme, lisible sur téléphone et tablette, sans effet de jeu bruyant. Les jetons vivent dans `src/theme.ts`. Les écrans les lisent via `useTheme()`.

## Couleur

Deux palettes, plus une variante contraste élevé. Le rouge suisse reste l’accent, pas le fond de chaque écran. Le bleu lac sert les liens et les informations secondaires.

| Jeton | Clair | Sombre |
| --- | --- | --- |
| bg | `#E3EBF2` | `#0B1016` |
| surface | `#FFFCF8` | `#1B232D` |
| surfaceAlt | `#E8E2D8` | `#263140` |
| text | `#1A1D23` | `#F4F0E8` |
| muted | `#5C6570` | `#A8B3BF` |
| border | `#E3DDD4` | `#314052` |
| primary | `#9F1D32` | `#F07184` |
| primaryText | `#8E1528` | `#FFB3BE` |
| accent | `#1F4B6E` | `#9CC4E4` |
| ok | `#1F7A4D` | `#8ED4AE` |

Contraste élevé : fond blanc ou noir, texte noir ou blanc, bordures pleines. Le mode sombre et le contraste se règlent dans l’app et restent dans `rhmaster:v1`.

Le héros d’accueil va du bordeaux `#8E1528` au bleu `#1F4B6E`. En sombre, les mêmes teintes sont assombries.

## Typographie

| Rôle | Taille | Interligne | Graisse |
| --- | --- | --- | --- |
| display | 34 | 40 | 800 |
| h1 | 28 | 34 | 800 |
| h2 | 22 | 28 | 700 |
| h3 | 17 | 24 | 700 |
| body | 16 | 24 | 400 |
| small | 13 | 18 | 500 |

Le réglage « texte plus aéré » passe le corps à 17 / 28, ajoute un léger espacement des lettres et, sur le web, Verdana. Ce n’est pas une police médicale ni une promesse de confort pour une personne dyslexique : c’est une option de lecture.

## Verre

Les cartes, la barre d’onglets, la colonne latérale et les champs sont des surfaces translucides (`glassFor` dans `src/theme.ts`) posées sur un fond brumeux avec deux halos (rouge suisse, bleu lac). Le texte ne change pas : il reste sur la surface composée, au-dessus du seuil AA (4,5:1), y compris le gris `muted`.

Les boutons ont une arête claire en haut, une lèvre plus sombre en bas et deux ombres (contact + portée). L’appui réduit la lèvre et l’ombre ; le décalage vertical est coupé si « Réduire les animations » est actif ou si le système demande moins de mouvement.

Repli opaque, sans halo : contraste élevé, réglage système « Réduire la transparence », et le salon Apple TV. Sur la télé les aplats restent opaques pour la lecture à dix pieds. Le focus (échelle 1,08, bord de 6 pt, halo blanc) ne change pas. Seule une ombre de repos et une arête claire s’ajoutent hors focus.

## Espacement, rayons, ombres

Échelle : 4, 8, 12, 16, 24, 32, 48.

Rayons : 12 (petit), 16 (boutons), 24 (cartes), pilule pour les pastilles.

Ombre de carte : flou 18, décalage vertical 8, opacité faible (`shadow` du jeton). Pas d’ombre portée dure.

Cible tactile : 48 px (au-dessus des 44 pt). Les textes suivent Dynamic Type jusqu’à 3× (`allowFontScaling`, `maxFontSizeMultiplier`).

## Icônes

Une seule famille, Ionicons. Tailles 18, 22 et 28. Une tuile douce (`primarySoft`) porte l’icône des modules et des compétences.

## Grille

Largeur de contenu : 720 sous 760 px, 920 entre 760 et 1100, 1080 au-delà. À partir de 900 px, les listes de cartes passent sur deux colonnes. Le barreau d’onglets reste en bas.

## Mouvement

Durées : 160 ms, 240 ms, 420 ms. Appui : légère réduction d’échelle (0,985) et d’opacité, sauf si « réduire les animations » est actif ou si le système demande moins de mouvement. Le squelette de chargement ne pulse pas dans ce cas. Les célébrations (pastille XP) ont trois niveaux : complètes, discrètes, aucune.

## Retours haptiques

Sur téléphone, une vibration courte accompagne un choix, une réussite ou un avertissement. Elles sont coupées si le réglage est désactivé, si les célébrations sont à « aucune », ou si les animations sont réduites. Le web ne vibre pas.

## États vides et introduction

Un état vide a une tuile d’icône, un titre, une phrase et une seule action. L’introduction tient en trois écrans (une idée, la série douce, les réglages de calme). Elle se passe. Une personne qui a déjà une progression ne la voit pas : ses données restent.

## Écrans

Les primitives `Screen`, `Card`, `Button`, `Chip`, `Badge`, `ProgressBar`, `EmptyState` portent les jetons. Les onglets, le quiz, les calculateurs, le glossaire, les réglages et le parcours les utilisent. Le mode concentration retire le reste de l’interface le temps du créneau.
