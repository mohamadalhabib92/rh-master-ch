import type { LearnBlob, LearnSettings, StreakEvent } from './learn-state';
import { nextBadgeIds, touchStreak } from './learn-state';
import { freshCard, reviewCard, type SrsCard, type SrsGrade } from './srs';
import { appStore, type AppState } from './store';

export function todayIso(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function applyStreak(learn: LearnBlob, today: string): { learn: LearnBlob; event: StreakEvent } {
  const touched = touchStreak(learn.streak, today);
  return { learn: { ...learn, streak: touched.streak }, event: touched.event };
}

function withBadges(learn: LearnBlob): LearnBlob {
  const lessons = Object.keys(learn.lessons).length;
  const mocks = learn.mocks.length;
  const fresh = nextBadgeIds({
    xp: learn.xp,
    lessons,
    reviews: learn.reviews,
    streak: learn.streak.count,
    mocks,
    plan: !!learn.plan,
    owned: learn.badges,
  });
  if (fresh.length === 0) return learn;
  return { ...learn, badges: [...learn.badges, ...fresh] };
}

export function updateLearnSettings(partial: Partial<LearnSettings>) {
  appStore.set((s) => ({ learn: { ...s.learn, settings: { ...s.learn.settings, ...partial } } }));
}

export function setOnboarded() {
  updateLearnSettings({ onboarded: true });
}

export function setResume(resume: LearnBlob['resume']) {
  appStore.set((s) => ({ learn: { ...s.learn, resume } }));
}

export function completeLesson(id: string): StreakEvent {
  let event: StreakEvent = 'same';
  appStore.set((s) => {
    const today = todayIso();
    const stamped = applyStreak(s.learn, today);
    event = stamped.event;
    const learn = withBadges({
      ...stamped.learn,
      xp: stamped.learn.xp + 20,
      lessons: { ...stamped.learn.lessons, [id]: { at: today } },
      resume: null,
    });
    return { learn };
  });
  return event;
}

export function gradeFlashcard(id: string, grade: SrsGrade): StreakEvent {
  let event: StreakEvent = 'same';
  appStore.set((s) => {
    const today = todayIso();
    const stamped = applyStreak(s.learn, today);
    event = stamped.event;
    const current = (stamped.learn.srs[id] as SrsCard | undefined) ?? freshCard(today);
    const next = reviewCard(current, grade, today);
    const learn = withBadges({
      ...stamped.learn,
      xp: stamped.learn.xp + (grade >= 3 ? 8 : 3),
      reviews: stamped.learn.reviews + 1,
      srs: { ...stamped.learn.srs, [id]: next },
    });
    return { learn };
  });
  return event;
}

export function saveAnswer(id: string, competenceId: string, ok: boolean) {
  appStore.set((s) => ({
    learn: {
      ...s.learn,
      xp: s.learn.xp + (ok ? 6 : 2),
      answers: { ...s.learn.answers, [id]: { competenceId, ok, at: todayIso() } },
    },
  }));
}

export function saveDrill(id: string, best: number) {
  appStore.set((s) => {
    const prev = s.learn.drills[id] as { attempts?: number; best?: number } | undefined;
    const learn = withBadges({
      ...applyStreak(s.learn, todayIso()).learn,
      xp: s.learn.xp + 12,
      drills: { ...s.learn.drills, [id]: { best: Math.max(best, prev?.best ?? 0), attempts: (prev?.attempts ?? 0) + 1, at: todayIso() } },
    });
    return { learn };
  });
}

export function saveCase(id: string, note: number) {
  appStore.set((s) => ({
    learn: withBadges({
      ...applyStreak(s.learn, todayIso()).learn,
      xp: s.learn.xp + 16,
      cases: { ...s.learn.cases, [id]: { note, at: todayIso() } },
    }),
  }));
}

export function saveMock(examId: string, note: number) {
  appStore.set((s) => ({
    learn: withBadges({
      ...applyStreak(s.learn, todayIso()).learn,
      xp: s.learn.xp + 24,
      mocks: [...s.learn.mocks, { examId, note, at: todayIso() }],
    }),
  }));
}

export function savePlan(plan: { trackId: string; examDate: string; weeklyMinutes: number }) {
  appStore.set((s) => ({
    learn: withBadges({ ...s.learn, plan }),
  }));
}

export function learnOf(state: AppState): LearnBlob {
  return state.learn;
}
