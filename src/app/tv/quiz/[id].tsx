import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { TvBack, TvBody, TvButton, TvMuted, TvRow, TvScroll, TvTitle } from '../../../components/tv/ui';
import { findModule } from '../../../data/modules';
import { pick } from '../../../data/types';
import { finishQuiz, recordAnswer } from '../../../lib/store';
import { useTheme } from '../../../theme-context';

export default function TvQuiz() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const module = findModule(String(id));
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  if (!module) {
    return (
      <TvScroll>
        <TvTitle>Quiz introuvable</TvTitle>
        <TvBack preferred />
      </TvScroll>
    );
  }
  const question = module.questions[index];
  const finished = index >= module.questions.length;
  const title = pick(module.title, 'fr').value;
  if (finished) {
    const pct = Math.round((score / module.questions.length) * 100);
    return (
      <TvScroll>
        <TvMuted>{title}</TvMuted>
        <TvTitle>{pct} %</TvTitle>
        <TvBody>
          {score} / {module.questions.length}. Ce n’est pas une note d’examen. Tu peux recommencer quand tu veux.
        </TvBody>
        <TvRow>
          <View style={{ width: '47%' }}>
            <TvButton
              preferred
              label="Encore une fois"
              onPress={() => {
                setIndex(0);
                setPicked(null);
                setScore(0);
              }}
            />
          </View>
          <View style={{ width: '47%' }}>
            <TvBack />
          </View>
        </TvRow>
      </TvScroll>
    );
  }
  const text = question.fr;
  const ok = picked === question.a;
  return (
    <TvScroll>
      <TvMuted>
        {title} · {index + 1} / {module.questions.length}
      </TvMuted>
      <View style={{ height: 10, borderRadius: 6, backgroundColor: theme.palette.surfaceAlt, overflow: 'hidden' }}>
        <View style={{ width: `${(index / module.questions.length) * 100}%`, height: 10, backgroundColor: theme.palette.primary }} />
      </View>
      <TvTitle>{text.q}</TvTitle>
      <TvRow>
        {text.o.map((option, optionIndex) => {
          return (
            <View key={option} style={{ width: '47%' }}>
              <TvButton
                preferred={index === 0 && optionIndex === 0 && picked === null}
                label={option}
                hint={picked === null ? undefined : optionIndex === question.a ? 'Bonne réponse' : optionIndex === picked ? 'Pas celle-ci' : undefined}
                onPress={() => {
                  if (picked !== null) return;
                  setPicked(optionIndex);
                  const correct = optionIndex === question.a;
                  if (correct) setScore((value) => value + 1);
                  recordAnswer(module.id, question.id, correct);
                }}
              />
            </View>
          );
        })}
      </TvRow>
      {picked !== null ? (
        <>
          <TvBody>{ok ? 'Bien vu.' : 'Pas cette fois. L’explication reste là.'}</TvBody>
          <TvMuted>{text.e}</TvMuted>
          <TvRow>
            <View style={{ width: '64%' }}>
              <TvButton
                preferred
                label={index + 1 >= module.questions.length ? 'Voir le score' : 'Question suivante'}
                onPress={() => {
                  const next = index + 1;
                  if (next >= module.questions.length) {
                    finishQuiz(module.id, Math.round((score / module.questions.length) * 100), true);
                  }
                  setIndex(next);
                  setPicked(null);
                }}
              />
            </View>
          </TvRow>
        </>
      ) : null}
    </TvScroll>
  );
}
