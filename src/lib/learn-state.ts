/**
 * Migration additive de la clé `rhmaster:v1`.
 * schemaVersion reste 1. Une version future (2 et plus) n'est pas réécrite :
 * adoptLearningRecord la refuse avant cette fonction.
 * Aucune clé existante (progression, erreurs, notes inconnues) n'est retirée.
 */
import { adoptLearningRecord } from './learning-state';
import { addIsoDays, isoDiffDays } from './srs';

export type LearnSettings = {
  dark: boolean;
  contrast: 'default' | 'high';
  reduceMotion: boolean;
  dyslexiaFont: boolean;
  celebrations: 'full' | 'reduced' | 'off';
  haptics: boolean;
  focusMinutes: number;
  breakMinutes: number;
  reminder: 'off' | 'gentle';
  speechRate: number;
  onboarded: boolean;
};

export type StreakState = {
  count: number;
  lastDay: string | null;
  freezes: number;
  freezeMonth: string | null;
};

export type LearnBlob = {
  srs: Record<string, unknown>;
  xp: number;
  reviews: number;
  badges: string[];
  streak: StreakState;
  settings: LearnSettings;
  plan: Record<string, unknown> | null;
  resume: Record<string, unknown> | null;
  lessons: Record<string, unknown>;
  drills: Record<string, unknown>;
  cases: Record<string, unknown>;
  mocks: unknown[];
  answers: Record<string, unknown>;
};

export const FOCUS_CHOICES = [10, 15, 25, 45] as const;

export const DEFAULT_LEARN_SETTINGS: LearnSettings = {
  dark: false,
  contrast: 'default',
  reduceMotion: false,
  dyslexiaFont: false,
  celebrations: 'full',
  haptics: true,
  focusMinutes: 15,
  breakMinutes: 3,
  reminder: 'gentle',
  speechRate: 0.95,
  onboarded: false,
};

export function emptyLearn(): LearnBlob {
  return {
    srs: {},
    xp: 0,
    reviews: 0,
    badges: [],
    streak: { count: 0, lastDay: null, freezes: 2, freezeMonth: null },
    settings: { ...DEFAULT_LEARN_SETTINGS },
    plan: null,
    resume: null,
    lessons: {},
    drills: {},
    cases: {},
    mocks: [],
    answers: {},
  };
}

function isObj(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function replenish(streak: StreakState, today: string): StreakState {
  const month = today.slice(0, 7);
  if (streak.freezeMonth === month) return streak;
  return { ...streak, freezes: 2, freezeMonth: month };
}

export type StreakEvent = 'same' | 'up' | 'freeze' | 'reset';

/** Série douce : un gel couvre un jour manqué. Pas de compteur négatif. */
export function touchStreak(streak: StreakState, today: string): { streak: StreakState; event: StreakEvent } {
  const base = replenish(streak, today);
  if (base.lastDay === today) return { streak: base, event: 'same' };
  if (!base.lastDay) return { streak: { ...base, count: 1, lastDay: today }, event: 'up' };
  const gap = isoDiffDays(base.lastDay, today);
  if (gap <= 0) return { streak: { ...base, lastDay: today }, event: 'same' };
  if (gap === 1) return { streak: { ...base, count: base.count + 1, lastDay: today }, event: 'up' };
  if (gap === 2 && base.freezes > 0) {
    return { streak: { ...base, count: base.count + 1, lastDay: today, freezes: base.freezes - 1 }, event: 'freeze' };
  }
  return { streak: { ...base, count: 1, lastDay: today }, event: 'reset' };
}

export function levelFor(xp: number): number {
  return 1 + Math.floor(Math.max(0, xp) / 120);
}

export function migrateLearningRecord(record: Record<string, unknown>): Record<string, unknown> {
  const prev = isObj(record.learn) ? record.learn : {};
  const settingsPrev = isObj(prev.settings) ? prev.settings : {};
  const streakPrev = isObj(prev.streak) ? prev.streak : {};
  const settings = { ...DEFAULT_LEARN_SETTINGS, ...settingsPrev };
  if (!FOCUS_CHOICES.includes(settings.focusMinutes as (typeof FOCUS_CHOICES)[number])) settings.focusMinutes = 15;
  if (settings.contrast !== 'high') settings.contrast = 'default';
  if (settings.celebrations !== 'reduced' && settings.celebrations !== 'off') settings.celebrations = 'full';
  if (settings.reminder !== 'off') settings.reminder = 'gentle';
  const streak: StreakState = {
    ...streakPrev,
    count: typeof streakPrev.count === 'number' ? streakPrev.count : 0,
    lastDay: typeof streakPrev.lastDay === 'string' ? streakPrev.lastDay : null,
    freezes: typeof streakPrev.freezes === 'number' ? streakPrev.freezes : 2,
    freezeMonth: typeof streakPrev.freezeMonth === 'string' ? streakPrev.freezeMonth : null,
  };
  const learn: Record<string, unknown> = {
    ...prev,
    srs: isObj(prev.srs) ? prev.srs : {},
    xp: typeof prev.xp === 'number' ? prev.xp : 0,
    reviews: typeof prev.reviews === 'number' ? prev.reviews : 0,
    badges: Array.isArray(prev.badges) ? prev.badges.filter((item) => typeof item === 'string') : [],
    streak,
    settings,
    plan: isObj(prev.plan) ? prev.plan : null,
    resume: isObj(prev.resume) ? prev.resume : null,
    lessons: isObj(prev.lessons) ? prev.lessons : {},
    drills: isObj(prev.drills) ? prev.drills : {},
    cases: isObj(prev.cases) ? prev.cases : {},
    mocks: Array.isArray(prev.mocks) ? prev.mocks : [],
    answers: isObj(prev.answers) ? prev.answers : {},
  };
  return { ...record, learn };
}

/** null = ne pas réécrire (version future ou forme incompatible). */
export function reviseStoredLearning(value: Record<string, unknown>): Record<string, unknown> | null {
  const adopted = adoptLearningRecord(value);
  if (!adopted.ok) return null;
  return migrateLearningRecord(adopted.record);
}

export function hasPriorProgress(record: Record<string, unknown>): boolean {
  const progress = isObj(record.progress) ? record.progress : {};
  const fiche = isObj(record.ficheRead) ? record.ficheRead : {};
  if (Object.keys(progress).length > 0) return true;
  return Object.values(fiche).some(Boolean);
}

/** Les personnes qui ont déjà une progression ne sont pas bloquées par l'introduction. */
export function shouldShowOnboarding(record: Record<string, unknown>): boolean {
  const migrated = migrateLearningRecord(record);
  const learn = migrated.learn as { settings?: { onboarded?: boolean } };
  if (learn.settings?.onboarded) return false;
  if (hasPriorProgress(record)) return false;
  return true;
}

export function nextBadgeIds(input: { xp: number; lessons: number; reviews: number; streak: number; mocks: number; plan: boolean; owned: string[] }): string[] {
  const earned: string[] = [];
  if (input.lessons >= 1) earned.push('premiere-lecon');
  if (input.reviews >= 10) earned.push('dix-cartes');
  if (input.streak >= 3) earned.push('serie-douce');
  if (input.mocks >= 1) earned.push('premier-blanc');
  if (input.plan) earned.push('plan-pose');
  if (input.xp >= 120) earned.push('niveau-2');
  return earned.filter((id) => !input.owned.includes(id));
}

export function addDaysPreview(today: string, days: number): string {
  return addIsoDays(today, days);
}
