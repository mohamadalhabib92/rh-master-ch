import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Badge, Body, Button, Card, Cluster, ClusterItem, EmptyState, H1, H2, H3, IconTile, Muted, ProgressBar, Row, Screen } from '../../components/ui';
import { catalog } from '../../curriculum/catalog';
import { coverageOf } from '../../curriculum/coverage';
import { figureReview } from '../../curriculum/figures';
import { weakCompetenceIds, weaknessByCompetence } from '../../curriculum/plan';
import { todayIso } from '../../lib/learn-actions';
import { levelFor } from '../../lib/learn-state';
import { useI18n } from '../../lib/i18n';
import { isDue, type SrsCard } from '../../lib/srs';
import { appStore } from '../../lib/store';
import { useTheme } from '../../theme-context';

const coverageKey = { solid: 'coverageSolid', medium: 'coverageMedium', thin: 'coverageThin' } as const;

export default function Learn() {
  const { t } = useI18n();
  const theme = useTheme();
  const learn = appStore.useStore().learn;
  const today = todayIso();
  const due = catalog.cards.filter((card) => {
    const state = learn.srs[card.id] as SrsCard | undefined;
    return !state || isDue(state, today);
  });
  const doneLessons = catalog.lessons.filter((lesson) => learn.lessons[lesson.id]).length;
  const review = useMemo(() => figureReview(catalog.figures, new Date()), []);
  const answers = Object.values(learn.answers) as { competenceId: string; ok: boolean }[];
  const weak = weakCompetenceIds(weaknessByCompetence(answers));
  const resume = learn.resume as { kind?: string; id?: string } | null;
  return (
    <Screen>
      <H1>{t('learnTitle')}</H1>
      <Body>{t('learnLead')}</Body>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>{t('levelLabel', { n: levelFor(learn.xp) })}</H2>
          <Badge label={`${learn.xp} XP`} tone="info" />
        </Row>
        <ProgressBar value={(learn.xp % 120) / 120} label={t('levelLabel', { n: levelFor(learn.xp) })} />
        <Muted>
          {t('streakLabel')} · {learn.streak.count} · gels {learn.streak.freezes}
        </Muted>
        <Muted>
          {doneLessons} / {catalog.lessons.length}
        </Muted>
      </Card>
      {resume?.id && resume.kind === 'lesson' ? (
        <Button label={t('resume')} onPress={() => router.push(`/lesson/${resume.id}`)} />
      ) : null}
      <Cluster>
        <ClusterItem>
          <Card onPress={() => router.push('/cards')} accessibilityLabel={t('openCards')}>
            <Row>
              <IconTile>
                <Ionicons name="albums-outline" size={22} color={theme.palette.primaryText} />
              </IconTile>
              <View style={{ flex: 1, gap: 2 }}>
                <H3>{t('openCards')}</H3>
                <Muted>{due.length ? t('dueCards', { n: due.length }) : t('noDue')}</Muted>
              </View>
            </Row>
          </Card>
        </ClusterItem>
        <ClusterItem>
          <Card onPress={() => router.push('/focus')} accessibilityLabel={t('openFocus')}>
            <Row>
              <IconTile>
                <Ionicons name="timer-outline" size={22} color={theme.palette.primaryText} />
              </IconTile>
              <View style={{ flex: 1, gap: 2 }}>
                <H3>{t('openFocus')}</H3>
                <Muted>{t('minutesShort', { n: learn.settings.focusMinutes })}</Muted>
              </View>
            </Row>
          </Card>
        </ClusterItem>
        <ClusterItem>
          <Card onPress={() => router.push('/plan')} accessibilityLabel={t('openPlan')}>
            <Row>
              <IconTile>
                <Ionicons name="calendar-outline" size={22} color={theme.palette.primaryText} />
              </IconTile>
              <View style={{ flex: 1, gap: 2 }}>
                <H3>{t('openPlan')}</H3>
                <Muted>{learn.plan ? String((learn.plan as { examDate?: string }).examDate ?? '') : t('planBuild')}</Muted>
              </View>
            </Row>
          </Card>
        </ClusterItem>
      </Cluster>
      <H2>{t('weakTitle')}</H2>
      {weak.length === 0 ? (
        <EmptyState icon={<Ionicons name="leaf-outline" size={28} color={theme.palette.accent} />} title={t('emptyLearnTitle')} text={t('weakEmpty')} />
      ) : (
        weak.map((id) => <Card key={id}><Body>{catalog.competences.find((item) => item.id === id)?.title ?? id}</Body></Card>)
      )}
      <Card>
        <H3>{t('figureDue')}</H3>
        <Muted>
          {t('figureUnverified')} · {review.unverified.length}
          {review.expired.length ? ` · ${review.expired.length}` : ''}
        </Muted>
      </Card>
      {catalog.competences.map((competence) => {
        const coverage = coverageOf(catalog, competence.id);
        const lesson = catalog.lessons.find((item) => item.competenceId === competence.id);
        return (
          <Card key={competence.id} onPress={() => lesson && router.push(`/lesson/${lesson.id}`)} accessibilityLabel={competence.title}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <H3 style={{ flex: 1 }}>{competence.title}</H3>
              <Badge label={t(coverageKey[coverage])} tone={coverage === 'thin' ? 'warn' : coverage === 'solid' ? 'ok' : 'info'} />
            </Row>
            <Muted>{competence.summary}</Muted>
            <Muted>{competence.de.title}</Muted>
          </Card>
        );
      })}
      <H2>{t('startMock')}</H2>
      {catalog.exams.map((exam) => (
        <Button key={exam.id} variant="secondary" label={exam.title} onPress={() => router.push(`/mock/${exam.id}`)} />
      ))}
      {catalog.cases.map((item) => (
        <Button key={item.id} variant="ghost" label={item.title} onPress={() => router.push(`/case/${item.id}`)} />
      ))}
    </Screen>
  );
}
