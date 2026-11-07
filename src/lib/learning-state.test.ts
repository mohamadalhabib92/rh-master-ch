import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { vacation } from './calc.ts';
import { adoptLearningRecord, rollbackRead } from './learning-state.ts';
import { createPersistedStore, type PersistStorage } from './persist.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixtureDir = path.join(root, 'fixtures/learning');

function readJson(name: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(fixtureDir, name), 'utf8')) as Record<string, unknown>;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function fakeStorage(initial: string | null) {
  const sets: string[] = [];
  const removes = { n: 0 };
  const pending = deferred<string | null>();
  const storage: PersistStorage = {
    getItem() {
      return pending.promise;
    },
    setItem(_key, value) {
      sets.push(value);
      return Promise.resolve();
    },
    removeItem() {
      removes.n += 1;
      return Promise.resolve();
    },
  };
  return { storage, pending, sets, removes, initial };
}

const initial = {
  schemaVersion: 1 as const,
  lang: 'fr' as const,
  ficheRead: {} as Record<string, boolean>,
  progress: {} as Record<string, { best: number; attempts: number; correct: string[]; lastAt: number }>,
  mistakes: [] as string[],
  lastModule: null as string | null,
  disclaimerSeen: false,
};

test('legacy progress is kept and tagged v1 without dropping ids', () => {
  const legacy = readJson('legacy-without-version.json');
  const adopted = adoptLearningRecord(legacy);
  assert.equal(adopted.ok, true);
  if (!adopted.ok) return;
  assert.equal(adopted.from, 'legacy');
  assert.equal(adopted.record.schemaVersion, 1);
  assert.deepEqual(adopted.record.progress, legacy.progress);
  assert.deepEqual(adopted.record.mistakes, legacy.mistakes);
  assert.deepEqual(adopted.record.ficheRead, legacy.ficheRead);
});

test('v1 nominal keeps unknown keys for a later reader', () => {
  const nominal = readJson('v1-nominal.json');
  const adopted = adoptLearningRecord(nominal);
  assert.equal(adopted.ok, true);
  if (!adopted.ok) return;
  assert.equal(adopted.from, 'v1');
  assert.equal(adopted.record.futureNote, 'clé inconnue à conserver');
  const rolled = rollbackRead(JSON.stringify(adopted.record), { lang: 'fr', progress: {}, mistakes: [] });
  assert.ok(rolled);
  assert.deepEqual((rolled?.progress as { temps: { correct: string[] } }).temps.correct, ['temps-1']);
  assert.equal(rolled?.futureNote, 'clé inconnue à conserver');
});

test('a future schema version is not rewritten into v1', () => {
  const future = readJson('future-version.json');
  const adopted = adoptLearningRecord(future);
  assert.deepEqual(adopted, { ok: false, reason: 'unsupported-version' });
});

test('corrupt text and a non-array mistakes field are not emptied', () => {
  const corrupt = fs.readFileSync(path.join(fixtureDir, 'corrupt.txt'), 'utf8');
  assert.equal(rollbackRead(corrupt, { progress: {} }), null);
  const bad = adoptLearningRecord({ schemaVersion: 1, mistakes: 'salaire-1' });
  assert.deepEqual(bad, { ok: false, reason: 'incompatible-shape' });
});

test('store does not write over a future version or a corrupt blob', async () => {
  const { mock } = await import('node:test');
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const future = fakeStorage(null);
    const store = createPersistedStore('rhmaster:v1', initial, 8000, future.storage, (value) => {
      const adopted = adoptLearningRecord(value as Record<string, unknown>);
      return adopted.ok ? (adopted.record as typeof initial) : null;
    });
    future.pending.resolve(JSON.stringify(readJson('future-version.json')));
    await new Promise((resolve) => setImmediate(resolve));
    store.set({ lang: 'it' });
    store.reset();
    mock.timers.tick(10_000);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(future.sets.length, 0);
    assert.equal(future.removes.n, 0);
    assert.equal(store.isUnreadable(), true);
    assert.equal(store.getRawBackup(), JSON.stringify(readJson('future-version.json')));
  } finally {
    mock.timers.reset();
  }
});

test('legacy fixture replays onto saved ids and can roll back', async () => {
  const { mock } = await import('node:test');
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const disk = fakeStorage(null);
    const store = createPersistedStore('rhmaster:v1', initial, 8000, disk.storage, (value) => {
      const adopted = adoptLearningRecord(value as Record<string, unknown>);
      return adopted.ok ? (adopted.record as typeof initial) : null;
    });
    disk.pending.resolve(fs.readFileSync(path.join(fixtureDir, 'legacy-without-version.json'), 'utf8'));
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(store.get().progress.contrat?.correct, ['contrat-1', 'contrat-3']);
    assert.deepEqual(store.get().mistakes, ['salaire-4']);
    assert.equal(store.get().schemaVersion, 1);
    store.set({ lang: 'it' });
    mock.timers.tick(150);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(disk.sets.length, 1);
    const written = JSON.parse(disk.sets[0]) as { progress: { contrat: { correct: string[] } }; schemaVersion: number; lang: string };
    assert.equal(written.schemaVersion, 1);
    assert.equal(written.lang, 'it');
    assert.deepEqual(written.progress.contrat.correct, ['contrat-1', 'contrat-3']);
    const legacyView = rollbackRead(disk.sets[0], { lang: 'fr', progress: {}, mistakes: [] });
    assert.deepEqual((legacyView?.progress as { contrat: { correct: string[] } }).contrat.correct, ['contrat-1', 'contrat-3']);
  } finally {
    mock.timers.reset();
  }
});

test('vacation activity rate is ignored and is not a part-time rule', () => {
  const full = vacation(4, 12, 100);
  const half = vacation(4, 12, 50);
  assert.equal(full.days, 20);
  assert.equal(half.days, 20);
  assert.equal(half.ratePct, 50);
  assert.notEqual(half.days, 10);
});
