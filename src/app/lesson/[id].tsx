import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { BackBar } from '../../components/BackBar';
import { Badge, Body, Button, Card, EmptyState, H1, H2, Muted, ProgressBar, Row, Screen } from '../../components/ui';
import { catalog, findCompetence, findDrill, findLesson } from '../../curriculum/catalog';
import { figureById, formatFigure } from '../../curriculum/figures';
import { completeLesson, setResume } from '../../lib/learn-actions';
import { hapticSuccess } from '../../lib/haptics';
import { useI18n } from '../../lib/i18n';
import { speakText, stopSpeech } from '../../lib/speech';
import { appStore } from '../../lib/store';
import { useTheme } from '../../theme-context';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const theme = useTheme();
  const lesson = findLesson(String(id));
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  if (!lesson) {
    return (
      <Screen>
        <BackBar label={t('tabLearn')} />
        <EmptyState title={t('notFound')} text={t('notFoundText')} />
      </Screen>
    );
  }
  const competence = findCompetence(lesson.competenceId);
  const screen = lesson.screens[step];
  const figure = screen?.figureId ? figureById(catalog.figures, screen.figureId) : undefined;
  const drill = findDrill(catalog.drills.find((item) => item.competenceId === lesson.competenceId)?.id ?? '');
  const last = step >= lesson.screens.length;
  const done = !!appStore.get().learn.lessons[lesson.id];
  return (
    <Screen>
      <BackBar label={t('tabLearn')} />
      <Muted>
        {lesson.minutes} min · {competence?.de.title}
      </Muted>
      <H1>{lesson.de.title ? competence?.title : lesson.concept}</H1>
      <ProgressBar value={Math.min(1, step / lesson.screens.length)} label={lesson.concept} />
      {last ? (
        <Card>
          <H2>{t('lessonDone')}</H2>
          <Body>{lesson.concept}</Body>
          {lesson.checklist.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !!checks[item] }}
              accessibilityLabel={item}
              onPress={() => setChecks((prev) => ({ ...prev, [item]: !prev[item] }))}
            >
              <Row>
                <Ionicons name={checks[item] ? 'checkbox' : 'square-outline'} size={22} color={theme.palette.primaryText} />
                <Body style={{ flex: 1 }}>{item}</Body>
              </Row>
            </Pressable>
          ))}
          <Muted>
            {t('sourcesItem')} · {lesson.source.name} · {t('verifiedOn', { d: lesson.source.consultedAt })}
          </Muted>
          <Button
            label={done ? t('ficheRead') : t('lessonDone')}
            onPress={() => {
              completeLesson(lesson.id);
              hapticSuccess();
              if (drill) router.push(`/drill/${drill.id}`);
              else router.back();
            }}
          />
        </Card>
      ) : (
        <Card>
          <Badge label={screen.concept} tone="info" />
          <H2>{screen.title}</H2>
          <Body>{screen.body}</Body>
          {figure ? (
            <Muted>
              {formatFigure(figure)} · {figure.status === 'a_verifier' ? t('figureUnverified') : figure.validYear}
            </Muted>
          ) : null}
          <Row>
            <Button
              variant="secondary"
              label={t('speak')}
              onPress={() => speakText(`${screen.title}. ${screen.body}`)}
              icon={<Ionicons name="volume-medium-outline" size={18} color={theme.palette.primaryText} />}
            />
            <Button variant="ghost" label={t('speakStop')} onPress={() => stopSpeech()} />
          </Row>
          <Button
            label={t('nextScreen')}
            onPress={() => {
              const next = step + 1;
              setStep(next);
              setResume({ kind: 'lesson', id: lesson.id, step: next, at: new Date().toISOString() });
            }}
          />
        </Card>
      )}
    </Screen>
  );
}
