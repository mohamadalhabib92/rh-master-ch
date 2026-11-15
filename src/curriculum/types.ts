export type FigureStatus = 'verified' | 'a_verifier';

export type Figure = {
  id: string;
  label: string;
  validYear: number;
  value: number | null;
  unit: string;
  source: string;
  url: string;
  consultedAt: string;
  status: FigureStatus;
  note: string;
};

export type SourceRef = {
  name: string;
  url: string;
  consultedAt: string;
};

export type ScreenBlock = {
  id: string;
  concept: string;
  title: string;
  body: string;
  figureId?: string;
};

export type Lesson = {
  id: string;
  competenceId: string;
  minutes: number;
  concept: string;
  de: { title: string };
  screens: ScreenBlock[];
  checklist: string[];
  source: SourceRef;
};

export type CardItem = {
  id: string;
  competenceId: string;
  front: string;
  back: string;
  de: { front: string };
  figureId?: string;
  source: SourceRef;
};

export type DrillItem =
  | { id: string; type: 'boolean'; prompt: string; answer: boolean; explain: string; figureId?: string }
  | { id: string; type: 'single'; prompt: string; options: string[]; answer: number; explain: string; figureId?: string }
  | { id: string; type: 'order'; prompt: string; steps: { id: string; label: string }[]; answer: string[]; explain: string }
  | { id: string; type: 'match'; prompt: string; pairs: { id: string; left: string; right: string }[]; explain: string };

export type Drill = {
  id: string;
  competenceId: string;
  title: string;
  de: { title: string };
  minutes: number;
  items: DrillItem[];
  source: SourceRef;
};

export type RubricRow = { id: string; label: string; points: number };

export type CaseStudy = {
  id: string;
  competenceId: string;
  title: string;
  de: { title: string };
  minutes: number;
  prompt: string;
  modelAnswer: string;
  rubric: RubricRow[];
  source: SourceRef;
};

export type ExamSim = {
  id: string;
  title: string;
  de: { title: string };
  format: 'certificat-ecrit' | 'brevet-connaissances' | 'brevet-cas';
  minutes: number;
  track: string;
  intro: string;
  items: DrillItem[];
  caseId?: string;
  source: SourceRef;
};

export type Competence = {
  id: string;
  title: string;
  de: { title: string; summary: string };
  summary: string;
  tracks: string[];
  hrse: string;
  laws: string[];
};

export type Catalog = {
  catalogVersion: 1;
  consultedAt: string;
  localePrimary: 'fr';
  german: 'structure_ready';
  figures: Figure[];
  competences: Competence[];
  lessons: Lesson[];
  cards: CardItem[];
  drills: Drill[];
  cases: CaseStudy[];
  exams: ExamSim[];
};

export type Coverage = 'solid' | 'medium' | 'thin';
