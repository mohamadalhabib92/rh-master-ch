import { LAWS } from './laws';
import { M1, M2, M3 } from './m1-3';
import { M4, M5, M6 } from './m4-6';
import { M7, M8, M9 } from './m7-9';
import { QUESTION_TRANSLATIONS } from './qtrans';
import type { Module, Question } from './types';

/** Complète le schéma sans réécrire les énoncés ni les id (la progression locale s'appuie dessus). */
function withSchema(m: Module): Module {
  return {
    ...m,
    questions: m.questions.map((q): Question => {
      const translated = QUESTION_TRANSLATIONS[q.id] ?? {};
      const lawName = LAWS[q.law]?.fr;
      return {
        ...q,
        ...translated,
        moduleId: q.moduleId ?? m.id,
        type: q.type ?? 'single',
        source: q.source ?? (lawName ? lawName : 'YOUR_LEGAL_SOURCE'),
        status: q.status ?? 'a_valider',
      };
    }),
  };
}

export const MODULES: Module[] = [M1, M2, M3, M4, M5, M6, M7, M8, M9].map(withSchema);

export const ALL_QUESTIONS = MODULES.flatMap((m) => m.questions.map((q) => ({ ...q, moduleId: m.id })));
export const findModule = (id?: string) => MODULES.find((m) => m.id === id);
