/**
 * SM-2 (SuperMemo 2), planification pure.
 * La qualité va de 0 à 5. En dessous de 3, la carte revient demain
 * et le compteur de répétitions repart. L'aisance ne descend pas sous 1,3.
 */

export type SrsGrade = 0 | 1 | 2 | 3 | 4 | 5;

export type SrsCard = {
  ease: number;
  interval: number;
  repetitions: number;
  due: string;
  lapses: number;
};

export function addIsoDays(iso: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`date invalide: ${iso}`);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isoDiffDays(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function freshCard(today: string): SrsCard {
  return { ease: 2.5, interval: 0, repetitions: 0, due: today, lapses: 0 };
}

export function reviewCard(card: SrsCard, grade: SrsGrade, today: string): SrsCard {
  let ease = card.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (ease < 1.3) ease = 1.3;
  ease = Math.round(ease * 100) / 100;
  let repetitions = card.repetitions;
  let interval = card.interval;
  let lapses = card.lapses;
  if (grade < 3) {
    repetitions = 0;
    interval = 1;
    lapses += 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.max(1, Math.round(interval * ease));
  }
  return { ease, interval, repetitions, due: addIsoDays(today, interval), lapses };
}

export function isDue(card: SrsCard, today: string): boolean {
  return card.due <= today;
}
