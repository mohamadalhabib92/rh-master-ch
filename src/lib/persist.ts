import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import {
  buildProgressExport,
  planRestore,
  SIDE_KEY_SUFFIX,
  verifyProgressExport,
  type ProgressCounts,
  type ProgressExportV1,
} from './progress-export';

export type HydrationPhase = 'pending' | 'ready' | 'timedOut';
export type ResetPhase = 'idle' | 'pending' | 'done' | 'failed';

export type HealthySummary = {
  sha256: string;
  counts: ProgressCounts;
  sideReady: boolean;
};

export type DataStatus = {
  unreadable: boolean;
  rawBackup: string | null;
  resetPhase: ResetPhase;
  /** Empreinte et comptes seulement. Jamais le JSON. */
  healthy: HealthySummary | null;
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
 * Une confirmation de reset avant cette lecture est ignorée : le blob lu
 * est affiché, pas supprimé. Si removeItem échoue, aucune écriture suivante
 * ne remplace le blob ; la dernière copie adoptée est relue.
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
  let writeBlocked = false;
  /** Dernier état adopté depuis une lecture réussie. Sert si la suppression échoue. */
  let adoptedSnapshot: T | null = null;
  let dataStatus: DataStatus = { unreadable: false, rawBackup: null, resetPhase: 'idle', healthy: null };
  /** Premiers octets sains lus. Ils ne sont pas réaffichés. */
  let originalRaw: string | null = null;
  let sideCopyReady = false;
  const sideKey = `${key}${SIDE_KEY_SUFFIX}`;
  let pendingPatches: Patch<T>[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let writeChain: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const canWrite = () => fulfilledGeneration === generation && !unreadable && !writeBlocked;

  const healthySummary = (): HealthySummary | null => {
    if (!originalRaw) return null;
    const built = buildProgressExport(originalRaw);
    if (!built) return null;
    return { sha256: built.sha256, counts: built.counts, sideReady: sideCopyReady };
  };

  const syncStatus = () => {
    const healthy = healthySummary();
    const sameHealthy =
      dataStatus.healthy?.sha256 === healthy?.sha256 &&
      dataStatus.healthy?.sideReady === healthy?.sideReady &&
      dataStatus.healthy?.counts.correctIds === healthy?.counts.correctIds;
    if (
      dataStatus.unreadable === unreadable &&
      dataStatus.rawBackup === rawBackup &&
      dataStatus.resetPhase === resetPhase &&
      sameHealthy
    ) {
      return;
    }
    dataStatus = { unreadable, rawBackup, resetPhase, healthy };
  };

  const ensureSideCopy = async () => {
    if (!originalRaw || sideCopyReady) return;
    const envelope = buildProgressExport(originalRaw);
    if (!envelope) return;
    await storage.setItem(sideKey, JSON.stringify(envelope));
    const back = await storage.getItem(sideKey);
    let parsed: unknown = null;
    try {
      parsed = back ? JSON.parse(back) : null;
    } catch {
      parsed = null;
    }
    const checked = verifyProgressExport(parsed);
    if (!checked.ok || checked.value.sha256 !== envelope.sha256 || checked.value.payload !== originalRaw) {
      throw new Error('side-copy');
    }
    sideCopyReady = true;
    syncStatus();
    emit();
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

  const enqueueWrite = (op: () => Promise<void>, onReject?: () => void) => {
    const genAt = generation;
    writeChain = writeChain
      .catch(() => undefined)
      .then(() => {
        if (genAt !== generation || !canWrite()) return undefined;
        return op().then(
          () => undefined,
          () => {
            onReject?.();
          },
        );
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
      const needsSide = originalRaw != null && payload !== originalRaw && !sideCopyReady;
      enqueueWrite(() =>
        (needsSide ? ensureSideCopy() : Promise.resolve()).then(() => storage.setItem(key, payload)),
      );
    }, SAVE_DELAY_MS);
  };

  const rereadAfterFailedDelete = () => {
    const my = ++generation;
    inflightGeneration = my;
    writeBlocked = true;
    clearSaveTimer();
    pendingPatches = [];
    storage
      .getItem(key)
      .then((raw) => {
        if (my !== generation) return;
        if (inflightGeneration === my) inflightGeneration = 0;
        const parsed = parseStored(raw);
        if (!parsed.ok) {
          rawBackup = raw ?? '';
          unreadable = true;
          phase = 'ready';
          syncStatus();
          emit();
          return;
        }
        let adopted: Partial<T> = parsed.value;
        if (revise) {
          const next = revise(parsed.value);
          if (!next) {
            rawBackup = raw ?? '';
            unreadable = true;
            phase = 'ready';
            syncStatus();
            emit();
            return;
          }
          adopted = next;
        }
        pendingPatches = [];
        state = { ...initial, ...adopted };
        adoptedSnapshot = state;
        rawBackup = null;
        unreadable = false;
        writeBlocked = false;
        fulfilledGeneration = my;
        phase = 'ready';
        syncStatus();
        emit();
      })
      .catch(() => {
        if (my !== generation) return;
        if (inflightGeneration === my) inflightGeneration = 0;
        phase = 'ready';
        emit();
      });
  };

  const failDelete = () => {
    writeBlocked = true;
    clearSaveTimer();
    pendingPatches = [];
    if (adoptedSnapshot) state = adoptedSnapshot;
    resetPhase = 'failed';
    syncStatus();
    emit();
    rereadAfterFailedDelete();
  };

  const scheduleRemove = (after?: () => void) => {
    if (!canWrite()) return;
    clearSaveTimer();
    const genAt = generation;
    writeChain = writeChain.catch(() => undefined).then(() => {
      if (genAt !== generation || !canWrite()) return undefined;
      return ensureSideCopy()
        .catch(() => undefined)
        .then(() => storage.removeItem(key))
        .then(
          () => {
            after?.();
          },
          () => {
            failDelete();
          },
        );
    });
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

  const hydrate = () => {
    const my = ++generation;
    inflightGeneration = my;
    phase = 'pending';
    pendingPatches = [];
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
        if (raw && originalRaw == null) originalRaw = raw;
        if (resetPhase === 'pending') resetPhase = 'idle';
        pendingPatches = [];
        state = { ...initial, ...adopted };
        for (const patch of patches) state = applyPatch(state, patch);
        adoptedSnapshot = state;
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
    reset(afterRemoved?: () => void) {
      clearSaveTimer();
      // Tant que la lecture n'a pas abouti, une confirmation est aveugle :
      // elle ne pose pas de suppression différée.
      if (unreadable || !canWrite()) return;
      adoptedSnapshot = state;
      state = initial;
      pendingPatches = [];
      resetPhase = 'pending';
      syncStatus();
      emit();
      scheduleRemove(() => {
        adoptedSnapshot = state;
        resetPhase = 'done';
        syncStatus();
        emit();
        afterRemoved?.();
      });
    },
    isUnreadable: () => unreadable,
    getRawBackup: () => rawBackup,
    getResetPhase: () => resetPhase,
    /** Enveloppe de l'état sain d'origine. N'écrit pas et n'affiche pas le JSON. */
    getHealthyExport(): ProgressExportV1 | null {
      return originalRaw ? buildProgressExport(originalRaw) : null;
    },
    /**
     * Relit la copie latérale, vérifie empreinte et comptes, réécrit la clé
     * principale sans supprimer la copie.
     */
    restoreSideCopy(): Promise<'restored' | 'missing' | 'rejected'> {
      return storage.getItem(sideKey).then((back) => {
        let parsed: unknown = null;
        try {
          parsed = back ? JSON.parse(back) : null;
        } catch {
          parsed = null;
        }
        const plan = planRestore(parsed);
        if (!plan.ok) return back ? 'rejected' : 'missing';
        return storage.setItem(key, plan.payload).then(() => {
          const value = JSON.parse(plan.payload) as Partial<T>;
          const adopted = revise ? revise(value) : value;
          if (!adopted) return 'rejected' as const;
          state = { ...initial, ...adopted };
          adoptedSnapshot = state;
          sideCopyReady = true;
          unreadable = false;
          rawBackup = null;
          writeBlocked = false;
          fulfilledGeneration = generation;
          phase = 'ready';
          resetPhase = 'idle';
          syncStatus();
          emit();
          return 'restored' as const;
        });
      });
    },
    /** Applique un export déjà vérifié. Refuse sans écrire si l'empreinte ne tient pas. */
    applyVerifiedRestore(input: unknown): Promise<'restored' | 'rejected'> {
      const plan = planRestore(input);
      if (!plan.ok) return Promise.resolve('rejected');
      return storage.setItem(key, plan.payload).then(() => {
        const value = JSON.parse(plan.payload) as Partial<T>;
        const adopted = revise ? revise(value) : value;
        if (!adopted) return 'rejected' as const;
        state = { ...initial, ...adopted };
        adoptedSnapshot = state;
        unreadable = false;
        rawBackup = null;
        writeBlocked = false;
        fulfilledGeneration = generation;
        phase = 'ready';
        resetPhase = 'idle';
        syncStatus();
        emit();
        return 'restored' as const;
      });
    },
    /** Relance la lecture. Annule toute écriture encore armée. N'écrit rien. */
    retryHydration() {
      hydrate();
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
