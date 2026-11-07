/**
 * Calculs RH indicatifs — fonctions pures. Aucune garantie de conformité.
 * Les taux 2026 sourcés sont « à confirmer ». Sans source : valeur nulle et « à valider ».
 * Sources citées par le cahier : OFAS (sozialversicherungen.admin.ch) et OCAS, consultés le 31.10.2026.
 */

export type RateStatus = 'a_confirmer' | 'a_valider';
export type RateUnit = 'percent' | 'chf';

export type RateParam = {
  id: string;
  year: 2026;
  /** null = non sourcé, saisie manuelle uniquement. Jamais une valeur inventée. */
  value: number | null;
  unit: RateUnit;
  source: string;
  sourceUrl: string;
  consultedAt: string | null;
  status: RateStatus;
  /** employer = référence, non déduite du net. threshold = seuil LPP, non appliqué au brut → net. */
  kind: 'employee' | 'employer' | 'threshold' | 'manual';
};

const OFAS = 'OFAS (sozialversicherungen.admin.ch) et OCAS';
const OFAS_URL = 'https://www.sozialversicherungen.admin.ch/';
const CONSULTED = '2026-10-31';
const UNSOURCED = 'YOUR_RATE_SOURCE';

export const RATE_YEAR = 2026 as const;

/** Cinq calculateurs. L'ordre est celui des onglets. */
export const CALCULATOR_IDS = ['net', 'vac', 'ot', 'notice', 'prot'] as const;

export const RATE_PARAMS: RateParam[] = [
  { id: 'avs_ai_apg_employee', year: 2026, value: 5.3, unit: 'percent', source: OFAS, sourceUrl: OFAS_URL, consultedAt: CONSULTED, status: 'a_confirmer', kind: 'employee' },
  { id: 'avs_ai_apg_employer', year: 2026, value: 5.3, unit: 'percent', source: OFAS, sourceUrl: OFAS_URL, consultedAt: CONSULTED, status: 'a_confirmer', kind: 'employer' },
  { id: 'ac_employee', year: 2026, value: 1.1, unit: 'percent', source: OFAS, sourceUrl: OFAS_URL, consultedAt: CONSULTED, status: 'a_confirmer', kind: 'employee' },
  { id: 'ac_employer', year: 2026, value: 1.1, unit: 'percent', source: OFAS, sourceUrl: OFAS_URL, consultedAt: CONSULTED, status: 'a_confirmer', kind: 'employer' },
  { id: 'ac_ceiling', year: 2026, value: 148200, unit: 'chf', source: OFAS, sourceUrl: OFAS_URL, consultedAt: CONSULTED, status: 'a_confirmer', kind: 'employee' },
  { id: 'lpp_entry', year: 2026, value: 22680, unit: 'chf', source: OFAS, sourceUrl: OFAS_URL, consultedAt: CONSULTED, status: 'a_confirmer', kind: 'threshold' },
  { id: 'lpp_coordination', year: 2026, value: 26460, unit: 'chf', source: OFAS, sourceUrl: OFAS_URL, consultedAt: CONSULTED, status: 'a_confirmer', kind: 'threshold' },
  { id: 'lpp_max_salary', year: 2026, value: 90720, unit: 'chf', source: OFAS, sourceUrl: OFAS_URL, consultedAt: CONSULTED, status: 'a_confirmer', kind: 'threshold' },
  { id: 'aanp', year: 2026, value: null, unit: 'percent', source: UNSOURCED, sourceUrl: UNSOURCED, consultedAt: null, status: 'a_valider', kind: 'manual' },
  { id: 'lpp_employee', year: 2026, value: null, unit: 'percent', source: UNSOURCED, sourceUrl: UNSOURCED, consultedAt: null, status: 'a_valider', kind: 'manual' },
  { id: 'laa', year: 2026, value: null, unit: 'percent', source: UNSOURCED, sourceUrl: UNSOURCED, consultedAt: null, status: 'a_valider', kind: 'manual' },
  { id: 'ijm', year: 2026, value: null, unit: 'percent', source: UNSOURCED, sourceUrl: UNSOURCED, consultedAt: null, status: 'a_valider', kind: 'manual' },
  { id: 'family_allowance', year: 2026, value: null, unit: 'chf', source: UNSOURCED, sourceUrl: UNSOURCED, consultedAt: null, status: 'a_valider', kind: 'manual' },
  { id: 'lpp_age', year: 2026, value: null, unit: 'percent', source: UNSOURCED, sourceUrl: UNSOURCED, consultedAt: null, status: 'a_valider', kind: 'manual' },
];

export function rateById(id: string): RateParam {
  const found = RATE_PARAMS.find((p) => p.id === id);
  if (!found) throw new Error(`Taux inconnu : ${id}`);
  return found;
}

export function formatChDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function parseNum(s: string): number | null {
  const t = s.replace(/['’\s]/g, '').replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function net(gross: number, r: { avs: number; ac: number; aanp: number | null; lpp: number | null; acCeiling: number }) {
  const acBase = Math.min(gross, r.acCeiling / 12);
  const items: { key: string; amount: number }[] = [
    { key: 'AVS/AI/APG', amount: (gross * r.avs) / 100 },
    { key: 'AC', amount: (acBase * r.ac) / 100 },
  ];
  const omitted: string[] = [];
  if (r.aanp === null) omitted.push('AANP');
  else items.push({ key: 'AANP', amount: (gross * r.aanp) / 100 });
  if (r.lpp === null) omitted.push('LPP');
  else items.push({ key: 'LPP', amount: (gross * r.lpp) / 100 });
  const total = items.reduce((a, b) => a + b.amount, 0);
  return { items, total, net: gross - total, omitted };
}

/**
 * Jours ouvrables pour un horaire de 5 jours : semaines × 5 × mois/12.
 * `ratePct` est seulement renvoyé. Il ne modifie pas les jours.
 * Cela signale une ambiguïté d'API, pas une erreur d'arrondi du temps plein.
 * Le temps partiel dépend des jours réellement travaillés dans la semaine :
 * ne pas diviser tous les jours par deux. Règle humaine encore en attente
 * (`content/content-contract.json`, backlog `vacation-activity-rate`).
 */
export function vacation(weeks: number, months: number, ratePct: number) {
  const days = weeks * 5 * (months / 12);
  return { days: Math.round(days * 10) / 10, weeks: Math.round((days / 5) * 100) / 100, hourlyPct: Math.round((weeks / (52 - weeks)) * 10000) / 100, ratePct };
}

export function overtime(monthly: number, weeklyHours: number, hours: number, pct: number) {
  const hourly = (monthly * 12) / (52 * weeklyHours);
  return { hourly, amount: hourly * hours * (1 + pct / 100) };
}

export function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? d : null;
}

export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

/** Années de service complètes au jour de la réception du congé. */
export function seniorityYears(start: Date, notice: Date) {
  let y = notice.getUTCFullYear() - start.getUTCFullYear();
  const anniv = new Date(Date.UTC(notice.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  if (notice < anniv) y -= 1;
  return Math.max(0, y);
}

export function legalNoticeMonths(years: number) {
  // 1re année = 0 an révolu → 1 mois ; 2e à 9e → 2 mois ; dès la 10e → 3 mois.
  return years < 1 ? 1 : years < 9 ? 2 : 3;
}

/** Fin des rapports : essai = +7 jours ; sinon fin du mois de réception + N mois (fin de mois). */
export function noticeEnd(start: Date, notice: Date, probation: boolean, contractMonths: number | null) {
  const years = seniorityYears(start, notice);
  if (probation) return { end: new Date(notice.getTime() + 7 * 86400000), years, months: 0 };
  const months = contractMonths ?? legalNoticeMonths(years);
  const end = new Date(Date.UTC(notice.getUTCFullYear(), notice.getUTCMonth() + months + 1, 0));
  return { end, years, months };
}

export function protectionDays(years: number) {
  return years < 1 ? 30 : years < 5 ? 90 : 180;
}

export const chf = (n: number) =>
  'CHF ' + (Math.round(n * 20) / 20).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
