import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalog } from './catalog.ts';
import { coverageReport } from './coverage.ts';
import { figureReview } from './figures.ts';
import { buildStudyPlan, gradeItem, scoreRubric, weakCompetenceIds } from './plan.ts';
import { assertNoCopyrightDump, validateCatalog } from './validate.ts';

test('curriculum catalog matches the content schema', () => {
  const errors = [...validateCatalog(catalog), ...assertNoCopyrightDump(catalog)];
  assert.deepEqual(errors, []);
});

test('yearly review flags expired verified figures and keeps unverified ones', () => {
  const sample = [
    { ...catalog.figures[0], id: 'old', validYear: 2025, status: 'verified' as const, value: 1 },
    { ...catalog.figures[0], id: 'now', validYear: 2026, status: 'verified' as const, value: 1 },
    { ...catalog.figures[0], id: 'open', validYear: 2026, status: 'a_verifier' as const, value: null, note: 'À vérifier : exemple' },
  ];
  const review = figureReview(sample, new Date('2026-11-15T00:00:00Z'));
  assert.deepEqual(review.expired.map((item) => item.id), ['old']);
  assert.deepEqual(review.unverified.map((item) => item.id), ['open']);
  const nextYear = figureReview(catalog.figures, new Date('2027-01-02T00:00:00Z'));
  assert.ok(nextYear.expired.length > 0);
});

test('coverage names every competence and keeps thin areas honest', () => {
  const report = coverageReport(catalog);
  for (const competence of catalog.competences) assert.ok(report[competence.id]);
  assert.equal(report['droit-travail'], 'solid');
  assert.equal(report['assurances'], 'solid');
  assert.equal(report['paie'], 'solid');
  assert.equal(report['recrutement'], 'solid');
  assert.equal(report['contrat-fin'], 'solid');
  assert.equal(report.absences, 'solid');
  assert.equal(report['marketing-rh'], 'thin');
  assert.equal(report.placement, 'thin');
  assert.equal(report.communication, 'medium');
  assert.equal(report.etrangers, 'medium');
});

test('study plan prefers weak lessons and a rubric maps onto the Swiss scale', () => {
  const plan = buildStudyPlan({
    examDate: '2026-12-15',
    today: '2026-11-15',
    weeklyMinutes: 15,
    lessons: [
      { id: 'a', competenceId: 'paie', minutes: 6, done: false },
      { id: 'b', competenceId: 'droit-travail', minutes: 5, done: false },
      { id: 'c', competenceId: 'paie', minutes: 6, done: true },
    ],
    weakness: { paie: 0.9, 'droit-travail': 0.1 },
  });
  assert.equal(plan.weeks[0].items[0].id, 'a');
  assert.equal(weakCompetenceIds([{ competenceId: 'paie', correct: 1, total: 4, rate: 0.25 }])[0], 'paie');
  assert.deepEqual(weakCompetenceIds([{ competenceId: 'paie', correct: 0, total: 1, rate: 0 }]), []);
  const note = scoreRubric([
    { points: 2, hit: true },
    { points: 2, hit: false },
  ]);
  assert.equal(note.note, 3.5);
  const order = catalog.drills.flatMap((drill) => drill.items).find((item) => item.type === 'order');
  assert.ok(order && order.type === 'order');
  assert.equal(gradeItem(order, order.answer), true);
  assert.equal(gradeItem(order, [...order.answer].reverse()), false);
});
