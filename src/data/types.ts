import type { Lang } from '../i18n/strings';

export type T4 = { fr: string } & Partial<Record<Exclude<Lang, 'fr'>, string>>;
export type QText = { q: string; o: string[]; e: string };
export type Question = { id: string; a: number; law: string; fr: QText } & Partial<Record<Exclude<Lang, 'fr'>, QText>>;
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
