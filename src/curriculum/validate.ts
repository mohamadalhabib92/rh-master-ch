import type { Catalog, DrillItem, Figure } from './types';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function isObj(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function push(errors: string[], ok: boolean, message: string) {
  if (!ok) errors.push(message);
}

function checkSource(errors: string[], where: string, source: unknown) {
  push(errors, isObj(source), `${where}: source manquante`);
  if (!isObj(source)) return;
  push(errors, typeof source.name === 'string' && source.name.length > 3, `${where}: source.name`);
  push(errors, typeof source.url === 'string' && source.url.startsWith('https://'), `${where}: url officielle https`);
  push(errors, typeof source.consultedAt === 'string' && ISO.test(source.consultedAt), `${where}: consultedAt`);
}

function checkItem(errors: string[], where: string, item: DrillItem) {
  push(errors, item.prompt.trim().length > 8, `${where}: énoncé trop court`);
  push(errors, item.explain.trim().length > 8, `${where}: explication`);
  if (item.type === 'boolean') push(errors, typeof item.answer === 'boolean', `${where}: réponse booléenne`);
  if (item.type === 'single') {
    push(errors, item.options.length >= 2, `${where}: options`);
    push(errors, item.answer >= 0 && item.answer < item.options.length, `${where}: index`);
  }
  if (item.type === 'order') {
    const ids = item.steps.map((step) => step.id);
    push(errors, new Set(ids).size === ids.length, `${where}: étapes uniques`);
    push(errors, item.answer.length === ids.length && item.answer.every((id) => ids.includes(id)), `${where}: ordre`);
  }
  if (item.type === 'match') push(errors, item.pairs.length >= 2, `${where}: paires`);
}

export function validateCatalog(input: unknown): string[] {
  const errors: string[] = [];
  push(errors, isObj(input), 'catalogue illisible');
  if (!isObj(input)) return errors;
  const catalog = input as Catalog;
  push(errors, catalog.catalogVersion === 1, 'catalogVersion');
  push(errors, catalog.localePrimary === 'fr', 'français d’abord');
  push(errors, catalog.german === 'structure_ready', 'allemand structure-ready');
  push(errors, ISO.test(catalog.consultedAt), 'consultedAt');

  const figureIds = new Set<string>();
  for (const figure of catalog.figures ?? []) {
    const where = `figure ${figure.id}`;
    push(errors, !figureIds.has(figure.id), `${where}: doublon`);
    figureIds.add(figure.id);
    push(errors, figure.validYear >= 2020 && figure.validYear <= 2100, `${where}: année`);
    push(errors, figure.status === 'verified' || figure.status === 'a_verifier', `${where}: statut`);
    push(errors, typeof figure.url === 'string' && figure.url.startsWith('https://'), `${where}: url`);
    push(errors, ISO.test(figure.consultedAt), `${where}: date`);
    push(errors, figure.note.length > 8, `${where}: note`);
    if (figure.status === 'verified') push(errors, typeof figure.value === 'number', `${where}: valeur vérifiée`);
    if (figure.status === 'a_verifier') push(errors, figure.note.toLowerCase().includes('vérifier') || figure.note.toLowerCase().includes('verifier'), `${where}: mention à vérifier`);
  }

  const competenceIds = new Set<string>();
  for (const competence of catalog.competences ?? []) {
    const where = `compétence ${competence.id}`;
    push(errors, !competenceIds.has(competence.id), `${where}: doublon`);
    competenceIds.add(competence.id);
    push(errors, competence.title.length > 3, `${where}: titre`);
    push(errors, competence.de.title.length > 3 && competence.de.summary.length > 8, `${where}: structure DE`);
    push(errors, competence.tracks.length > 0, `${where}: filière`);
  }

  const ids = new Set<string>();
  const take = (id: string, where: string) => {
    push(errors, !ids.has(id), `${where}: id déjà utilisé`);
    ids.add(id);
  };

  for (const lesson of catalog.lessons ?? []) {
    const where = `leçon ${lesson.id}`;
    take(lesson.id, where);
    push(errors, competenceIds.has(lesson.competenceId), `${where}: compétence`);
    push(errors, lesson.minutes >= 3 && lesson.minutes <= 7, `${where}: durée 3–7 min`);
    push(errors, lesson.concept.length > 8, `${where}: concept`);
    push(errors, lesson.de.title.length > 3, `${where}: titre DE`);
    push(errors, lesson.screens.length >= 2 && lesson.screens.length <= 4, `${where}: écrans`);
    push(errors, lesson.checklist.length >= 2 && lesson.checklist.length <= 5, `${where}: checklist`);
    const concepts = new Set<string>();
    for (const screen of lesson.screens) {
      push(errors, screen.concept.length > 8 && !concepts.has(screen.concept), `${where}/${screen.id}: un concept par écran`);
      concepts.add(screen.concept);
      push(errors, screen.body.length >= 80, `${where}/${screen.id}: texte`);
      if (screen.figureId) push(errors, figureIds.has(screen.figureId), `${where}: figure ${screen.figureId}`);
    }
    checkSource(errors, where, lesson.source);
  }

  for (const card of catalog.cards ?? []) {
    const where = `carte ${card.id}`;
    take(card.id, where);
    push(errors, competenceIds.has(card.competenceId), `${where}: compétence`);
    push(errors, card.front.length > 8 && card.back.length > 8, `${where}: faces`);
    push(errors, card.de.front.length > 3, `${where}: DE`);
    if (card.figureId) push(errors, figureIds.has(card.figureId), `${where}: figure`);
    checkSource(errors, where, card.source);
  }

  for (const drill of catalog.drills ?? []) {
    const where = `exercice ${drill.id}`;
    take(drill.id, where);
    push(errors, competenceIds.has(drill.competenceId), `${where}: compétence`);
    push(errors, drill.items.length >= 2, `${where}: variété`);
    const types = new Set(drill.items.map((item) => item.type));
    push(errors, types.size >= 1, `${where}: type`);
    drill.items.forEach((item, index) => checkItem(errors, `${where}#${index}`, item));
    checkSource(errors, where, drill.source);
  }

  for (const item of catalog.cases ?? []) {
    const where = `cas ${item.id}`;
    take(item.id, where);
    push(errors, competenceIds.has(item.competenceId), `${where}: compétence`);
    push(errors, item.prompt.length > 40 && item.modelAnswer.length > 40, `${where}: énoncé et corrigé`);
    const points = item.rubric.reduce((sum, row) => sum + row.points, 0);
    push(errors, item.rubric.length >= 3 && points > 0, `${where}: grille`);
    checkSource(errors, where, item.source);
  }

  for (const exam of catalog.exams ?? []) {
    const where = `examen ${exam.id}`;
    take(exam.id, where);
    push(errors, exam.minutes >= 8 && exam.minutes <= 40, `${where}: durée d'entraînement`);
    push(errors, exam.items.length >= 3, `${where}: questions`);
    exam.items.forEach((item, index) => checkItem(errors, `${where}#${index}`, item));
    if (exam.caseId) push(errors, (catalog.cases ?? []).some((item) => item.id === exam.caseId), `${where}: cas`);
    checkSource(errors, where, exam.source);
  }

  const wanted = [
    'droit-travail',
    'assurances',
    'paie',
    'recrutement',
    'contrat-fin',
    'developpement',
    'marketing-rh',
    'communication',
    'absences',
    'etrangers',
    'processus',
    'cct',
    'egalite-donnees',
    'placement',
  ];
  for (const id of wanted) push(errors, competenceIds.has(id), `compétence attendue ${id}`);
  return errors;
}

export function assertNoCopyrightDump(catalog: Catalog): string[] {
  const blob = JSON.stringify(catalog);
  const errors: string[] = [];
  if (/wegleitung complète|corrigé officiel HRSE|examen blanc payant/i.test(blob)) {
    errors.push('le catalogue ne doit pas prétendre reproduire un corrigé officiel');
  }
  return errors;
}
