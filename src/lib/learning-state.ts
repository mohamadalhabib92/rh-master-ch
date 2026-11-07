/**
 * Contrat de la progression locale `rhmaster:v1`.
 * Aucun compte, aucun serveur. Les identifiants de questions déjà enregistrés
 * ne sont ni filtrés ni réécrits : une version future inconnue n'est pas
 * écrasée par cet état.
 */

export const LEARNING_STORAGE_KEY = 'rhmaster:v1';
export const LEARNING_SCHEMA_VERSION = 1 as const;

export type LearningLang = 'fr' | 'de' | 'it' | 'en';

export type ModuleProgress = {
  best: number;
  attempts: number;
  correct: string[];
  lastAt: number;
};

/** Champs lus par l'app. Les clés inconnues restent dans le blob. */
export type LearningStateFields = {
  schemaVersion: typeof LEARNING_SCHEMA_VERSION;
  lang: LearningLang;
  ficheRead: Record<string, boolean>;
  progress: Record<string, ModuleProgress>;
  mistakes: string[];
  lastModule: string | null;
  disclaimerSeen: boolean;
};

export type AdoptResult =
  | { ok: true; record: Record<string, unknown>; from: 'legacy' | 'v1' }
  | { ok: false; reason: 'unsupported-version' | 'incompatible-shape' };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Accepte l'état actuel et l'état déjà sur l'appareil sans `schemaVersion`.
 * Refuse une version supérieure ou une forme qui ne peut pas être conservée
 * sans la vider. Ne supprime aucune clé.
 */
export function adoptLearningRecord(value: Record<string, unknown>): AdoptResult {
  if ('schemaVersion' in value && value.schemaVersion !== LEARNING_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported-version' };
  }
  if ('progress' in value && !isPlainObject(value.progress)) {
    return { ok: false, reason: 'incompatible-shape' };
  }
  if ('mistakes' in value && !isStringArray(value.mistakes)) {
    return { ok: false, reason: 'incompatible-shape' };
  }
  if ('ficheRead' in value && !isPlainObject(value.ficheRead)) {
    return { ok: false, reason: 'incompatible-shape' };
  }
  const from = value.schemaVersion === LEARNING_SCHEMA_VERSION ? 'v1' : 'legacy';
  return { ok: true, from, record: { ...value, schemaVersion: LEARNING_SCHEMA_VERSION } };
}

/**
 * Lecture naïve d'un blob déjà écrit par cette version, comme le ferait
 * l'app d'avant le champ `schemaVersion` : étaler l'objet, sans le vider.
 */
export function rollbackRead(raw: string, legacyInitial: Record<string, unknown>): Record<string, unknown> | null {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!isPlainObject(value)) return null;
    return { ...legacyInitial, ...value };
  } catch {
    return null;
  }
}
