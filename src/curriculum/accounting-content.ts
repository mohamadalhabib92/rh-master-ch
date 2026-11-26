import type { CardItem, Competence, Drill, DrillItem, ExamSim, Figure, Lesson, SourceRef } from './types';
import {
  depreciationEntry,
  formatChfCents,
  linearDepreciation,
  monthlyShare,
  paymentEntry,
  payrollEntries,
  provisionEntry,
  purchaseEntry,
  saleEntry,
  sourcedPayroll,
  vatOnNet,
  type JournalEntry,
} from './accounting-math';

const DAY = '2026-11-26';

const CO: SourceRef = {
  name: 'Code des obligations, art. 957 ss, état au 1.1.2026',
  url: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/fr',
  consultedAt: DAY,
};
const LTVA: SourceRef = {
  name: 'Loi sur la TVA (LTVA)',
  url: 'https://www.fedlex.admin.ch/eli/cc/2009/615/fr',
  consultedAt: DAY,
};
const OFAS: SourceRef = {
  name: 'OFAS, tableau synoptique au 1.1.2026',
  url: 'https://sozialversicherungen.admin.ch/fr/d/6877/download',
  consultedAt: '2026-11-15',
};
const LPP: SourceRef = {
  name: 'Loi sur la prévoyance professionnelle (LPP)',
  url: 'https://www.fedlex.admin.ch/eli/cc/1983/797_797_797/fr',
  consultedAt: DAY,
};

export const accountingFigures: Figure[] = [
  {
    id: 'tva_normale',
    label: 'TVA, taux normal',
    validYear: 2026,
    value: 8.1,
    unit: '%',
    source: 'Taux légal depuis le 1.1.2024',
    url: 'https://www.estv.admin.ch/estv/fr/home/mehrwertsteuer.html',
    consultedAt: DAY,
    status: 'verified',
    note: 'Taux normal en vigueur depuis le 1.1.2024. C’est le taux enseigné pour 2026.',
  },
  {
    id: 'tva_reduite',
    label: 'TVA, taux réduit',
    validYear: 2026,
    value: 2.6,
    unit: '%',
    source: 'Taux légal depuis le 1.1.2024',
    url: 'https://www.estv.admin.ch/estv/fr/home/mehrwertsteuer.html',
    consultedAt: DAY,
    status: 'verified',
    note: 'Taux réduit (denrées, médicaments, livres, journaux) depuis le 1.1.2024.',
  },
  {
    id: 'tva_speciale',
    label: 'TVA, taux spécial hébergement',
    validYear: 2026,
    value: 3.8,
    unit: '%',
    source: 'Taux légal depuis le 1.1.2024',
    url: 'https://www.estv.admin.ch/estv/fr/home/mehrwertsteuer.html',
    consultedAt: DAY,
    status: 'verified',
    note: 'Taux spécial de l’hébergement depuis le 1.1.2024.',
  },
];

export const accountingCompetence: Competence = {
  id: 'compta',
  title: 'Comptabilité suisse',
  de: {
    title: 'Schweizer Buchhaltung',
    summary: 'OR 957 ff., KMU-Kontenrahmen, MWST, Lohnbuchungen, Abschluss.',
  },
  summary: 'Tenir des comptes, passer les écritures courantes et comptabiliser un salaire. Entraînement pour les métiers RH, pas un examen officiel.',
  tracks: ['certificat', 'brevet-base'],
  hrse: 'Utile au certificat (salaires, administration) et au brevet (Base 1). Ceci n’est pas une épreuve HRSE.',
  laws: ['CO', 'LTVA', 'LAVS', 'LPP'],
};

/** Sujets sans chiffre fédéral unique. Le texte des leçons et des explications doit les nommer. */
export const ACCOUNTING_UNVERIFIED = [
  'taux de la dette fiscale nette',
  'taux LAA',
  'LAAC',
  'indemnité journalière',
  'part LPP du salarié',
  'impôt à la source',
  'allocations familiales cantonales',
  'numéros de comptes',
  'réserves latentes',
  'associations et fondations',
  'contrôle ordinaire',
] as const;

function lesson(row: Lesson): Lesson {
  return row;
}

export const accountingLessons: Lesson[] = [
  lesson({
    id: 'cpta-obligation',
    competenceId: 'compta',
    minutes: 5,
    concept: 'Le CO dit qui doit une comptabilité complète et qui peut rester au simplifié.',
    de: { title: 'Buchführungspflicht' },
    checklist: ['Distinguer personne morale et entreprise personnelle', 'Citer le seuil de 500 000 francs', 'Ne pas conseiller une association sans le texte'],
    source: CO,
    screens: [
      {
        id: 's1',
        concept: 'Une personne morale tient une comptabilité et présente des comptes.',
        title: 'Qui est visé',
        body: 'L’article 957 du code des obligations vise les personnes morales, et les entreprises individuelles ou sociétés de personnes dont le chiffre d’affaires du dernier exercice dépasse 500 000 francs. En dessous de ce seuil, et hors personne morale, une comptabilité des recettes, des dépenses et de la fortune peut suffire. Les exceptions des associations et fondations se lisent dans le texte : à vérifier avant de conclure qu’une association est dispensée.',
      },
      {
        id: 's2',
        concept: 'La comptabilité simplifiée n’est pas un bilan au sens complet.',
        title: 'Recettes, dépenses, fortune',
        body: 'La forme allégée suit les encaissements et les décaissements, plus un état de la fortune. Elle ne remplace pas le bilan et le compte de résultat d’une société anonyme ou d’une Sàrl. Une entreprise qui le souhaite peut tenir la comptabilité complète même si le seuil n’est pas atteint. Le choix se note, il ne se devine pas.',
      },
      {
        id: 's3',
        concept: 'Les comptes montrent le patrimoine, le financement et le résultat.',
        title: 'À quoi servent les comptes',
        body: 'La présentation des comptes décrit la situation patrimoniale, financière et le résultat. Les principes de régularité (clarté, intégralité, prudence, permanence, pas de compensation entre actif et passif ni entre charges et produits) sont dans le CO. Cette leçon ne recopie pas l’article entier : le texte sur Fedlex fait foi. Le contrôle ordinaire des grandes entités dépend de seuils légaux : à vérifier à l’article prévu, sans apprendre un montant de mémoire.',
      },
    ],
  }),
  lesson({
    id: 'cpta-etats',
    competenceId: 'compta',
    minutes: 5,
    concept: 'Le bilan photographie le patrimoine. Le compte de résultat explique le bénéfice ou la perte.',
    de: { title: 'Bilanz und Erfolgsrechnung' },
    checklist: ['Écrire actif = passif', 'Placer le résultat dans les capitaux', 'Séparer charge et décaissement'],
    source: CO,
    screens: [
      {
        id: 's1',
        concept: 'L’actif est égal aux dettes plus les capitaux.',
        title: 'Le bilan',
        body: 'À gauche, ou en haut, l’actif : ce que l’entreprise possède ou ce qu’on lui doit (caisse, banque, débiteurs, stocks, machines). À droite, le passif : les dettes envers les tiers et les capitaux des propriétaires. L’égalité actif = passif est une identité, pas un objectif commercial. Un bénéfice non distribué augmente les capitaux. Une perte les diminue.',
      },
      {
        id: 's2',
        concept: 'Le compte de résultat additionne les produits et les charges de la période.',
        title: 'Le résultat',
        body: 'Le compte de résultat ne dit pas ce qu’il reste en banque. Il dit si les produits de la période couvrent les charges. Un achat de machine est un actif, pas une charge du jour. L’amortissement, lui, est une charge. Le bénéfice ou la perte revient au bilan, dans les capitaux. Présenter par nature (personnel, marchandises, autres charges) est le réflexe usuel du CO.',
      },
      {
        id: 's3',
        concept: 'Une charge n’est pas toujours un paiement, et inversement.',
        title: 'Période et caisse',
        body: 'Payer d’avance un loyer ne fait pas de toute la somme une charge de décembre. Encaisser un client ne crée pas le produit : le produit est né à la facture, si la vente est déjà réalisée. C’est pour cela que le bouclement pose des actifs et des passifs transitoires. Sans cette coupe de fin d’année, le résultat mélange deux exercices.',
      },
    ],
  }),
  lesson({
    id: 'cpta-plan',
    competenceId: 'compta',
    minutes: 6,
    concept: 'Le plan comptable PME range les comptes en neuf classes. La loi n’impose pas les numéros.',
    de: { title: 'Kontenrahmen und doppelte Buchhaltung' },
    checklist: ['Nommer les classes 1 à 9', 'Débiter une charge, créditer un produit', 'Passer du journal au grand livre'],
    source: CO,
    screens: [
      {
        id: 's1',
        concept: 'Les classes 1 à 9 séparent le bilan, l’exploitation et la clôture.',
        title: 'Plan comptable PME',
        body: 'L’usage suisse, enseigné avec le plan comptable PME, range ainsi : 1 actifs, 2 passifs, 3 produits des ventes et des prestations, 4 charges de marchandises et de prestations de tiers, 5 charges de personnel, 6 autres charges d’exploitation, amortissements et résultat financier, 7 résultat accessoire, 8 résultat hors exploitation et impôts, 9 clôture. Les numéros de comptes détaillés (1020, 1100, 5000) sont ceux du plan usuel, pas une obligation légale : le plan de l’entreprise fait foi.',
      },
      {
        id: 's2',
        concept: 'Chaque écriture a le même total au débit et au crédit.',
        title: 'Partie double',
        body: 'Un compte d’actif ou de charge augmente au débit et diminue au crédit. Un compte de passif, de capitaux ou de produit augmente au crédit et diminue au débit. Apporter 10 000 francs sur le compte banque : débit 1020 Banque, crédit 2800 Capital. Les deux côtés font 10 000. Si les totaux diffèrent, l’écriture est fausse, même si l’histoire commerciale est juste.',
      },
      {
        id: 's3',
        concept: 'Le journal enregistre dans l’ordre. Le grand livre classe par compte.',
        title: 'Journal et grand livre',
        body: 'Le journal reçoit les écritures au fil des pièces, avec la date et le libellé. Le grand livre reprend les mêmes montants, compte par compte, pour obtenir le solde. On ne choisit pas l’un ou l’autre : le grand livre est le classement du journal. Le bilan et le compte de résultat se lisent ensuite sur ces soldes, après les écritures de bouclement.',
      },
    ],
  }),
  lesson({
    id: 'cpta-tva',
    competenceId: 'compta',
    minutes: 6,
    concept: 'La TVA suisse se calcule sur le prix hors taxe. La méthode effective déduit l’impôt préalable.',
    de: { title: 'MWST, Debitoren, Kreditoren' },
    checklist: ['Citer 8,1 %, 2,6 % et 3,8 %', 'Séparer méthode effective et taux forfaitaire', 'Équilibrer une facture de vente'],
    source: LTVA,
    screens: [
      {
        id: 's1',
        concept: 'Depuis 2024, les trois taux sont 8,1 %, 2,6 % et 3,8 %.',
        title: 'Les taux',
        body: 'Le taux normal est 8,1 %. Le taux réduit est 2,6 % (denrées, médicaments, livres et journaux, selon la liste légale). Le taux spécial de l’hébergement est 3,8 %. Ils s’appliquent depuis le 1er janvier 2024 et restent les taux enseignés pour 2026. Sur 1 000 francs hors taxe au taux normal, la TVA est 81 francs et le TTC est 1 081 francs. Le seuil d’assujettissement se lit dans la LTVA : à vérifier sur le texte du jour avant d’immatriculer une entreprise.',
        figureId: 'tva_normale',
      },
      {
        id: 's2',
        concept: 'La méthode effective déduit l’impôt préalable. Le taux de la dette fiscale nette est un forfait de branche.',
        title: 'Effective ou forfait',
        body: 'Méthode effective : TVA facturée aux clients, moins l’impôt préalable payé aux fournisseurs, selon les pièces. Le taux de la dette fiscale nette applique un pourcentage au chiffre d’affaires et ne déduit en principe pas l’impôt préalable. Ce pourcentage dépend de la branche et de l’autorisation : le taux de la dette fiscale nette est à vérifier auprès de l’AFC, il n’est pas un taux unique comme 8,1 %.',
      },
      {
        id: 's3',
        concept: 'La facture met le client ou le fournisseur au bilan, pas seulement la vente.',
        title: 'Débiteurs, créanciers, banque',
        body: 'Vente de 1 000 hors taxe, TVA 8,1 % : débit 1100 Débiteurs 1 081, crédit 3000 Ventes 1 000, crédit 2200 TVA due 81. Achat de marchandises 200 hors taxe : débit 4000 Achats 200, débit 1170 Impôt préalable 16.20, crédit 2000 Créanciers 216.20. Payer ce fournisseur : débit 2000, crédit 1020 Banque. Les numéros de comptes sont ceux du plan usuel.',
      },
    ],
  }),
  lesson({
    id: 'cpta-salaires',
    competenceId: 'compta',
    minutes: 6,
    concept: 'Le brut devient un net et des dettes. L’employeur a en plus ses propres charges.',
    de: { title: 'Lohnverbuchung' },
    checklist: ['Calculer AVS 5,3 % et AC 1,1 %', 'Séparer part employé et part employeur', 'Laisser LPP, LAA et l’impôt source à vérifier'],
    source: OFAS,
    screens: [
      {
        id: 's1',
        concept: 'Seuls AVS/AI/APG et AC ont ici un taux 2026 déjà chiffré.',
        title: 'Du brut au net',
        body: 'Sur un brut de 6 500 francs, la part salariée AVS/AI/APG à 5,3 % fait 344.50 francs, et l’AC à 1,1 % fait 71.50 francs. Le net de cet exemple, sans autre retenue, est 6 084 francs. La part employeur de ces deux assurances est égale : encore 416 francs, mais en charge, pas en retenue. La part LPP du salarié dépend du règlement de caisse. Le taux LAA, la LAAC, l’indemnité journalière et l’impôt à la source sont à vérifier : pas de taux fédéral unique dans cette leçon.',
        figureId: 'avs_ai_apg',
      },
      {
        id: 's2',
        concept: 'Le salaire passe par une charge, la banque et une dette sociale.',
        title: 'L’écriture',
        body: 'Part employé, sur 6 500 : débit 5000 Salaires 6 500, crédit 1020 Banque 6 084, crédit 2270 Dettes AVS/AC 416. Part employeur : débit 5700 Charges sociales 416, crédit 2270 encore 416. La dette 2270 totale envers les assurances est donc 832 francs pour AVS/AI/APG et AC seulement. Les allocations familiales cantonales et leur remboursement par la caisse ne sont pas dans cette écriture : à vérifier selon le canton.',
      },
      {
        id: 's3',
        concept: 'Le 13e salaire et les vacances dues se provisionnent avant le paiement.',
        title: '13e et vacances',
        body: 'Un 13e de 6 000 francs sur l’année se provisionne de 500 francs par mois : débit 5000, crédit 2300 Passifs transitoires, jusqu’au paiement. Quatre jours de vacances dus à 250 francs, soit 1 000 francs, suivent le même schéma en fin de période. Au paiement du 13e, on débite la provision et on crédite la banque et les dettes sociales, comme pour un salaire. Sans contrat, le 13e n’est pas automatique.',
      },
    ],
  }),
  lesson({
    id: 'cpta-bouclement',
    competenceId: 'compta',
    minutes: 5,
    concept: 'Le bouclement répartit les coûts sur l’exercice : amortissements, provisions, transitoires.',
    de: { title: 'Abschluss' },
    checklist: ['Amortir en linéaire un coût connu', 'Distinguer actif et passif transitoire', 'Ne pas inscrire une réserve latente au bilan'],
    source: CO,
    screens: [
      {
        id: 's1',
        concept: 'L’amortissement étale le coût d’un actif sur sa durée d’usage.',
        title: 'Amortissements',
        body: 'Une machine de 10 000 francs utilisée cinq ans, sans valeur résiduelle convenue dans cet exemple, donne 2 000 francs par an. Écriture : débit 6800 Amortissements 2 000, crédit du compte de la machine en diminution 2 000. La charge est au compte de résultat. L’actif du bilan baisse. La durée réelle et le mode (linéaire ou dégressif) se choisissent dans la fourchette admise : le pourcentage fiscal précis est à vérifier, il n’est pas repris ici.',
      },
      {
        id: 's2',
        concept: 'Une provision ou un transitoire rattache la charge ou le produit à la bonne année.',
        title: 'Provisions et transitoires',
        body: 'Une charge probable et un montant estimable peuvent devenir une provision : débit d’une charge, crédit d’un compte de provision au passif. Un loyer payé en décembre pour janvier est un actif transitoire, pas une charge de décembre. Une facture de décembre reçue en janvier est un passif transitoire. On contre-passe ou on solde ces comptes à l’exercice suivant, quand la pièce arrive.',
      },
      {
        id: 's3',
        concept: 'Une réserve latente est un écart prudent, pas une ligne du bilan.',
        title: 'Réserves latentes',
        body: 'Sous le principe de prudence du CO, un actif peut être évalué plus bas, ou une provision plus haute, que la valeur la plus fine. L’écart s’appelle réserve latente. Il n’a pas de poste propre : on ne le voit pas en lisant le bilan. Les réserves ouvertes, elles, viennent du bénéfice laissé dans les capitaux et s’affichent. Les limites fiscales des réserves latentes sont à vérifier : cette leçon n’en donne pas un pourcentage.',
      },
    ],
  }),
];

export type AccountingQuestion = {
  id: string;
  prompt: string;
  options?: string[];
  answer: number | boolean | string[];
  explain: string;
  kind: 'single' | 'boolean' | 'order';
  steps?: { id: string; label: string }[];
  unverified?: boolean;
  expectCents?: number;
  entry?: JournalEntry;
};

function formatEntry(entry: JournalEntry): string {
  const debit = entry.debit.map((line) => `Débit ${line.account} ${formatChfCents(line.cents)}`).join(', ');
  const credit = entry.credit.map((line) => `Crédit ${line.account} ${formatChfCents(line.cents)}`).join(', ');
  return `${debit}. ${credit}.`;
}

function place(id: string, correct: string, wrong: string[]): { options: string[]; answer: number } {
  const slot = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % (wrong.length + 1);
  const options = [...wrong];
  options.splice(slot, 0, correct);
  return { options, answer: options.indexOf(correct) };
}

function single(id: string, prompt: string, correct: string, wrong: string[], explain: string, extra: Partial<AccountingQuestion> = {}): AccountingQuestion {
  const placed = place(id, correct, wrong);
  return { id, kind: 'single', prompt, explain, ...placed, ...extra };
}

function yesNo(id: string, prompt: string, answer: boolean, explain: string, unverified = false): AccountingQuestion {
  return { id, kind: 'boolean', prompt, answer, explain, unverified };
}

const sale = saleEntry(100_000, 81);
const purchase = purchaseEntry(20_000, 81);
const paySupplier = paymentEntry('2000 Créanciers', purchase.credit[0].cents);
const collect = paymentEntry('1100 Débiteurs', sale.debit[0].cents);
const pay = sourcedPayroll(650_000);
const payroll = payrollEntries(650_000);
const depreciation = depreciationEntry(linearDepreciation(1_000_000, 5));
const thirteenth = provisionEntry('5000 Salaires', monthlyShare(600_000));
const vacation = provisionEntry('5800 Charges de personnel', 100_000);

function entryChoice(id: string, prompt: string, entry: JournalEntry, explain: string): AccountingQuestion {
  return single(id, prompt, formatEntry(entry), [
    formatEntry({ debit: entry.credit, credit: entry.debit }),
    'Une seule ligne, au crédit de 3000 Ventes, sans contrepartie.',
    'Écriture seulement orale, sans journal.',
  ], explain, { entry });
}

export const accountingQuestions: AccountingQuestion[] = [
  single('b1', 'Qui doit tenir une comptabilité complète et présenter des comptes selon l’art. 957 CO ?', 'Les personnes morales, et les entreprises personnelles au-dessus de 500 000 francs de chiffre d’affaires.', ['Seulement les sociétés cotées en bourse.', 'Toutes les associations, sans exception à lire.', 'Aucune entreprise de moins de dix employés.'], 'L’art. 957 CO vise les personnes morales et, pour les entreprises individuelles et sociétés de personnes, le seuil de 500 000 francs. Les associations et fondations : à vérifier dans le texte.'),
  yesNo('b2', 'Une entreprise individuelle sous 500 000 francs de chiffre d’affaires peut se limiter aux recettes, aux dépenses et à la fortune.', true, 'C’est la comptabilité simplifiée de l’art. 957 CO, si elle n’est pas une personne morale.'),
  single('b3', 'Que montre le bilan ?', 'L’actif, égal aux dettes plus les capitaux.', ['Uniquement le solde bancaire du jour.', 'Seulement les produits de l’année.', 'Le nombre d’employés.'], 'Le bilan est l’égalité actif = passif. Le résultat de l’année y rejoint les capitaux.'),
  yesNo('b4', 'Une charge de l’exercice est toujours égale au paiement fait le même jour.', false, 'Paiement d’avance et charge à payer se règlent avec les transitoires. Le compte de résultat suit la période, pas seulement la caisse.'),
  single('b5', 'Dans le plan comptable PME usuel, la classe 5 regroupe…', 'Les charges de personnel.', ['Les dettes.', 'Les ventes.', 'La clôture.'], 'Classe 1 actifs, 2 passifs, 3 produits, 4 marchandises, 5 personnel. Les numéros de comptes détaillés restent ceux du plan de l’entreprise.'),
  single('b6', 'Dans le plan comptable PME usuel, la classe 1 regroupe…', 'Les actifs.', ['Les produits.', 'Les charges de personnel.', 'Les impôts extraordinaires.'], 'La classe 1 est celle des actifs : caisse, banque, débiteurs, stocks, machines.'),
  yesNo('b7', 'Une charge augmente en principe au débit.', true, 'Actifs et charges augmentent au débit. Passifs, capitaux et produits augmentent au crédit.'),
  yesNo('b8', 'Un produit augmente en principe au débit.', false, 'Un produit augmente au crédit. Le débit d’un compte de produit le diminue.'),
  single('b9', 'Apport de 10 000 francs sur le compte banque à la création. Écriture ?', 'Débit 1020 Banque 10\'000.00. Crédit 2800 Capital 10\'000.00.', ['Débit 2800 Capital 10\'000.00. Crédit 1020 Banque 10\'000.00.', 'Débit 5000 Salaires 10\'000.00. Crédit 1020 Banque 10\'000.00.', 'Aucune écriture tant que le premier salaire n’est pas payé.'], 'L’actif banque augmente au débit. Le capital augmente au crédit. Les deux côtés font 10 000.'),
  {
    id: 'b10',
    kind: 'order',
    prompt: 'Dans quel ordre traite-t-on une pièce comptable ?',
    steps: [
      { id: 'j', label: 'Journal' },
      { id: 'g', label: 'Grand livre' },
      { id: 'e', label: 'Bilan et compte de résultat' },
    ],
    answer: ['j', 'g', 'e'],
    explain: 'Le journal enregistre. Le grand livre classe par compte. Les états se lisent sur les soldes.',
  },
  yesNo('b11', 'Le plan comptable PME est un numéro légal obligatoire pour chaque entreprise.', false, 'C’est un plan usuel. Les numéros de comptes détaillés se vérifient dans le plan de l’entreprise.'),
  single('b12', 'Où se retrouve le bénéfice de l’exercice ?', 'Dans les capitaux du bilan.', ['Uniquement à la caisse.', 'Dans la classe 4.', 'Il disparaît à la clôture.'], 'Le résultat du compte de résultat modifie les capitaux. Il n’est pas un compte de caisse.'),

  single('f1', 'TVA normale sur 1 000 francs hors taxe, taux depuis 2024.', formatChfCents(vatOnNet(100_000, 81).tax), [formatChfCents(2_600), formatChfCents(3_800), formatChfCents(100_000)], '8,1 % de 1 000 font 81.00. Taux en vigueur depuis le 1.1.2024.', { expectCents: 8_100 }),
  single('f2', 'TVA réduite sur 1 000 francs hors taxe.', formatChfCents(vatOnNet(100_000, 26).tax), [formatChfCents(8_100), formatChfCents(3_800), formatChfCents(1_000)], '2,6 % de 1 000 font 26.00.', { expectCents: 2_600 }),
  single('f3', 'TVA hébergement sur 1 000 francs hors taxe.', formatChfCents(vatOnNet(100_000, 38).tax), [formatChfCents(8_100), formatChfCents(2_600), formatChfCents(10_000)], '3,8 % de 1 000 font 38.00.', { expectCents: 3_800 }),
  single('f4', 'Que fait la méthode effective de TVA ?', 'Elle déduit l’impôt préalable de la TVA facturée.', ['Elle applique un taux de branche sans regarder les factures d’achat.', 'Elle supprime la TVA sur les salaires.', 'Elle ne concerne que les associations.'], 'Méthode effective : TVA due moins impôt préalable, sur pièces.'),
  single('f5', 'Où trouve-t-on le taux de la dette fiscale nette d’une entreprise ?', 'Dans l’autorisation de branche de l’AFC, à vérifier.', ['Il est toujours 8,1 %.', 'Il est toujours 2,6 %.', 'Il est fixé par le contrat de travail.'], 'Le taux de la dette fiscale nette n’est pas un taux unique. Il est à vérifier.'),
  entryChoice('f6', 'Vente de marchandises 1 000 francs hors taxe, TVA normale. Écriture ?', sale, 'Débiteurs au TTC, ventes hors taxe, TVA due pour l’écart.'),
  entryChoice('f7', 'Achat de marchandises 200 francs hors taxe, TVA normale. Écriture ?', purchase, 'Achats et impôt préalable au débit, créanciers au TTC.'),
  entryChoice('f8', 'Paiement du fournisseur de cet achat, par la banque.', paySupplier, 'On solde les créanciers et on crédite la banque.'),
  entryChoice('f9', 'Encaissement du client de cette vente, à la banque.', collect, 'La banque augmente. Les débiteurs diminuent.'),
  yesNo('f10', 'Les débiteurs sont un actif.', true, 'La classe 1 du plan usuel porte les débiteurs : un client nous doit de l’argent.'),
  yesNo('f11', 'Les créanciers sont un produit.', false, 'Les créanciers sont une dette, au passif. Le produit est la vente, pas la dette fournisseur.'),
  yesNo('f12', 'L’impôt préalable est, dans le plan usuel, un compte d’actif.', true, 'Le compte 1170 diminue la TVA à payer. Ce n’est pas une charge définitive si la déduction est admise.'),

  single('s1', 'Part salariée AVS/AI/APG sur un brut de 6 500 francs, taux 5,3 %.', formatChfCents(pay.avs), [formatChfCents(pay.ac), formatChfCents(pay.net), formatChfCents(650_000)], '5,3 % de 6 500 font 344.50. Chiffre OFAS 2026 déjà dans les fiches.', { expectCents: pay.avs }),
  single('s2', 'Part salariée AC sur un brut de 6 500 francs, taux 1,1 %, sous le plafond.', formatChfCents(pay.ac), [formatChfCents(pay.avs), formatChfCents(41_600), formatChfCents(0)], '1,1 % de 6 500 font 71.50. Le plafond annuel AC est une autre question si le brut annuel le dépasse.', { expectCents: pay.ac }),
  single('s3', 'Net de 6 500 francs si l’on retient seulement AVS/AI/APG et AC.', formatChfCents(pay.net), [formatChfCents(650_000), formatChfCents(pay.employee), formatChfCents(pay.avs)], '6 500 moins 344.50 moins 71.50 font 6 084.00. Sans LPP, LAA ni impôt à la source.', { expectCents: pay.net }),
  yesNo('s4', 'La part employeur AVS/AI/APG et AC est égale à la part salariée, dans les taux de cette leçon.', true, 'Les fiches OFAS 2026 indiquent une part égale. Ce n’est pas vrai de la LPP ni de la LAA.'),
  single('s5', 'Comment obtient-on la part LPP du salarié sur la fiche ?', 'Dans le règlement de caisse, à vérifier.', ['Toujours 5,3 % du brut.', 'Toujours 1,1 % du brut.', 'Elle est nulle dans toutes les entreprises.'], 'La part LPP du salarié n’a pas de taux fédéral unique. Elle est à vérifier.'),
  single('s6', 'Quel taux LAA passe-t-on dans l’écriture sans autre information ?', 'Aucun : le taux LAA est à vérifier auprès de l’assureur.', ['8,1 %.', '5,3 %.', '2,6 %.'], 'Le taux LAA dépend de l’assureur et de l’entreprise. Il est à vérifier.'),
  single('s7', 'L’indemnité journalière maladie a-t-elle un taux fédéral unique à comptabiliser ?', 'Non. Police, CCT ou maintien du salaire : à vérifier.', ['Oui, 8,1 % du brut.', 'Oui, 5,3 % du brut.', 'Oui, elle est toujours nulle.'], 'L’indemnité journalière n’a pas un taux unique dans cette leçon. À vérifier.'),
  single('s8', 'L’impôt à la source se comptabilise…', 'Selon le barème cantonal, à vérifier, en dette envers le fisc.', ['Au taux unique de 8,1 %.', 'Comme une vente.', 'Il ne se comptabilise jamais.'], 'L’impôt à la source est une retenue puis un versement. Le barème est à vérifier.'),
  entryChoice('s9', 'Écriture du salaire de 6 500 francs, seulement AVS/AI/APG et AC, part employé.', payroll.employee, 'Charge au brut, banque au net, dette sociale pour la retenue.'),
  entryChoice('s10', 'Écriture de la part employeur AVS/AI/APG et AC sur ce même brut.', payroll.employer, 'Charges sociales au débit, même montant au crédit de la dette AVS/AC.'),
  single('s11', 'Provision mensuelle d’un 13e salaire de 6 000 francs sur l’année.', formatChfCents(monthlyShare(600_000)), [formatChfCents(600_000), formatChfCents(5_000), formatChfCents(0)], '6 000 divisés par 12 font 500.00, si le 13e est dû.', { expectCents: 50_000 }),
  single('s12', 'Les allocations familiales cantonales versées puis récupérées…', 'Suivent la caisse du canton : schéma à vérifier.', ['Sont toujours une vente de la classe 3.', 'Sont de la TVA à 8,1 %.', 'Ne concernent jamais l’employeur.'], 'Le minimum fédéral existe dans les fiches. Les allocations familiales cantonales et le remboursement : à vérifier.'),

  single('c1', 'Amortissement linéaire d’une machine de 10 000 francs sur cinq ans, sans valeur résiduelle.', formatChfCents(linearDepreciation(1_000_000, 5)), [formatChfCents(1_000_000), formatChfCents(100_000), formatChfCents(8_100)], '10 000 divisés par 5 font 2 000.00 par an dans cet exemple.', { expectCents: 200_000 }),
  entryChoice('c2', 'Écriture de cet amortissement annuel de 2 000 francs.', depreciation, 'La charge 6800 augmente. L’actif machine diminue du même montant.'),
  yesNo('c3', 'Constituer une provision débite une charge et crédite un compte de passif.', true, 'La provision augmente une charge et une dette estimée. On ne crédite pas une vente.'),
  single('c4', 'Un loyer de janvier payé en décembre est…', 'Un actif transitoire.', ['Une charge définitive de décembre.', 'Une réserve latente.', 'De la TVA.'], 'Le paiement d’avance n’est pas consommé en décembre. On le met à l’actif transitoire.'),
  single('c5', 'Une facture de téléphone de décembre, reçue en janvier, est…', 'Un passif transitoire si la charge appartient à décembre.', ['Un produit de janvier.', 'Un apport de capital.', 'Une vente.'], 'La charge de décembre se comptabilise même si la pièce arrive après, via un passif transitoire.'),
  single('c6', 'Une réserve latente…', 'N’a pas de poste propre au bilan.', ['Est un compte de la classe 3.', 'Est toujours égale à 8,1 % des actifs.', 'Se verse aux employés.'], 'C’est un écart d’évaluation prudent. Les limites fiscales des réserves latentes sont à vérifier.'),
  yesNo('c7', 'Une réserve ouverte vient du bénéfice laissé dans les capitaux et s’affiche au bilan.', true, 'Réserve ouverte et réserve latente ne se lisent pas de la même façon. L’ouverte est un poste de capitaux.'),
  single('c8', 'Le contrôle ordinaire d’une grande entité…', 'Dépend de seuils légaux à vérifier, sans montant inventé ici.', ['Est obligatoire pour toute raison individuelle.', 'Est un taux de TVA.', 'Remplace le bilan.'], 'Le contrôle ordinaire a des seuils. Ils sont à vérifier dans la loi, pas à mémoriser depuis cette leçon.'),
];

const examPay = sourcedPayroll(400_000);
const examSale = saleEntry(200_000, 81);

export const accountingExamQuestions: AccountingQuestion[] = [
  single('e1', 'Entraînement. Une Sàrl doit-elle présenter des comptes complets ?', 'Oui, c’est une personne morale au sens de l’art. 957 CO.', ['Non, jamais.', 'Seulement si elle a plus de 500 employés.', 'Seulement si elle vend des marchandises à 2,6 %.'], 'Personne morale : comptabilité et comptes. Ce n’est pas un sujet d’examen officiel.'),
  single('e2', 'Entraînement. TVA normale sur 2 000 francs hors taxe.', formatChfCents(vatOnNet(200_000, 81).tax), [formatChfCents(5_200), formatChfCents(7_600), formatChfCents(200_000)], '8,1 % de 2 000 font 162.00.', { expectCents: vatOnNet(200_000, 81).tax }),
  entryChoice('e3', 'Entraînement. Écriture d’une vente de 2 000 francs hors taxe, TVA normale.', examSale, 'Même schéma que la leçon : débiteurs TTC, ventes hors taxe, TVA due.'),
  single('e4', 'Entraînement. Net d’un brut de 4 000 francs avec seulement AVS/AI/APG 5,3 % et AC 1,1 %.', formatChfCents(examPay.net), [formatChfCents(400_000), formatChfCents(examPay.avs), formatChfCents(0)], 'Retenues 212.00 + 44.00. Net 3 744.00. Sans LPP ni impôt à la source.', { expectCents: examPay.net }),
  yesNo('e5', 'Entraînement. La part employeur AVS/AI/APG de cet exemple est égale à la part salariée.', true, 'Taux des fiches OFAS : parts égales. Ce n’est pas une note d’expert.'),
  single('e6', 'Entraînement. Amortissement linéaire, machine 10 000 francs, cinq ans, sans valeur résiduelle.', formatChfCents(200_000), [formatChfCents(1_000_000), formatChfCents(8_100), formatChfCents(50_000)], '2 000 francs par an dans l’exemple de la leçon.'),
  single('e7', 'Entraînement. Où voit-on une réserve latente dans le bilan publié ?', 'On ne la voit pas comme un poste.', ['Au compte 3000.', 'Dans la TVA due.', 'Elle est toujours le 13e salaire.'], 'Pas de ligne « réserve latente ». Les limites fiscales sont à vérifier.'),
  {
    id: 'e8',
    kind: 'order',
    prompt: 'Entraînement. Ordre de fin d’exercice pour une charge à payer.',
    steps: [
      { id: 'p', label: 'Constater le passif transitoire' },
      { id: 'r', label: 'Lire le résultat' },
      { id: 's', label: 'Solder quand la facture arrive l’année suivante' },
    ],
    answer: ['p', 'r', 's'],
    explain: 'On rattache la charge à l’exercice, on lit le résultat, on solde le transitoire à la pièce.',
  },
];

function toItem(question: AccountingQuestion): DrillItem {
  if (question.kind === 'boolean') {
    return { id: question.id, type: 'boolean', prompt: question.prompt, answer: question.answer as boolean, explain: question.explain };
  }
  if (question.kind === 'order') {
    return {
      id: question.id,
      type: 'order',
      prompt: question.prompt,
      steps: question.steps ?? [],
      answer: question.answer as string[],
      explain: question.explain,
    };
  }
  return {
    id: question.id,
    type: 'single',
    prompt: question.prompt,
    options: question.options ?? [],
    answer: question.answer as number,
    explain: question.explain,
  };
}

function drill(id: string, title: string, de: string, minutes: number, source: SourceRef, ids: string[]): Drill {
  return {
    id,
    competenceId: 'compta',
    title,
    de: { title: de },
    minutes,
    source,
    items: ids.map((itemId) => {
      const question = accountingQuestions.find((item) => item.id === itemId);
      if (!question) throw new Error(itemId);
      return toItem(question);
    }),
  };
}

export const accountingDrills: Drill[] = [
  drill('d-cpta-bases', 'Comptes et partie double', 'Konten und Buchungssatz', 6, CO, ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12']),
  drill('d-cpta-flux', 'TVA, clients et fournisseurs', 'MWST und Kontokorrent', 6, LTVA, ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12']),
  drill('d-cpta-salaires', 'Écritures de salaire', 'Lohnbuchungen', 6, OFAS, ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12']),
  drill('d-cpta-cloture', 'Bouclement', 'Abschlussbuchungen', 5, CO, ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']),
];

export const accountingCards: CardItem[] = [
  { id: 'cpta-c1', competenceId: 'compta', front: 'Qui présente des comptes complets selon l’art. 957 CO ?', back: 'Les personnes morales, et les entreprises personnelles au-dessus de 500 000 francs de chiffre d’affaires.', de: { front: 'Wer muss eine vollständige Rechnung legen?' }, source: CO },
  { id: 'cpta-c2', competenceId: 'compta', front: 'Égalité du bilan ?', back: 'Actif = dettes + capitaux.', de: { front: 'Bilanzgleichung?' }, source: CO },
  { id: 'cpta-c3', competenceId: 'compta', front: 'Classe 5 du plan PME usuel ?', back: 'Charges de personnel. Les numéros détaillés ne sont pas une loi.', de: { front: 'Klasse 5?' }, source: CO },
  { id: 'cpta-c4', competenceId: 'compta', front: 'Taux normal de TVA depuis 2024 ?', back: '8,1 %. Réduit 2,6 %. Hébergement 3,8 %.', de: { front: 'Normalsatz MWST?' }, source: LTVA },
  { id: 'cpta-c5', competenceId: 'compta', front: 'Part salariée AVS/AI/APG en 2026 dans les fiches ?', back: '5,3 %, part employeur égale. L’AC salariée est 1,1 % jusqu’au plafond.', de: { front: 'AHV/IV/EO-Abzug?' }, source: OFAS },
  { id: 'cpta-c6', competenceId: 'compta', front: 'Une réserve latente est-elle un poste du bilan ?', back: 'Non. C’est un écart d’évaluation. Les limites fiscales sont à vérifier.', de: { front: 'Stille Reserve in der Bilanz?' }, source: CO },
];

export const accountingExams: ExamSim[] = [
  {
    id: 'ex-compta',
    title: 'Entraînement comptabilité — écritures et salaires',
    de: { title: 'Übungsprüfung Buchhaltung' },
    format: 'certificat-ecrit',
    minutes: 15,
    track: 'certificat',
    intro: 'Huit questions chronométrées sur les écritures vues dans les leçons. Ce n’est pas un sujet HRSE et cela ne délivre aucun titre.',
    source: CO,
    items: accountingExamQuestions.map(toItem),
  },
];

export const accountingBank = [...accountingQuestions, ...accountingExamQuestions];
