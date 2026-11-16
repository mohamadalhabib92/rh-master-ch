import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { TvBack, TvButton, TvMuted, TvRow, TvScroll, TvTitle } from '../../components/tv/ui';
import { catalog } from '../../curriculum/catalog';
import { coverageOf } from '../../curriculum/coverage';
import { appStore } from '../../lib/store';

const LABEL = { solid: 'Étoffé', medium: 'En cours', thin: 'Encore mince' } as const;

export default function TvParcours() {
  const learn = appStore.useStore().learn;
  return (
    <TvScroll>
      <TvBack />
      <TvTitle>Parcours</TvTitle>
      <TvMuted>Français à l’écran. Le titre allemand est là pour la structure, pas comme traduction complète.</TvMuted>
      <TvRow>
        {catalog.competences.map((competence, index) => {
          const lesson = catalog.lessons.find((item) => item.competenceId === competence.id);
          const done = catalog.lessons.filter((item) => item.competenceId === competence.id && learn.lessons[item.id]).length;
          const total = catalog.lessons.filter((item) => item.competenceId === competence.id).length;
          return (
            <View key={competence.id} style={{ width: '47%' }}>
              <TvButton
                preferred={index === 0}
                label={competence.title}
                hint={`${LABEL[coverageOf(catalog, competence.id)]} · ${done}/${total} · ${competence.de.title}`}
                onPress={() => lesson && router.push(`/tv/lesson/${lesson.id}`)}
              />
            </View>
          );
        })}
      </TvRow>
    </TvScroll>
  );
}
