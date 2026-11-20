import type { Catalog, Coverage } from './types';

export function coverageOf(catalog: Catalog, competenceId: string): Coverage {
  const lessons = catalog.lessons.filter((lesson) => lesson.competenceId === competenceId);
  const cards = catalog.cards.filter((card) => card.competenceId === competenceId);
  const drills = catalog.drills.filter((drill) => drill.competenceId === competenceId);
  const deep = lessons.filter((lesson) => lesson.screens.length >= 3).length;
  if (lessons.length >= 2 && deep >= 2 && cards.length >= 4 && drills.length >= 1) return 'solid';
  if (lessons.length >= 1 && cards.length >= 3 && drills.length >= 1) return 'medium';
  return 'thin';
}

export function coverageReport(catalog: Catalog): Record<string, Coverage> {
  return Object.fromEntries(catalog.competences.map((competence) => [competence.id, coverageOf(catalog, competence.id)]));
}
