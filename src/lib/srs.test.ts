import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addIsoDays, freshCard, reviewCard } from './srs.ts';

test('SM-2 first three successful reviews follow 1 day, 6 days, then ease', () => {
  let card = freshCard('2026-11-15');
  card = reviewCard(card, 5, '2026-11-15');
  assert.equal(card.ease, 2.6);
  assert.equal(card.repetitions, 1);
  assert.equal(card.interval, 1);
  assert.equal(card.due, '2026-11-16');
  card = reviewCard(card, 5, '2026-11-16');
  assert.equal(card.ease, 2.7);
  assert.equal(card.repetitions, 2);
  assert.equal(card.interval, 6);
  assert.equal(card.due, '2026-11-22');
  card = reviewCard(card, 5, '2026-11-22');
  assert.equal(card.ease, 2.8);
  assert.equal(card.repetitions, 3);
  assert.equal(card.interval, 17);
  assert.equal(card.due, '2026-12-09');
});

test('a grade below 3 resets the streak of repetitions and schedules tomorrow', () => {
  let card = freshCard('2026-01-01');
  card = reviewCard(card, 5, '2026-01-01');
  card = reviewCard(card, 5, '2026-01-02');
  card = reviewCard(card, 2, '2026-01-08');
  assert.equal(card.repetitions, 0);
  assert.equal(card.interval, 1);
  assert.equal(card.lapses, 1);
  assert.equal(card.due, '2026-01-09');
  assert.ok(card.ease >= 1.3);
});

test('ease never drops under 1.3 and dates cross month ends', () => {
  let card = freshCard('2026-01-31');
  card.ease = 1.3;
  card = reviewCard(card, 0, '2026-01-31');
  assert.equal(card.ease, 1.3);
  assert.equal(addIsoDays('2026-01-31', 1), '2026-02-01');
});
