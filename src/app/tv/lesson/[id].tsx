import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { TvBack, TvBody, TvButton, TvMuted, TvRow, TvScroll, TvTitle } from '../../../components/tv/ui';
import { findCompetence, findLesson } from '../../../curriculum/catalog';
import { figureById, formatFigure } from '../../../curriculum/figures';
import { catalog } from '../../../curriculum/catalog';
import { completeLesson, setResume } from '../../../lib/learn-actions';
import { useTheme } from '../../../theme-context';

export default function TvLesson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = findLesson(String(id));
  const [step, setStep] = useState(0);
  const theme = useTheme();
  if (!lesson) {
    return (
      <TvScroll>
        <TvTitle>Leçon introuvable</TvTitle>
        <TvBack preferred />
      </TvScroll>
    );
  }
  const competence = findCompetence(lesson.competenceId);
  const screen = lesson.screens[step];
  const done = step >= lesson.screens.length;
  const figure = screen?.figureId ? figureById(catalog.figures, screen.figureId) : undefined;
  const siblings = catalog.lessons.filter((item) => item.competenceId === lesson.competenceId);
  const nextLesson = siblings[siblings.findIndex((item) => item.id === lesson.id) + 1];
  return (
    <TvScroll>
      <TvMuted>
        {lesson.minutes} min · {competence?.title} · {step + (done ? 0 : 1)} / {lesson.screens.length}
      </TvMuted>
      <View style={{ height: 10, borderRadius: 6, backgroundColor: theme.palette.surfaceAlt, overflow: 'hidden' }}>
        <View style={{ width: `${Math.min(100, (step / lesson.screens.length) * 100)}%`, height: 10, backgroundColor: theme.palette.primary }} />
      </View>
      {done ? (
        <>
          <TvTitle>Leçon terminée</TvTitle>
          <TvBody>{lesson.concept}</TvBody>
          {lesson.checklist.map((item) => (
            <TvMuted key={item}>· {item}</TvMuted>
          ))}
          <TvRow>
            <View style={{ width: '47%' }}>
              <TvButton
                preferred
                label="Enregistrer"
                hint="La progression reste sur cet appareil"
                onPress={() => {
                  completeLesson(lesson.id);
                  if (nextLesson) router.replace(`/tv/lesson/${nextLesson.id}`);
                  else router.replace('/tv/parcours');
                }}
              />
            </View>
            <View style={{ width: '47%' }}>
              <TvBack />
            </View>
          </TvRow>
        </>
      ) : (
        <>
          <TvMuted>{screen.concept}</TvMuted>
          <TvTitle>{screen.title}</TvTitle>
          <TvBody>{screen.body}</TvBody>
          {figure ? (
            <TvMuted>
              {formatFigure(figure)} · {figure.status === 'a_verifier' ? 'à vérifier' : String(figure.validYear)}
            </TvMuted>
          ) : null}
          <TvRow>
            {step > 0 ? (
              <View style={{ width: '30%' }}>
                <TvButton label="Précédent" onPress={() => setStep((value) => value - 1)} />
              </View>
            ) : (
              <View style={{ width: '30%' }}>
                <TvBack />
              </View>
            )}
            <View style={{ width: '64%' }}>
              <TvButton
                preferred
                label="Suite"
                hint="Une seule idée sur cet écran"
                onPress={() => {
                  const next = step + 1;
                  setStep(next);
                  setResume({ kind: 'lesson', id: lesson.id, step: next, at: new Date().toISOString() });
                }}
              />
            </View>
          </TvRow>
        </>
      )}
    </TvScroll>
  );
}
