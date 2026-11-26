import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entryTotals, formatChfCents } from './accounting-math.ts';
import {
  ACCOUNTING_UNVERIFIED,
  accountingBank,
  accountingDrills,
  accountingExamQuestions,
  accountingLessons,
  accountingQuestions,
} from './accounting-content.ts';
import { catalog } from './catalog.ts';
import { assertNoCopyrightDump, validateCatalog } from './validate.ts';

test('le catalogue reste valide avec la comptabilité suisse', () => {
  assert.deepEqual([...validateCatalog(catalog), ...assertNoCopyrightDump(catalog)], []);
  assert.ok(catalog.competences.some((item) => item.id === 'compta'));
  assert.ok(catalog.lessons.some((item) => item.id === 'cpta-salaires'));
  assert.ok(catalog.exams.some((item) => item.id === 'ex-compta'));
});

test('banque 40 à 60 questions, une seule bonne réponse, explication non vide', () => {
  assert.ok(accountingQuestions.length >= 40 && accountingQuestions.length <= 60);
  assert.equal(accountingDrills.reduce((sum, drill) => sum + drill.items.length, 0), accountingQuestions.length);
  assert.ok(accountingExamQuestions.length >= 6 && accountingExamQuestions.length <= 12);
  const ids = new Set<string>();
  for (const question of accountingBank) {
    assert.equal(ids.has(question.id), false, question.id);
    ids.add(question.id);
    assert.ok(question.explain.trim().length > 8, question.id);
    if (question.kind === 'single') {
      assert.ok(question.options && question.options.length >= 2);
      assert.equal(new Set(question.options).size, question.options.length, question.id);
      assert.equal(typeof question.answer, 'number');
      assert.ok((question.answer as number) >= 0 && (question.answer as number) < question.options.length);
    }
    if (question.kind === 'boolean') assert.equal(typeof question.answer, 'boolean');
    if (question.kind === 'order') {
      assert.ok(Array.isArray(question.answer));
      assert.deepEqual([...(question.answer as string[])].sort(), question.steps?.map((step) => step.id).sort());
    }
    if (question.unverified) assert.match(question.explain, /à vérifier/i);
  }
});

test('les montants et les écritures affichés sont ceux du calcul', () => {
  for (const question of accountingBank) {
    if (question.kind !== 'single' || !question.options) continue;
    const shown = question.options[question.answer as number];
    if (question.expectCents !== undefined) assert.ok(shown.includes(formatChfCents(question.expectCents)), question.id);
    if (question.entry) {
      assert.equal(entryTotals(question.entry).balanced, true, question.id);
      for (const line of [...question.entry.debit, ...question.entry.credit]) {
        assert.ok(shown.includes(formatChfCents(line.cents)), question.id);
        assert.ok(shown.includes(line.account), question.id);
      }
    }
  }
});

test('chaque point à vérifier est nommé, et les leçons citent une source', () => {
  const blob = `${JSON.stringify(accountingLessons)}\n${accountingBank.map((item) => item.explain).join('\n')}`;
  for (const topic of ACCOUNTING_UNVERIFIED) assert.ok(blob.toLowerCase().includes(topic.toLowerCase()), topic);
  for (const lesson of accountingLessons) {
    assert.ok(lesson.source.name.length > 3);
    assert.ok(lesson.source.url.startsWith('https://'));
    assert.ok(lesson.screens.length >= 2);
  }
});
