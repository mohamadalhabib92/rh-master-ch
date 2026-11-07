import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '../i18n/strings';
import { adoptLearningRecord, LEARNING_SCHEMA_VERSION, LEARNING_STORAGE_KEY } from './learning-state';
import { createPersistedStore } from './persist';

export type ModuleProgress = { best: number; attempts: number; correct: string[]; lastAt: number };

export type AppState = {
  schemaVersion: typeof LEARNING_SCHEMA_VERSION;
  lang: Lang;
  ficheRead: Record<string, boolean>;
  progress: Record<string, ModuleProgress>;
  mistakes: string[];
  lastModule: string | null;
  disclaimerSeen: boolean;
};

function reviseAppState(value: Partial<AppState>): Partial<AppState> | null {
  const adopted = adoptLearningRecord(value as Record<string, unknown>);
  if (!adopted.ok) return null;
  return adopted.record as Partial<AppState>;
}

export const appStore = createPersistedStore<AppState>(
  LEARNING_STORAGE_KEY,
  {
    schemaVersion: LEARNING_SCHEMA_VERSION,
    lang: 'fr',
    ficheRead: {},
    progress: {},
    mistakes: [],
    lastModule: null,
    disclaimerSeen: false,
  },
  8000,
  AsyncStorage,
  reviseAppState,
);

/** Enregistre une réponse : met à jour les bonnes réponses et la liste d’erreurs à revoir. */
export function recordAnswer(moduleId: string, questionId: string, ok: boolean) {
  appStore.set((s) => {
    const p = s.progress[moduleId] ?? { best: 0, attempts: 0, correct: [], lastAt: 0 };
    const correct = ok ? Array.from(new Set([...p.correct, questionId])) : p.correct;
    const mistakes = ok ? s.mistakes.filter((m) => m !== questionId) : Array.from(new Set([...s.mistakes, questionId]));
    return { progress: { ...s.progress, [moduleId]: { ...p, correct, lastAt: Date.now() } }, mistakes, lastModule: moduleId };
  });
}

export function finishQuiz(moduleId: string, pct: number, full: boolean) {
  appStore.set((s) => {
    const p = s.progress[moduleId] ?? { best: 0, attempts: 0, correct: [], lastAt: 0 };
    return { progress: { ...s.progress, [moduleId]: { ...p, attempts: p.attempts + 1, best: full ? Math.max(p.best, pct) : p.best, lastAt: Date.now() } } };
  });
}
