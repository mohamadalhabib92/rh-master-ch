import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { migrateLearningRecord, reviseStoredLearning, shouldShowOnboarding, touchStreak } from './learn-state.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function read(name: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(root, 'fixtures/learning', name), 'utf8')) as Record<string, unknown>;
}

test('migration keeps progress ids, unknown keys and schemaVersion 1', () => {
  const nominal = read('v1-nominal.json');
  const once = migrateLearningRecord(nominal);
  const twice = migrateLearningRecord(once);
  assert.equal(once.schemaVersion, 1);
  assert.equal(once.futureNote, 'clé inconnue à conserver');
  assert.deepEqual((once.progress as { temps: { correct: string[] } }).temps.correct, ['temps-1']);
  assert.deepEqual(once.mistakes, []);
  assert.equal((once.learn as { xp: number }).xp, 0);
  assert.equal((once.learn as { settings: { focusMinutes: number } }).settings.focusMinutes, 15);
  assert.deepEqual(once, twice);
});

test('migration keeps an existing learn blob and does not wipe a future schema', () => {
  const nominal = read('v1-nominal.json');
  const withLearn = migrateLearningRecord({
    ...nominal,
    learn: { xp: 40, settings: { dark: true, customFlag: true }, streak: { count: 4, lastDay: '2026-11-01' }, extra: 'keep' },
  });
  const learn = withLearn.learn as { xp: number; settings: { dark: boolean; customFlag: boolean }; extra: string; streak: { count: number } };
  assert.equal(learn.xp, 40);
  assert.equal(learn.settings.dark, true);
  assert.equal(learn.settings.customFlag, true);
  assert.equal(learn.extra, 'keep');
  assert.equal(learn.streak.count, 4);
  assert.deepEqual((withLearn.progress as { temps: { correct: string[] } }).temps.correct, ['temps-1']);
  const future = reviseStoredLearning(read('future-version.json'));
  assert.equal(future, null);
});

test('legacy progress is migrated without dropping stored ids', () => {
  const legacy = read('legacy-without-version.json');
  const adopted = reviseStoredLearning(legacy);
  assert.ok(adopted);
  assert.equal(adopted?.schemaVersion, 1);
  assert.deepEqual((adopted?.progress as { contrat: { correct: string[] } }).contrat.correct, ['contrat-1', 'contrat-3']);
  assert.deepEqual(adopted?.mistakes, ['salaire-4']);
  assert.equal(typeof (adopted?.learn as { xp: number }).xp, 'number');
});

test('streak uses a freeze for one missed day and resets gently afterwards', () => {
  const start = { count: 3, lastDay: '2026-11-10', freezes: 2, freezeMonth: '2026-11' };
  const same = touchStreak(start, '2026-11-10');
  assert.equal(same.event, 'same');
  assert.equal(same.streak.count, 3);
  const next = touchStreak(start, '2026-11-11');
  assert.equal(next.event, 'up');
  assert.equal(next.streak.count, 4);
  const frozen = touchStreak(start, '2026-11-12');
  assert.equal(frozen.event, 'freeze');
  assert.equal(frozen.streak.count, 4);
  assert.equal(frozen.streak.freezes, 1);
  const reset = touchStreak({ ...start, freezes: 0 }, '2026-11-14');
  assert.equal(reset.event, 'reset');
  assert.equal(reset.streak.count, 1);
  assert.ok(reset.streak.count > 0);
});

test('existing learners are not blocked by onboarding', () => {
  const nominal = read('v1-nominal.json');
  assert.equal(shouldShowOnboarding(nominal), false);
  assert.equal(shouldShowOnboarding({ schemaVersion: 1, lang: 'fr', progress: {}, ficheRead: {}, mistakes: [] }), true);
  assert.equal(shouldShowOnboarding({ schemaVersion: 1, learn: { settings: { onboarded: true } }, progress: {}, ficheRead: {} }), false);
});
