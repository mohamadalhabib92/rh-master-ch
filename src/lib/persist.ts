import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

export type HydrationPhase = 'pending' | 'ready' | 'timedOut';
export type ResetPhase = 'idle' | 'pending' | 'done';

export type DataStatus = {
  unreadable: boolean;
  rawBackup: string | null;
  resetPhase: ResetPhase;
};

export type PersistStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

type Patch<T> = Partial<T> | ((s: T) => Partial<T>);

const SAVE_DELAY_MS = 150;

/**
 * Store persistant (AsyncStorage, localStorage sur le web).
 * La clé ne change pas. La fusion est additive.
 *
 * setItem et removeItem ne partent qu'après un getItem abouti pour cette
 * tentative. Le timeout, « Réessayer » et « Continuer hors ligne » ne sont
 * pas une lecture réussie. Sur main, un Promise.race de 2,5 s pouvait
 * résoudre null, marquer le store prêt, puis le set() suivant écrivait
 * l'état initial par-dessus la progression.
 * Les modifications faites avant la lecture sont rejouées sur les données
 * lues, pas fusionnées par-dessus un état vide.
 */
export function createPersistedStore<T extends object>(
  key: string,
  initial: T,
  timeoutMs = 8000,
  storage: PersistStorage = AsyncStorage,
  /**
   * Contrat optionnel après une lecture JSON réussie.
   * `null` : le blob reste illisible, aucune écriture (version future ou forme incompatible).
   */
  revise?: (value: Partial<T>) => Partial<T> | null,
) {
  let state: T = initial;
  let phase: HydrationPhase = 'pending';
  let generation = 0;
  /** Génération dont le getItem a abouti (promesse tenue, JSON lisible ou clé absente). */
  let fulfilledGeneration = 0;
  /** getItem encore en cours pour cette génération. 0 = aucun. */
  let inflightGeneration = 0;
  let unreadable = false;
  let rawBackup: string | null = null;
  let resetPhase: ResetPhase = 'idle';
  let pendingReset = false;
  let dataStatus: DataStatus = { unreadable: false, rawBackup: null, resetPhase: 'idle' };
  let pendingPatches: Patch<T>[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let writeChain: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const canWrite = () => fulfilledGeneration === generation && !unreadable;

  const syncStatus = () => {
    if (
      dataStatus.unreadable === unreadable &&
      dataStatus.rawBackup === rawBackup &&
      dataStatus.resetPhase === resetPhase
    ) {
      return;
    }
    dataStatus = { unreadable, rawBackup, resetPhase };
  };

  const clearHydrationTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const clearSaveTimer = () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
  };

  const applyPatch = (base: T, patch: Patch<T>): T => {
    const partial = typeof patch === 'function' ? patch(base) : patch;
    return { ...base, ...partial };
  };

  const enqueueWrite = (op: () => Promise<void>) => {
    const genAt = generation;
    writeChain = writeChain
      .catch(() => undefined)
      .then(() => {
        if (genAt !== generation || !canWrite()) return undefined;
        return op().then(() => undefined);
      });
  };

  const schedulePersist = () => {
    if (!canWrite()) return;
    clearSaveTimer();
    const genAt = generation;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      if (genAt !== generation || !canWrite()) return;
      const payload = JSON.stringify(state);
      enqueueWrite(() => storage.setItem(key, payload));
    }, SAVE_DELAY_MS);
  };

  const scheduleRemove = (after?: () => void) => {
    if (!canWrite()) return;
    clearSaveTimer();
    enqueueWrite(() =>
      storage.removeItem(key).then(() => {
        after?.();
      }),
    );
  };

  const parseStored = (raw: string | null): { ok: true; value: Partial<T> } | { ok: false } => {
    if (raw === null) return { ok: true, value: {} };
    try {
      const value = JSON.parse(raw) as unknown;
      if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false };
      return { ok: true, value: value as Partial<T> };
    } catch {
      return { ok: false };
    }
  };

  const hydrate = (keepReset = false) => {
    const my = ++generation;
    inflightGeneration = my;
    phase = 'pending';
    if (!keepReset) {
      pendingReset = false;
      pendingPatches = [];
    }
    clearHydrationTimer();
    clearSaveTimer();
    emit();
    timer = setTimeout(() => {
      if (my !== generation || fulfilledGeneration === my || phase !== 'pending') return;
      phase = 'timedOut';
      emit();
    }, timeoutMs);

    const finishInflight = () => {
      if (inflightGeneration === my) inflightGeneration = 0;
    };

    const applyReset = (patches: Patch<T>[]) => {
      pendingReset = false;
      pendingPatches = [];
      state = initial;
      for (const patch of patches) state = applyPatch(state, patch);
      fulfilledGeneration = my;
      unreadable = false;
      phase = 'ready';
      // Suppression explicite : removeItem, jamais un setItem de l'état vide.
      resetPhase = 'pending';
      syncStatus();
      scheduleRemove(() => {
        resetPhase = 'done';
        syncStatus();
        emit();
      });
      if (patches.length > 0) schedulePersist();
      emit();
    };

    storage
      .getItem(key)
      .then((raw) => {
        if (my !== generation) return;
        finishInflight();
        clearHydrationTimer();
        const parsed = parseStored(raw);
        const patches = pendingPatches;
        if (!parsed.ok) {
          // Copie brute conservée. Aucun setItem ni removeItem.
          rawBackup = raw ?? '';
          unreadable = true;
          pendingReset = false;
          resetPhase = 'idle';
          phase = 'ready';
          syncStatus();
          emit();
          return;
        }
        let adopted: Partial<T> = parsed.value;
        if (revise) {
          const next = revise(parsed.value);
          if (!next) {
            // Version ou forme non adoptable. On ne réinitialise pas le disque.
            rawBackup = raw ?? '';
            unreadable = true;
            pendingReset = false;
            resetPhase = 'idle';
            phase = 'ready';
            syncStatus();
            emit();
            return;
          }
          adopted = next;
        }
        rawBackup = null;
        unreadable = false;
        if (pendingReset) {
          applyReset(patches);
          return;
        }
        if (resetPhase === 'pending') resetPhase = 'idle';
        pendingPatches = [];
        state = { ...initial, ...adopted };
        for (const patch of patches) state = applyPatch(state, patch);
        fulfilledGeneration = my;
        unreadable = false;
        phase = 'ready';
        syncStatus();
        emit();
        if (patches.length > 0) schedulePersist();
      })
      .catch(() => {
        if (my !== generation) return;
        finishInflight();
        clearHydrationTimer();
        if (phase === 'pending') phase = 'timedOut';
        emit();
      });
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  hydrate();

  return {
    get: () => state,
    set(patch: Patch<T>) {
      if (!canWrite()) pendingPatches.push(patch);
      state = applyPatch(state, patch);
      emit();
      schedulePersist();
    },
    reset() {
      clearSaveTimer();
      if (unreadable) {
        resetPhase = 'idle';
        syncStatus();
        emit();
        return;
      }
      state = initial;
      pendingPatches = [];
      if (canWrite()) {
        pendingReset = false;
        resetPhase = 'pending';
        syncStatus();
        emit();
        scheduleRemove(() => {
          resetPhase = 'done';
          syncStatus();
          emit();
        });
        return;
      }
      pendingReset = true;
      resetPhase = 'pending';
      syncStatus();
      emit();
      if (inflightGeneration !== generation) hydrate(true);
    },
    isUnreadable: () => unreadable,
    getRawBackup: () => rawBackup,
    getResetPhase: () => resetPhase,
    /** Relance la lecture. Annule toute écriture encore armée. N'écrit rien. */
    retryHydration() {
      hydrate(pendingReset);
    },
    /**
     * Affiche les données embarquées sans attendre le stockage.
     * N'autorise aucune écriture tant que getItem n'a pas abouti.
     */
    continueOffline() {
      if (phase === 'ready') return;
      phase = 'ready';
      emit();
    },
    useStore(): T {
      return useSyncExternalStore(subscribe, () => state, () => state);
    },
    useHydrated(): boolean {
      return useSyncExternalStore(subscribe, () => phase === 'ready', () => phase === 'ready');
    },
    usePhase(): HydrationPhase {
      return useSyncExternalStore(subscribe, () => phase, () => phase);
    },
    useDataStatus(): DataStatus {
      return useSyncExternalStore(subscribe, () => dataStatus, () => dataStatus);
    },
  };
}
