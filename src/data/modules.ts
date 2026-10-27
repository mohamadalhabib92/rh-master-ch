import { M1, M2, M3 } from './m1-3';
import { M4, M5, M6 } from './m4-6';
import { M7, M8, M9 } from './m7-9';
import { QUESTION_TRANSLATIONS } from './qtrans';
import type { Module } from './types';

export const MODULES: Module[] = [M1, M2, M3, M4, M5, M6, M7, M8, M9].map((m) => ({
  ...m,
  questions: m.questions.map((q) => ({ ...q, ...(QUESTION_TRANSLATIONS[q.id] ?? {}) })),
}));

export const ALL_QUESTIONS = MODULES.flatMap((m) => m.questions.map((q) => ({ ...q, moduleId: m.id })));
export const findModule = (id?: string) => MODULES.find((m) => m.id === id);
