import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { createPersistedStore, type PersistStorage } from './persist.ts';

/**
 * Sur main, createPersistedStore fait un Promise.race entre getItem et un
 * timeout de 2,5 s. Si le timeout gagne, l'état reste initial, hydrated
 * passe à true, et le set() ou le reset() suivant écrit cet état vide
 * (setItem ou removeItem) par-dessus la progression encore sur le disque.
 * Ces tests verrouillent l'inverse.
 */

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function fakeStorage() {
  const pending: ReturnType<typeof deferred<string | null>>[] = [];
  const sets: string[] = [];
  const removes = { n: 0 };
  const storage: PersistStorage = {
    getItem() {
      const job = deferred<string | null>();
      pending.push(job);
      return job.promise;
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
  return { storage, pending, sets, removes };
}

const initial = { lang: 'fr', progress: {} as Record<string, { best: number }>, extra: 0 };

const saved = {
  lang: 'de',
  progress: { contrat: { best: 80 } },
  extra: 4,
};

async function drain() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}

test('continue offline does not write until getItem succeeds, then replays onto saved data', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { storage, pending, sets, removes } = fakeStorage();
    const store = createPersistedStore('rhmaster:v1', initial, 8000, storage);
    mock.timers.tick(8000);
    store.continueOffline();
    store.set((s) => ({
      progress: { ...s.progress, salaire: { best: 10 } },
      extra: s.extra + 1,
    }));
    store.set({ lang: 'it' });
    mock.timers.tick(10_000);
    await drain();
    assert.equal(sets.length, 0);
    assert.equal(removes.n, 0);

    pending[0].resolve(JSON.stringify(saved));
    await drain();
    assert.equal(sets.length, 0);
    assert.equal(store.get().lang, 'it');
    assert.equal(store.get().extra, 5);
    assert.deepEqual(store.get().progress, { contrat: { best: 80 }, salaire: { best: 10 } });

    mock.timers.tick(150);
    await drain();
    assert.equal(sets.length, 1);
    assert.deepEqual(JSON.parse(sets[0]), {
      lang: 'it',
      progress: { contrat: { best: 80 }, salaire: { best: 10 } },
      extra: 5,
    });
    assert.equal(removes.n, 0);
  } finally {
    mock.timers.reset();
  }
});

test('reset before a successful read never writes the empty state', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { storage, pending, sets, removes } = fakeStorage();
    const store = createPersistedStore('rhmaster:v1', initial, 8000, storage);
    store.continueOffline();
    store.set({ extra: 9 });
    store.reset();
    store.set({ lang: 'it' });
    mock.timers.tick(10_000);
    await drain();
    assert.equal(sets.length, 0);
    assert.equal(removes.n, 0);

    pending[0].resolve(JSON.stringify(saved));
    await drain();
    mock.timers.tick(500);
    await drain();
    assert.equal(removes.n, 1);
    assert.equal(sets.length, 1);
    assert.deepEqual(JSON.parse(sets[0]), { lang: 'it', progress: {}, extra: 0 });
    assert.deepEqual(store.get().progress, {});
    assert.equal(store.get().lang, 'it');
  } finally {
    mock.timers.reset();
  }
});

test('a rejected read does not unlock setItem or removeItem', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { storage, pending, sets, removes } = fakeStorage();
    const store = createPersistedStore('rhmaster:v1', initial, 8000, storage);
    pending[0].reject(new Error('disk'));
    await drain();
    store.continueOffline();
    store.set({ extra: 9 });
    store.reset();
    mock.timers.tick(10_000);
    await drain();
    assert.equal(sets.length, 0);
    assert.equal(removes.n, 0);
    assert.equal(pending.length, 2);

    pending[1].reject(new Error('disk again'));
    await drain();
    mock.timers.tick(10_000);
    await drain();
    assert.equal(sets.length, 0);
    assert.equal(removes.n, 0);

    store.retryHydration();
    pending[2].resolve(JSON.stringify(saved));
    await drain();
    mock.timers.tick(500);
    await drain();
    assert.equal(sets.length, 0);
    assert.equal(removes.n, 1);
  } finally {
    mock.timers.reset();
  }
});

test('retry drops a save that was armed and ignores a stale getItem', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { storage, pending, sets, removes } = fakeStorage();
    const store = createPersistedStore('rhmaster:v1', initial, 8000, storage);
    store.retryHydration();
    pending[0].resolve(JSON.stringify({ lang: 'fr', progress: {}, extra: 0 }));
    mock.timers.tick(10_000);
    await drain();
    assert.equal(sets.length, 0);
    assert.equal(removes.n, 0);

    pending[1].resolve(JSON.stringify(saved));
    await drain();
    mock.timers.tick(500);
    await drain();
    assert.equal(sets.length, 0);
    assert.equal(store.get().extra, 4);
    assert.deepEqual(store.get().progress, { contrat: { best: 80 } });

    store.set({ extra: 7 });
    store.retryHydration();
    mock.timers.tick(10_000);
    await drain();
    assert.equal(sets.length, 0);
    pending[2].resolve(JSON.stringify(saved));
    await drain();
    mock.timers.tick(500);
    await drain();
    assert.equal(sets.length, 0);
    assert.equal(store.get().extra, 4);
    assert.deepEqual(store.get().progress.contrat, { best: 80 });
  } finally {
    mock.timers.reset();
  }
});

test('reset after a successful read removes the key and saves only the later patch', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { storage, pending, sets, removes } = fakeStorage();
    const store = createPersistedStore('rhmaster:v1', initial, 8000, storage);
    pending[0].resolve(JSON.stringify(saved));
    await drain();
    store.reset();
    store.set({ lang: 'it' });
    mock.timers.tick(150);
    await drain();
    assert.equal(removes.n, 1);
    assert.equal(sets.length, 1);
    assert.deepEqual(JSON.parse(sets[0]), { lang: 'it', progress: {}, extra: 0 });
  } finally {
    mock.timers.reset();
  }
});

test('after a successful read, set persists the merged state', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { storage, pending, sets } = fakeStorage();
    const store = createPersistedStore('rhmaster:v1', initial, 8000, storage);
    pending[0].resolve(JSON.stringify(saved));
    await drain();
    mock.timers.tick(500);
    await drain();
    assert.equal(sets.length, 0);
    store.set((s) => ({ extra: s.extra + 1 }));
    mock.timers.tick(150);
    await drain();
    assert.equal(sets.length, 1);
    assert.deepEqual(JSON.parse(sets[0]), { ...saved, extra: 5 });
  } finally {
    mock.timers.reset();
  }
});
