import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatClock, knownSourceLabel, lawSourceLabel, reviewOrder, type ItemMark } from './exam-session.ts';

const LAWS = {
  CO: { fr: 'Code des obligations (CO)' },
  LTr: { fr: 'Loi sur le travail (LTr)' },
};

test('clock stays at zero and pads minutes and seconds', () => {
  assert.equal(formatClock(0), '00:00');
  assert.equal(formatClock(-4), '00:00');
  assert.equal(formatClock(75), '01:15');
  assert.equal(formatClock(12 * 60), '12:00');
});

test('a named source already in the content is kept, a placeholder becomes unknown', () => {
  assert.deepEqual(knownSourceLabel('Code des obligations, état au 1er janvier 2026'), {
    known: true,
    text: 'Code des obligations, état au 1er janvier 2026',
  });
  assert.equal(knownSourceLabel('YOUR_LEGAL_SOURCE').known, false);
  assert.equal(knownSourceLabel('  ').known, false);
  assert.equal(knownSourceLabel(undefined).known, false);
  const named = lawSourceLabel('LTr', LAWS, 'YOUR_LEGAL_SOURCE');
  assert.equal(named.known, true);
  assert.equal(named.text, 'LTr — Loi sur le travail (LTr)');
  assert.equal(/\bart\.\s*\d+/i.test(named.text), false);
  assert.equal(lawSourceLabel('CO', LAWS).text.startsWith('CO — '), true);
  assert.equal(lawSourceLabel(undefined, LAWS, 'YOUR_LEGAL_SOURCE').known, false);
  assert.equal(lawSourceLabel('', LAWS, '').known, false);
  assert.equal(lawSourceLabel('OLT', {}, undefined).text, 'OLT');
});

test('flagged items lead the review without dropping or reordering the rest', () => {
  const items = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }, { id: 'q4' }];
  const marks: Record<string, ItemMark> = {
    q1: { ok: true, flagged: false },
    q3: { ok: false, flagged: true },
    q4: { ok: null, flagged: true },
  };
  assert.deepEqual(
    reviewOrder(items, marks).map((item) => item.id),
    ['q3', 'q4', 'q1', 'q2'],
  );
  assert.equal(reviewOrder(items, {}).length, items.length);
});
