import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { BackBar } from '../components/BackBar';
import { Body, Button, Card, H1, H3, Muted, Screen } from '../components/ui';
import { catalog } from '../curriculum/catalog';
import { buildStudyPlan, weakCompetenceIds, weaknessByCompetence } from '../curriculum/plan';
import { savePlan } from '../lib/learn-actions';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';
import { useTheme } from '../theme-context';

export default function PlanScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const learn = appStore.useStore().learn;
  const [date, setDate] = useState('2027-03-08');
  const [minutes, setMinutes] = useState(90);
  const [track, setTrack] = useState('certificat');
  const [built, setBuilt] = useState<ReturnType<typeof buildStudyPlan> | null>(null);
  const answers = Object.values(learn.answers) as { competenceId: string; ok: boolean }[];
  const weak = Object.fromEntries(weaknessByCompetence(answers).map((row) => [row.competenceId, 1 - row.rate]));
  return (
    <Screen>
      <BackBar label={t('tabLearn')} />
      <H1>{t('planTitle')}</H1>
      <Muted>{t('planDate')}</Muted>
      <TextInput
        accessibilityLabel={t('planDate')}
        value={date}
        onChangeText={setDate}
        autoCapitalize="none"
        style={{
          minHeight: 48,
          borderWidth: 1,
          borderTopWidth: 2,
          borderColor: theme.glass.translucent ? theme.glass.border : theme.palette.border,
          borderTopColor: theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(26,29,35,0.16)',
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          color: theme.palette.text,
          backgroundColor: theme.glass.translucent ? theme.glass.surface : theme.palette.surface,
          fontSize: 16,
        }}
      />
      <Muted>{t('planMinutes')}</Muted>
      {[60, 90, 120].map((value) => (
        <Button key={value} variant={minutes === value ? 'primary' : 'secondary'} label={t('minutesShort', { n: value })} onPress={() => setMinutes(value)} />
      ))}
      {['certificat', 'brevet-a', 'brevet-b', 'brevet-c'].map((value) => (
        <Button key={value} variant={track === value ? 'primary' : 'ghost'} label={value} onPress={() => setTrack(value)} />
      ))}
      <Button
        label={t('planBuild')}
        onPress={() => {
          const today = new Date().toISOString().slice(0, 10);
          const lessons = catalog.lessons
            .filter((lesson) => catalog.competences.find((item) => item.id === lesson.competenceId)?.tracks.includes(track))
            .map((lesson) => ({ id: lesson.id, competenceId: lesson.competenceId, minutes: lesson.minutes, done: !!learn.lessons[lesson.id] }));
          const plan = buildStudyPlan({ examDate: date, today, weeklyMinutes: minutes, lessons, weakness: weak });
          setBuilt(plan);
          savePlan({ trackId: track, examDate: date, weeklyMinutes: minutes });
        }}
      />
      {weakCompetenceIds(weaknessByCompetence(answers)).length ? <Muted>{t('weakTitle')}</Muted> : null}
      {built?.overflow.length ? <Body>{t('planOverflow')}</Body> : null}
      {built?.weeks.map((week) => (
        <Card key={week.start}>
          <H3>
            {week.start} · {week.minutes} min
          </H3>
          {week.items.map((item) => (
            <Muted key={item.id}>
              {catalog.lessons.find((lesson) => lesson.id === item.id)?.concept ?? item.id} · {item.minutes} min
            </Muted>
          ))}
        </Card>
      ))}
    </Screen>
  );
}
