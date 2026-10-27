/** Calculs RH indicatifs — fonctions pures, testables. Aucune garantie de conformité. */

export const DEFAULT_RATES = {
  avs: 5.3, // AVS/AI/APG part employé — valeur indicative, à vérifier chaque année
  ac: 1.1, // AC part employé — indicatif
  aanp: 1.0, // AANP — dépend de l’assureur et de la branche
  lpp: 0, // LPP — selon règlement de la caisse
  acCeiling: 148200, // plafond annuel AC — indicatif, à vérifier
};

export function parseNum(s: string): number | null {
  const t = s.replace(/['’\s]/g, '').replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function net(gross: number, r: { avs: number; ac: number; aanp: number; lpp: number; acCeiling: number }) {
  const acBase = Math.min(gross, r.acCeiling / 12);
  const items = [
    { key: 'AVS/AI/APG', amount: (gross * r.avs) / 100 },
    { key: 'AC', amount: (acBase * r.ac) / 100 },
    { key: 'AANP', amount: (gross * r.aanp) / 100 },
    { key: 'LPP', amount: (gross * r.lpp) / 100 },
  ];
  const total = items.reduce((a, b) => a + b.amount, 0);
  return { items, total, net: gross - total };
}

/** Jours ouvrables de vacances au prorata (5 jours/semaine). */
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
