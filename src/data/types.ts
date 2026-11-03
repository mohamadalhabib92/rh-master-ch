import type { Lang } from '../i18n/strings';

export type T4 = { fr: string } & Partial<Record<Exclude<Lang, 'fr'>, string>>;
export type QText = { q: string; o: string[]; e: string };

/** Choix unique, choix multiple, vrai/faux, calcul, cas. */
export type QuestionType = 'single' | 'multiple' | 'boolean' | 'calc' | 'case';

/**
 * « valide » seulement après relecture de Mohamed.
 * Le contenu embarqué historique reste « a_valider » : il n'est pas présenté comme validé.
 */
export type QuestionStatus = 'valide' | 'a_valider';

/**
 * Schéma de question. Les champs ajoutés sont optionnels à l'écriture
 * et remplis à la lecture (modules.ts) sans changer les id existants.
 * theme et difficulty restent absents tant qu'ils ne figurent pas dans la source :
 * aucune valeur inventée.
 */
export type Question = {
  id: string;
  /** Index de la bonne réponse (choix unique historique). */
  a: number;
  /** Code de loi déjà présent dans l'app (CO, LTr…). */
  law: string;
  fr: QText;
  moduleId?: string;
  theme?: string;
  difficulty?: 1 | 2 | 3;
  type?: QuestionType;
  /** Nom de loi déjà présent, ou YOUR_LEGAL_SOURCE. */
  source?: string;
  status?: QuestionStatus;
} & Partial<Record<Exclude<Lang, 'fr'>, QText>>;
export type Module = {
  id: string;
  n: number;
  icon: string;
  title: T4;
  laws: string[];
  points: { fr: string[] } & Partial<Record<Exclude<Lang, 'fr'>, string[]>>;
  questions: Question[];
};

/** [question, options, index bonne réponse, explication, loi] — FR. */
export type QRow = [string, string[], number, string, string];

export function qs(prefix: string, rows: QRow[]): Question[] {
  return rows.map(([q, o, a, e, law], i) => ({ id: `${prefix}-${i + 1}`, a, law, fr: { q, o, e } }));
}

export function pick<T>(obj: { fr: T } & Partial<Record<string, T>>, lang: Lang): { value: T; fallback: boolean } {
  const v = obj[lang];
  return v !== undefined ? { value: v as T, fallback: false } : { value: obj.fr, fallback: lang !== 'fr' };
}
