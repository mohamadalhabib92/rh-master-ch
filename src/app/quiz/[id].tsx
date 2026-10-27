import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { Badge, Body, Button, Card, EmptyState, H1, H2, Muted, ProgressBar, Row, Screen } from '../../components/ui';
import { LAWS } from '../../data/laws';
import { findModule } from '../../data/modules';
import type { Question } from '../../data/types';
import { useI18n } from '../../lib/i18n';
import { appStore, finishQuiz, recordAnswer } from '../../lib/store';
import { colors, radius } from '../../theme';
import { BackBar } from '../../components/BackBar';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const { t, lang } = useI18n();
  const m = findModule(id);
  const mistakesMode = mode === 'mistakes';
  const [round, setRound] = useState(0);
  const deck = useMemo(() => {
    if (!m) return [] as { q: Question; order: number[] }[];
    const mistakes = appStore.get().mistakes;
    const pool = mistakesMode ? m.questions.filter((q) => mistakes.includes(q.id)) : m.questions;
    return shuffle(pool).map((q) => ({ q, order: shuffle(q.fr.o.map((_, i) => i)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m?.id, mistakesMode, round]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!m) {
    return (
      <Screen>
        <BackBar label={t('back')} />
        <EmptyState title={t('notFound')} text={t('notFoundText')} />
      </Screen>
    );
  }
  if (deck.length === 0) {
    return (
      <Screen>
        <BackBar label={t('backToModule')} />
        <EmptyState icon={<Ionicons name="happy-outline" size={40} color={colors.ok} />} title={t('noMistakes')} />
      </Screen>
    );
  }
  const restart = () => {
    setRound((r) => r + 1);
    setIdx(0);
    setSel(null);
    setChecked(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / deck.length) * 100);
    return (
      <Screen>
        <BackBar label={t('backToModule')} />
        <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Ionicons name={pct >= 80 ? 'trophy' : pct >= 50 ? 'ribbon-outline' : 'school-outline'} size={48} color={pct >= 80 ? '#C9A227' : colors.primary} />
          <H1>{pct} %</H1>
          <Body>{t('score', { n: score, t: deck.length })}</Body>
          <Row style={{ marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button label={t('retry')} onPress={restart} />
            <Button variant="ghost" label={t('backToModule')} onPress={() => router.replace(`/module/${m.id}`)} />
          </Row>
        </Card>
        <DisclaimerBanner />
      </Screen>
    );
  }

  const { q, order } = deck[idx];
  const local = q[lang];
  const text = local ?? q.fr;
  const fallback = lang !== 'fr' && !local;
  const isOk = sel === q.a;
  const check = () => {
    if (sel === null) return;
    setChecked(true);
    if (isOk) setScore((x) => x + 1);
    recordAnswer(m.id, q.id, isOk);
  };
  const next = () => {
    if (idx + 1 >= deck.length) {
      const finalPct = Math.round((score / deck.length) * 100);
      finishQuiz(m.id, finalPct, !mistakesMode);
      setDone(true);
      return;
    }
    setIdx(idx + 1);
    setSel(null);
    setChecked(false);
  };
  return (
    <Screen>
      <BackBar label={t('backToModule')} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Muted>{t('questionOf', { n: idx + 1, t: deck.length })}</Muted>
        {lang !== 'fr' ? <Badge label={fallback ? 'FR' : t('provisional')} tone="warn" /> : null}
      </Row>
      <ProgressBar value={(idx + (checked ? 1 : 0)) / deck.length} />
      {fallback ? <Muted>{t('frOnly')}</Muted> : null}
      <H2>{text.q}</H2>
      <View style={{ gap: 10 }}>
        {order.map((oi) => {
          const chosen = sel === oi;
          const right = checked && oi === q.a;
          const wrong = checked && chosen && oi !== q.a;
          return (
            <Pressable
              key={oi}
              accessibilityRole="radio"
              accessibilityState={{ checked: chosen, disabled: checked }}
              disabled={checked}
              onPress={() => setSel(oi)}
              style={[styles.opt, chosen && styles.optSel, right && styles.optOk, wrong && styles.optBad]}
            >
              <Ionicons
                name={right ? 'checkmark-circle' : wrong ? 'close-circle' : chosen ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={right ? colors.ok : wrong ? colors.danger : chosen ? colors.primary : colors.muted}
              />
              <Text style={styles.optText}>{text.o[oi]}</Text>
            </Pressable>
          );
        })}
      </View>
      {checked ? (
        <Card style={{ borderColor: isOk ? colors.ok : colors.danger, borderWidth: 1 }}>
          <Row>
            <Badge label={isOk ? t('correct') : t('incorrect')} tone={isOk ? 'ok' : 'warn'} />
          </Row>
          <Body style={{ fontWeight: '700' }}>{t('explanation')}</Body>
          <Body>{text.e}</Body>
          <Muted>
            {t('reference')} : {q.law} — {LAWS[q.law]?.[lang] ?? LAWS[q.law]?.fr ?? ''}
          </Muted>
        </Card>
      ) : null}
      {checked ? (
        <Button label={idx + 1 >= deck.length ? t('finish') : t('nextQuestion')} onPress={next} />
      ) : (
        <Button label={t('check')} onPress={check} disabled={sel === null} />
      )}
      <DisclaimerBanner />
    </Screen>
  );
}

const styles = StyleSheet.create({
  opt: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  optSel: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optOk: { borderColor: colors.ok, backgroundColor: '#E3F6EA' },
  optBad: { borderColor: colors.danger, backgroundColor: '#FDECEA' },
  optText: { flex: 1, fontSize: 15, lineHeight: 21, color: colors.text },
});
