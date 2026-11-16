import type { DrillItem } from './types';

export type Weakness = { competenceId: string; correct: number; total: number; rate: number };

export function weaknessByCompetence(answers: { competenceId: string; ok: boolean }[]): Weakness[] {
  const map = new Map<string, { correct: number; total: number }>();
  for (const answer of answers) {
    const row = map.get(answer.competenceId) ?? { correct: 0, total: 0 };
    row.total += 1;
    if (answer.ok) row.correct += 1;
    map.set(answer.competenceId, row);
  }
  return [...map.entries()]
    .map(([competenceId, row]) => ({ competenceId, ...row, rate: row.total ? row.correct / row.total : 0 }))
    .sort((a, b) => a.rate - b.rate || b.total - a.total);
}

/** Faiblesse seulement après au moins deux réponses, pour éviter un faux signal. */
export function weakCompetenceIds(rows: Weakness[], ceiling = 0.6): string[] {
  return rows.filter((row) => row.total >= 2 && row.rate < ceiling).map((row) => row.competenceId);
}

export function swissNote(earned: number, max: number): number {
  if (max <= 0) return 1;
  const raw = 1 + (5 * earned) / max;
  return Math.round(raw * 2) / 2;
}

export function scoreRubric(rows: { points: number; hit: boolean }[]): { earned: number; max: number; note: number } {
  const max = rows.reduce((sum, row) => sum + row.points, 0);
  const earned = rows.reduce((sum, row) => sum + (row.hit ? row.points : 0), 0);
  return { earned, max, note: swissNote(earned, max) };
}

export function gradeItem(item: DrillItem, given: unknown): boolean {
  if (item.type === 'boolean') return given === item.answer;
  if (item.type === 'single') return given === item.answer;
  if (item.type === 'order') return Array.isArray(given) && given.join('|') === item.answer.join('|');
  if (item.type === 'match') {
    if (!Array.isArray(given)) return false;
    const expected = item.pairs.map((pair) => pair.id).join('|');
    return given.join('|') === expected;
  }
  return false;
}

export type PlanLesson = { id: string; competenceId: string; minutes: number; done: boolean };

export type StudyWeek = { index: number; start: string; items: { id: string; minutes: number }[]; minutes: number };

export function buildStudyPlan(input: {
  examDate: string;
  today: string;
  weeklyMinutes: number;
  lessons: PlanLesson[];
  weakness: Record<string, number>;
}): { weeks: StudyWeek[]; overflow: string[] } {
  const start = Date.parse(`${input.today}T00:00:00Z`);
  const end = Date.parse(`${input.examDate}T00:00:00Z`);
  const days = Math.max(0, Math.round((end - start) / 86_400_000));
  const weekCount = Math.max(1, Math.ceil(days / 7));
  const pending = input.lessons
    .filter((lesson) => !lesson.done)
    .sort((a, b) => (input.weakness[b.competenceId] ?? 0) - (input.weakness[a.competenceId] ?? 0) || a.minutes - b.minutes);
  const weeks: StudyWeek[] = [];
  for (let index = 0; index < weekCount; index += 1) {
    const day = new Date(start + index * 7 * 86_400_000);
    weeks.push({ index, start: day.toISOString().slice(0, 10), items: [], minutes: 0 });
  }
  const overflow: string[] = [];
  for (const lesson of pending) {
    const week = weeks.find((row) => row.minutes + lesson.minutes <= input.weeklyMinutes);
    if (!week) {
      overflow.push(lesson.id);
      continue;
    }
    week.items.push({ id: lesson.id, minutes: lesson.minutes });
    week.minutes += lesson.minutes;
  }
  return { weeks, overflow };
}
