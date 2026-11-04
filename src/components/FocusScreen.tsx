/**
 * Écran « Mode Focus » : choix de la durée (10 min minimum), séance plein écran calme,
 * absence signalée en douceur, sortie d'urgence, moment de réussite, série.
 */
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FOCUS_DURATIONS, FOCUS_MIN_MINUTES, crossedMilestone, dayKey, focusStreak, focusTotals, formatClock, isPaused, minutesLeft, progressOf, remainingMs } from '../lib/focusCore';
import { dismissFocusAway, dismissFocusFinished, emergencyExitFocus, markLockSetupSeen, startFocusSession } from '../lib/focus';
import { useI18n } from '../lib/i18n';
import { colors, radius, space } from '../theme';
import { announce } from './access';
import { EmergencyExit, FOCUS_RING, LockSetupSheet, TickRing, useFocusClock } from './FocusKit';
import { haptic } from './haptics';
import { PressableScale, useReducedMotion } from './motion';

export type FocusActivity = { id: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name']; href?: Href };

const fmtAway = (ms: number, t: ReturnType<typeof useI18n>['t']) => (ms < 60_000 ? t('focusSeconds', { n: Math.max(1, Math.round(ms / 1000)) }) : t('focusMinutesShort', { n: Math.round(ms / 60_000) }));

export function FocusScreen({ activities, focusName }: { activities: FocusActivity[]; focusName: string }) {
  const { t, dir } = useI18n();
  const { f, now } = useFocusClock();
  const [sheet, setSheet] = useState(false);
  const pendingStart = useRef<null | (() => void)>(null);
  const openSheet = () => setSheet(true);
  const closeSheet = () => {
    setSheet(false);
    markLockSetupSeen();
    const go = pendingStart.current;
    pendingStart.current = null;
    go?.();
  };

  // Retour matériel (Android) : bloqué tant que la séance tourne sur cet écran.
  useEffect(() => {
    if (!f.active) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [!!f.active]); // eslint-disable-line react-hooks/exhaustive-deps

  let body: React.ReactNode;
  if (f.active) body = <Running activities={activities} now={now} onLock={openSheet} />;
  else if (f.finished) body = <Finished />;
  else
    body = (
      <Setup
        activities={activities}
        onLock={openSheet}
        onStart={(min, act) => {
          const go = () => {
            startFocusSession(min, act);
            haptic('success');
            announce(t('focusAnnounceStart', { n: min }));
          };
          if (!f.setupSeen) {
            pendingStart.current = go;
            setSheet(true);
          } else go();
        }}
      />
    );
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg, direction: dir }}>
      {body}
      <LockSetupSheet visible={sheet} onClose={closeSheet} focusName={focusName} />
    </SafeAreaView>
  );
}

function Setup({ activities, onStart, onLock }: { activities: FocusActivity[]; onStart: (min: number, act: string) => void; onLock: () => void }) {
  const { t } = useI18n();
  const { f, now } = useFocusClock();
  const [min, setMin] = useState<number>(FOCUS_MIN_MINUTES);
  const [act, setAct] = useState(activities[0]?.id ?? 'stay');
  const streak = focusStreak(f.history, dayKey(now));
  const tot = focusTotals(f.history);
  return (
    <ScrollView contentContainerStyle={styles.setup}>
      <View style={styles.maxW}>
        <PressableScale accessibilityRole="button" accessibilityLabel={t('focusClose')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.close}>
          <Ionicons name="close" size={22} color={colors.text} />
        </PressableScale>
        <View style={styles.badgeIcon}>
          <Ionicons name="leaf-outline" size={24} color={colors.onPrimary} />
        </View>
        <Text accessibilityRole="header" maxFontSizeMultiplier={1.6} style={styles.h1}>{t('focusTitle')}</Text>
        <Text maxFontSizeMultiplier={1.8} style={styles.lead}>{t('focusIntro', { min: FOCUS_MIN_MINUTES })}</Text>
        {tot.sessions > 0 ? (
          <Text maxFontSizeMultiplier={1.6} style={styles.stats}>
            {t('focusStreak', { n: streak })} · {t('focusTotals', { s: tot.sessions, m: tot.minutes })}
          </Text>
        ) : null}

        <Text accessibilityRole="header" maxFontSizeMultiplier={1.6} style={styles.label}>{t('focusDuration')}</Text>
        <View style={styles.durations} accessibilityRole="radiogroup">
          {FOCUS_DURATIONS.map((d) => (
            <PressableScale
              key={d}
              accessibilityRole="radio"
              accessibilityState={{ checked: min === d }}
              accessibilityLabel={t('focusMinutesLong', { n: d })}
              hapticKind="select"
              onPress={() => setMin(d)}
              style={[styles.dur, min === d && { backgroundColor: FOCUS_RING, borderColor: FOCUS_RING }]}
            >
              <Text maxFontSizeMultiplier={1.4} style={[styles.durNum, min === d && { color: colors.onPrimary }]}>{d}</Text>
              <Text maxFontSizeMultiplier={1.4} style={[styles.durUnit, min === d && { color: colors.onPrimary }]}>min</Text>
            </PressableScale>
          ))}
        </View>

        <Text accessibilityRole="header" maxFontSizeMultiplier={1.6} style={styles.label}>{t('focusActivity')}</Text>
        <View style={{ gap: space.sm }} accessibilityRole="radiogroup">
          {activities.map((a) => (
            <PressableScale
              key={a.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: act === a.id }}
              accessibilityLabel={a.label}
              hapticKind="select"
              onPress={() => setAct(a.id)}
              style={[styles.act, act === a.id && { borderColor: FOCUS_RING, backgroundColor: colors.surface }]}
            >
              <Ionicons name={a.icon} size={20} color={act === a.id ? FOCUS_RING : colors.muted} />
              <Text maxFontSizeMultiplier={1.6} style={styles.actText}>{a.label}</Text>
              <Ionicons name={act === a.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={act === a.id ? FOCUS_RING : colors.border} />
            </PressableScale>
          ))}
        </View>

        <PressableScale accessibilityRole="button" accessibilityLabel={t('focusStart', { n: min })} hapticKind="tap" onPress={() => onStart(min, act)} style={styles.start}>
          <Ionicons name="play" size={18} color={colors.onPrimary} />
          <Text maxFontSizeMultiplier={1.6} style={styles.startText}>{t('focusStart', { n: min })}</Text>
        </PressableScale>

        <View style={styles.info}>
          <Text accessibilityRole="header" maxFontSizeMultiplier={1.6} style={styles.infoTitle}>{t('focusWhat')}</Text>
          <Text maxFontSizeMultiplier={1.8} style={styles.infoText}>{t('focusWhatText')}</Text>
        </View>
        <View style={styles.info}>
          <Text accessibilityRole="header" maxFontSizeMultiplier={1.6} style={styles.infoTitle}>{t('focusLimitsTitle')}</Text>
          <Text maxFontSizeMultiplier={1.8} style={styles.infoText}>{t('focusLimitsText')}</Text>
          <PressableScale accessibilityRole="button" accessibilityLabel={t('lockTitle')} onPress={onLock} style={styles.lockBtn}>
            <Ionicons name="lock-closed-outline" size={16} color={FOCUS_RING} />
            <Text maxFontSizeMultiplier={1.6} style={[styles.lockText]}>{t('lockTitle')}</Text>
          </PressableScale>
        </View>
      </View>
    </ScrollView>
  );
}

function Running({ activities, now, onLock }: { activities: FocusActivity[]; now: number; onLock: () => void }) {
  const { t } = useI18n();
  const { f } = useFocusClock();
  const { width, height } = useWindowDimensions();
  const a = f.active!;
  const rem = remainingMs(a, now);
  const paused = isPaused(a);
  const prev = useRef(rem);
  useEffect(() => {
    const m = crossedMilestone(prev.current, rem);
    prev.current = rem;
    if (m != null) announce(m === 1 ? t('focusAnnounceLastMin') : t('focusAnnounceLeft', { n: m }));
  }, [rem]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (f.lastAwayMs > 0) announce(t('focusAway', { d: fmtAway(f.lastAwayMs, t) }));
  }, [f.lastAwayMs]); // eslint-disable-line react-hooks/exhaustive-deps
  const size = Math.min(width - 64, height * 0.42, 340);
  const act = activities.find((x) => x.id === a.activity);
  const ml = minutesLeft(rem);
  return (
    <View style={styles.run}>
      <View style={styles.runTop}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={[styles.dot, { backgroundColor: paused ? colors.muted : FOCUS_RING }]} />
          <Text maxFontSizeMultiplier={1.4} style={styles.eyebrow}>{t('focusTitle')}</Text>
        </View>
        <PressableScale accessibilityRole="button" accessibilityLabel={t('lockTitle')} onPress={onLock} style={styles.iconBtn}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
        </PressableScale>
      </View>

      {f.lastAwayMs > 0 ? (
        <View style={styles.away}>
          <Ionicons name="time-outline" size={18} color={colors.muted} />
          <Text maxFontSizeMultiplier={1.8} style={styles.awayText}>{t('focusAway', { d: fmtAway(f.lastAwayMs, t) })}</Text>
          <PressableScale accessibilityRole="button" accessibilityLabel={t('focusOk')} onPress={dismissFocusAway} style={styles.awayBtn}>
            <Text maxFontSizeMultiplier={1.4} style={styles.awayBtnText}>{t('focusOk')}</Text>
          </PressableScale>
        </View>
      ) : null}

      <View style={styles.center}>
        <TickRing size={size} progress={progressOf(a, now)} label={t('focusTitle')} valueText={t('focusAnnounceLeft', { n: ml })} breathe={!paused}>
          <Text maxFontSizeMultiplier={1.2} style={[styles.clock, { fontSize: Math.round(size * 0.2) }]} accessibilityElementsHidden importantForAccessibility="no">
            {formatClock(rem)}
          </Text>
          <Text maxFontSizeMultiplier={1.4} style={styles.clockSub} accessibilityElementsHidden importantForAccessibility="no">
            {paused ? t('focusPaused') : t('focusRemaining')}
          </Text>
        </TickRing>
      </View>

      <View style={{ gap: space.sm, width: '100%', maxWidth: 480, alignSelf: 'center' }}>
        {act?.href ? (
          <PressableScale accessibilityRole="button" accessibilityLabel={t('focusContinue', { what: act.label })} onPress={() => router.push(act.href!)} style={styles.start}>
            <Ionicons name={act.icon} size={18} color={colors.onPrimary} />
            <Text maxFontSizeMultiplier={1.6} style={styles.startText}>{t('focusContinue', { what: act.label })}</Text>
          </PressableScale>
        ) : (
          <Text maxFontSizeMultiplier={1.8} style={styles.breathe}>{t('focusStayText')}</Text>
        )}
        <View style={{ height: space.md }} />
        <EmergencyExit minutesLeft={ml} onConfirmed={() => {
          emergencyExitFocus();
          announce(t('focusAnnounceExited'));
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }} />
      </View>
    </View>
  );
}

function Finished() {
  const { t } = useI18n();
  const { f, now } = useFocusClock();
  const reduced = useReducedMotion();
  const [pop] = useState(() => new Animated.Value(reduced ? 1 : 0));
  const rec = f.finished!;
  const streak = focusStreak(f.history, dayKey(now));
  useEffect(() => {
    haptic('success');
    announce(`${t('focusDoneTitle')}. ${t('focusDoneText', { n: Math.round(rec.focusedMs / 60_000) })}`);
    if (!reduced) Animated.timing(pop, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.6)), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [rec.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  return (
    <View style={[styles.run, { justifyContent: 'center' }]}>
      <View style={[styles.center, { flex: 0, gap: space.lg }]}>
        <Animated.View style={{ opacity: pop, transform: [{ scale }] }}>
          <TickRing size={180} progress={1} label={t('focusDoneTitle')} valueText="100 %" breathe={false}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={44} color={colors.onPrimary} />
            </View>
          </TickRing>
        </Animated.View>
        <Text accessibilityRole="header" maxFontSizeMultiplier={1.6} style={[styles.h1, { textAlign: 'center' }]}>{t('focusDoneTitle')}</Text>
        <Text maxFontSizeMultiplier={1.8} style={[styles.lead, { textAlign: 'center' }]}>{t('focusDoneText', { n: Math.round(rec.focusedMs / 60_000) })}</Text>
        <View style={styles.doneStats}>
          <Stat icon="flame-outline" text={t('focusDoneStreak', { n: streak })} />
          <Stat icon="pause-circle-outline" text={rec.interruptions === 0 ? t('focusDoneNoInterruption') : t('focusDoneInterruptions', { n: rec.interruptions })} />
        </View>
      </View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t('focusFinish')}
        onPress={() => {
          dismissFocusFinished();
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
        style={[styles.start, { marginTop: space.xl, width: '100%', maxWidth: 480, alignSelf: 'center' }]}
      >
        <Text maxFontSizeMultiplier={1.6} style={styles.startText}>{t('focusFinish')}</Text>
      </PressableScale>
    </View>
  );
}

function Stat({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={FOCUS_RING} />
      <Text maxFontSizeMultiplier={1.6} style={styles.statText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  setup: { padding: space.xl, paddingBottom: 48 },
  maxW: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: space.md },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  badgeIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: FOCUS_RING, alignItems: 'center', justifyContent: 'center', marginTop: space.md },
  h1: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  lead: { fontSize: 16, lineHeight: 24, color: colors.muted },
  stats: { fontSize: 14, color: colors.text, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: space.md },
  durations: { flexDirection: 'row', gap: space.sm },
  dur: { flex: 1, minHeight: 72, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  durNum: { fontSize: 24, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  durUnit: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  act: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  actText: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600' },
  start: { minHeight: 54, borderRadius: 999, backgroundColor: FOCUS_RING, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.xl, marginTop: space.md },
  startText: { color: colors.onPrimary, fontSize: 17, fontWeight: '700' },
  info: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, gap: 6, borderWidth: 1, borderColor: colors.border },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  infoText: { fontSize: 14, lineHeight: 21, color: colors.muted },
  lockBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start' },
  lockText: { color: colors.text, fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' },
  run: { flex: 1, padding: space.xl, gap: space.md },
  runTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  eyebrow: { fontSize: 13, fontWeight: '700', color: colors.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  away: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, maxWidth: 560, alignSelf: 'center', width: '100%' },
  awayText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.text },
  awayBtn: { minHeight: 44, paddingHorizontal: space.md, justifyContent: 'center' },
  awayBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  clock: { color: colors.text, fontWeight: '300', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  clockSub: { color: colors.muted, fontSize: 14, fontWeight: '600', marginTop: 2 },
  breathe: { textAlign: 'center', color: colors.muted, fontSize: 15, lineHeight: 22 },
  check: { width: 84, height: 84, borderRadius: 42, backgroundColor: FOCUS_RING, alignItems: 'center', justifyContent: 'center' },
  doneStats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, minHeight: 36, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  statText: { fontSize: 14, color: colors.text, fontWeight: '600' },
});
