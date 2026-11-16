import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { TvBack, TvButton, TvRow, TvScroll, TvTitle } from '../../../components/tv/ui';
import { MODULES } from '../../../data/modules';
import { pick } from '../../../data/types';

export default function TvQuizList() {
  return (
    <TvScroll>
      <TvBack />
      <TvTitle>Quiz</TvTitle>
      <TvRow>
        {MODULES.map((module, index) => (
          <View key={module.id} style={{ width: '47%' }}>
            <TvButton
              preferred={index === 0}
              label={pick(module.title, 'fr').value}
              hint={`${module.questions.length} questions`}
              onPress={() => router.push(`/tv/quiz/${module.id}`)}
            />
          </View>
        ))}
      </TvRow>
    </TvScroll>
  );
}
