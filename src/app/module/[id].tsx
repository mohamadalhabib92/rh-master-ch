import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { BackBar } from '../../components/BackBar';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { Badge, Body, Button, Card, EmptyState, H1, H2, Muted, Row, Screen } from '../../components/ui';
import { LAWS } from '../../data/laws';
import { findModule } from '../../data/modules';
import { pick } from '../../data/types';
import { useI18n } from '../../lib/i18n';
import { appStore } from '../../lib/store';
import { colors } from '../../theme';

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useI18n();
  const s = appStore.useStore();
  const m = findModule(id);
  if (!m) {
    return (
      <Screen>
        <BackBar label={t('back')} />
        <EmptyState title={t('notFound')} text={t('notFoundText')} />
      </Screen>
    );
  }
  const title = pick(m.title, lang);
  const pts = pick(m.points, lang);
  const p = s.progress[m.id];
  const mistakes = m.questions.filter((q) => s.mistakes.includes(q.id)).length;
  const read = !!s.ficheRead[m.id];
  return (
    <Screen>
      <BackBar label={t('tabModules')} />
      <Muted>{t('module', { n: m.n })}</Muted>
      <H1>{title.value}</H1>
      <DisclaimerBanner />
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>{t('keyPoints')}</H2>
          {lang !== 'fr' ? <Badge label={pts.fallback ? 'FR' : t('provisional')} tone="warn" /> : null}
        </Row>
        {pts.value.map((pt, i) => (
          <Row key={i} gap={10} style={{ alignItems: 'flex-start' }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginTop: 2 }} />
            <Body style={{ flex: 1 }}>{pt}</Body>
          </Row>
        ))}
        <Button
          small
          variant={read ? 'ghost' : 'secondary'}
          label={read ? t('ficheRead') : t('markRead')}
          icon={<Ionicons name={read ? 'checkmark-done' : 'bookmark-outline'} size={16} color={colors.primary} />}
          onPress={() => appStore.set((st) => ({ ficheRead: { ...st.ficheRead, [m.id]: !read }, lastModule: m.id }))}
          style={{ alignSelf: 'flex-start' }}
        />
      </Card>
      <Card>
        <H2>{t('laws')}</H2>
        {m.laws.map((code) => (
          <View key={code} style={{ gap: 2 }}>
            <Body style={{ fontWeight: '700' }}>{code}</Body>
            <Muted>{LAWS[code]?.[lang] ?? LAWS[code]?.fr ?? code}</Muted>
          </View>
        ))}
        <Muted>fedlex.admin.ch</Muted>
      </Card>
      <Card>
        <H2>{t('quiz')}</H2>
        {p ? <Muted>{t('bestScore', { n: p.best })} · {t('questionsDone', { n: p.correct.length, t: m.questions.length })}</Muted> : null}
        <Button label={t('startQuiz', { n: m.questions.length })} onPress={() => router.push(`/quiz/${m.id}`)} icon={<Ionicons name="play" size={16} color="#fff" />} />
        {mistakes > 0 ? (
          <Button variant="secondary" label={t('reviewMistakes', { n: mistakes })} onPress={() => router.push(`/quiz/${m.id}?mode=mistakes`)} icon={<Ionicons name="refresh" size={16} color={colors.primary} />} />
        ) : p ? (
          <Muted>{t('noMistakes')}</Muted>
        ) : null}
      </Card>
    </Screen>
  );
}
