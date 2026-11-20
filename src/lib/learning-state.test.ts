import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { vacation } from './calc.ts';
import { adoptLearningRecord, rollbackRead } from './learning-state.ts';
import { createPersistedStore, type PersistStorage } from './persist.ts';
import { confirmProgressReset } from './reset-progress.ts';

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
  const side = new Map<string, string>();
  const pending = deferred<string | null>();
  const storage: PersistStorage = {
    getItem(key: string) {
      if (key.endsWith(':before-rewrite')) return Promise.resolve(side.get(key) ?? null);
      return pending.promise;
    },
    setItem(key: string, value: string) {
      if (key.endsWith(':before-rewrite')) side.set(key, value);
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
    assert.equal(disk.sets.length, 2);
    const written = JSON.parse(disk.sets[1]) as { progress: { contrat: { correct: string[] } }; schemaVersion: number; lang: string };
    assert.equal(JSON.parse(disk.sets[0]).payload, fs.readFileSync(path.join(fixtureDir, 'legacy-without-version.json'), 'utf8'));
    assert.equal(written.schemaVersion, 1);
    assert.equal(written.lang, 'it');
    assert.deepEqual(written.progress.contrat.correct, ['contrat-1', 'contrat-3']);
    const legacyView = rollbackRead(disk.sets[1], { lang: 'fr', progress: {}, mistakes: [] });
    assert.deepEqual((legacyView?.progress as { contrat: { correct: string[] } }).contrat.correct, ['contrat-1', 'contrat-3']);
  } finally {
    mock.timers.reset();
  }
});

function drain() {
  return new Promise((resolve) => setImmediate(resolve));
}

function revise(value: Record<string, unknown>) {
  const adopted = adoptLearningRecord(value);
  return adopted.ok ? adopted.record : null;
}

test('settings reset before the read adopts the legacy blob and does not delete it', async () => {
  const { mock } = await import('node:test');
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const legacy = { ...readJson('legacy-without-version.json'), futureNote: 'keep' };
    const raw = JSON.stringify(legacy);
    const disk = fakeStorage(null);
    const store = createPersistedStore('rhmaster:v1', initial, 8000, disk.storage, (value) => revise(value as Record<string, unknown>) as typeof initial | null);
    mock.timers.tick(8000);
    store.continueOffline();
    confirmProgressReset(store);
    assert.equal(store.getResetPhase(), 'idle');
    disk.pending.resolve(raw);
    await drain();
    mock.timers.tick(500);
    await drain();
    assert.equal(disk.removes.n, 0);
    assert.equal(disk.sets.length, 0);
    assert.deepEqual(store.get().progress.contrat?.correct, ['contrat-1', 'contrat-3']);
    assert.deepEqual(store.get().mistakes, ['salaire-4']);
    assert.equal((store.get() as { futureNote?: string }).futureNote, 'keep');
  } finally {
    mock.timers.reset();
  }
});

test('a refused remove does not let the following language write replace the original blob', async () => {
  const { mock } = await import('node:test');
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const nominal = { ...readJson('v1-nominal.json'), intervals: { 'temps-1': 4 } };
    const raw = JSON.stringify(nominal);
    const sets: string[] = [];
    let removes = 0;
    let failRemoves = 1;
    const data = new Map<string, string>([['rhmaster:v1', raw]]);
    const storage: PersistStorage = {
      getItem(key: string) {
        return Promise.resolve(data.has(key) ? data.get(key)! : null);
      },
      setItem(key: string, value: string) {
        sets.push(value);
        data.set(key, value);
        return Promise.resolve();
      },
      removeItem(key: string) {
        removes += 1;
        if (failRemoves > 0) {
          failRemoves -= 1;
          return Promise.reject(new Error('remove refused'));
        }
        data.delete(key);
        return Promise.resolve();
      },
    };
    const store = createPersistedStore('rhmaster:v1', initial, 8000, storage, (value) => revise(value as Record<string, unknown>) as typeof initial | null);
    await drain();
    store.reset();
    store.set({ lang: 'it' });
    await drain();
    mock.timers.tick(1_000);
    await drain();
    assert.equal(sets.length, 1);
    assert.equal(JSON.parse(sets[0]).payload, raw);
    assert.equal(removes, 1);
    assert.equal(data.get('rhmaster:v1'), raw);
    assert.equal(store.getResetPhase(), 'failed');
    assert.equal(store.isUnreadable(), false);
    assert.deepEqual(store.get().progress.temps?.correct, ['temps-1']);
    assert.equal(store.get().lang, 'de');
    assert.equal((store.get() as { futureNote?: string }).futureNote, 'clé inconnue à conserver');
    store.set({ lang: 'it' });
    mock.timers.tick(150);
    await drain();
    assert.equal(sets.length, 2);
    const written = JSON.parse(sets[1]) as {
      lang: string;
      futureNote: string;
      intervals: { 'temps-1': number };
      progress: { temps: { correct: string[] } };
    };
    assert.equal(written.lang, 'it');
    assert.deepEqual(written.progress.temps.correct, ['temps-1']);
    assert.equal(written.futureNote, 'clé inconnue à conserver');
    assert.equal(written.intervals['temps-1'], 4);
    assert.equal(data.get('rhmaster:v1'), sets[1]);
    assert.equal(JSON.parse(sets[0]).payload, raw);
  } finally {
    mock.timers.reset();
  }
});

test('a confirmed reset deletes only after removeItem resolves, and keeps the language', async () => {
  const { mock } = await import('node:test');
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const nominal = readJson('v1-nominal.json');
    const raw = JSON.stringify(nominal);
    const sets: string[] = [];
    let removes = 0;
    const data = new Map<string, string>([['rhmaster:v1', raw]]);
    const storage: PersistStorage = {
      getItem(key: string) {
        return Promise.resolve(data.has(key) ? data.get(key)! : null);
      },
      setItem(key: string, value: string) {
        sets.push(value);
        data.set(key, value);
        return Promise.resolve();
      },
      removeItem(key: string) {
        removes += 1;
        data.delete(key);
        return Promise.resolve();
      },
    };
    const store = createPersistedStore('rhmaster:v1', initial, 8000, storage, (value) => revise(value as Record<string, unknown>) as typeof initial | null);
    await drain();
    assert.deepEqual(store.get().progress.temps?.correct, ['temps-1']);
    confirmProgressReset(store);
    await drain();
    assert.equal(removes, 1);
    assert.equal(data.has('rhmaster:v1'), false);
    assert.equal(sets.length, 1);
    assert.equal(JSON.parse(sets[0]).payload, raw);
    assert.equal(store.getResetPhase(), 'done');
    mock.timers.tick(149);
    await drain();
    assert.equal(sets.length, 1);
    mock.timers.tick(1);
    await drain();
    assert.equal(sets.length, 2);
    const written = JSON.parse(sets[1]) as { lang: string; progress: Record<string, unknown>; futureNote?: string };
    assert.equal(written.lang, 'de');
    assert.deepEqual(written.progress, {});
    assert.equal(written.futureNote, undefined);
    assert.equal(JSON.stringify(written).includes('temps-1'), false);
  } finally {
    mock.timers.reset();
  }
});

test('future and corrupt blobs stay untouched when reset is confirmed before the read', async () => {
  const { mock } = await import('node:test');
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    for (const raw of [JSON.stringify(readJson('future-version.json')), fs.readFileSync(path.join(fixtureDir, 'corrupt.txt'), 'utf8')]) {
      const sets: string[] = [];
      let removes = 0;
      let delivered = false;
      let resolveRead!: (value: string) => void;
      const pending = new Promise<string>((resolve) => {
        resolveRead = resolve;
      });
      const storage: PersistStorage = {
        getItem() {
          return delivered ? Promise.resolve(raw) : pending;
        },
        setItem(_key, value) {
          sets.push(value);
          return Promise.resolve();
        },
        removeItem() {
          removes += 1;
          return Promise.resolve();
        },
      };
      const store = createPersistedStore('rhmaster:v1', initial, 8000, storage, (value) => revise(value as Record<string, unknown>) as typeof initial | null);
      store.continueOffline();
      confirmProgressReset(store);
      store.set({ lang: 'it' });
      mock.timers.tick(1_000);
      await drain();
      assert.equal(sets.length, 0);
      assert.equal(removes, 0);
      delivered = true;
      resolveRead(raw);
      await drain();
      mock.timers.tick(1_000);
      await drain();
      assert.equal(sets.length, 0);
      assert.equal(removes, 0);
      assert.equal(store.isUnreadable(), true);
      assert.equal(store.getRawBackup(), raw);
    }
  } finally {
    mock.timers.reset();
  }
});

test('rollback restores the main key from the side copy and keeps that copy', async () => {
  const { mock } = await import('node:test');
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const raw = fs.readFileSync(path.join(fixtureDir, 'legacy-without-version.json'), 'utf8');
    const disk = fakeStorage(null);
    const store = createPersistedStore('rhmaster:v1', initial, 8000, disk.storage, (value) => revise(value as Record<string, unknown>) as typeof initial | null);
    disk.pending.resolve(raw);
    await drain();
    store.set({ lang: 'it' });
    mock.timers.tick(150);
    await drain();
    assert.equal(disk.sets.length, 2);
    const restored = await store.restoreSideCopy();
    assert.equal(restored, 'restored');
    assert.deepEqual(store.get().progress.contrat?.correct, ['contrat-1', 'contrat-3']);
    assert.equal(store.get().lang, 'fr');
    assert.equal(disk.sets.length, 3);
    assert.equal(disk.sets[2], raw);
    assert.equal(JSON.parse(disk.sets[0]).payload, raw);
    const refused = await store.applyVerifiedRestore({ ...JSON.parse(disk.sets[0]), sha256: '0'.repeat(64) });
    assert.equal(refused, 'rejected');
    assert.equal(disk.sets.length, 3);
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
