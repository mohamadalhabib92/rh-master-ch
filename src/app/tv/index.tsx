import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { TvBody, TvButton, TvMuted, TvRow, TvScroll, TvTitle } from '../../components/tv/ui';
import { catalog } from '../../curriculum/catalog';
import { MODULES } from '../../data/modules';
import { appStore } from '../../lib/store';

export default function TvHome() {
  const state = appStore.useStore();
  const lessonId = (state.learn.resume as { kind?: string; id?: string } | null)?.kind === 'lesson' ? (state.learn.resume as { id: string }).id : catalog.lessons[0]?.id;
  const moduleId = state.lastModule && MODULES.some((item) => item.id === state.lastModule) ? state.lastModule : MODULES[0].id;
  return (
    <TvScroll>
      <TvMuted>RH Master CH · salon</TvMuted>
      <TvTitle>Réviser sur grand écran</TvTitle>
      <TvBody>Une idée à la fois. La télécommande choisit, le centre valide. La progression reste sur cet appareil, même clé que l’iPhone.</TvBody>
      <TvMuted>Touches haut et bas, puis le centre. Rien ne se perd si tu t’arrêtes.</TvMuted>
      <TvRow>
        <View style={{ width: '47%' }}>
          <TvButton preferred label="Continuer" hint="Là où tu t’es arrêté" onPress={() => router.push(lessonId ? `/tv/lesson/${lessonId}` : '/tv/parcours')} />
        </View>
        <View style={{ width: '47%' }}>
          <TvButton label="Parcours" hint="Les compétences du certificat et du brevet" onPress={() => router.push('/tv/parcours')} />
        </View>
        <View style={{ width: '47%' }}>
          <TvButton label="Quiz" hint="Questions du module, une par une" onPress={() => router.push(`/tv/quiz/${moduleId}`)} />
        </View>
        <View style={{ width: '47%' }}>
          <TvButton label="Progression" hint="Ce qui est déjà réussi" onPress={() => router.push('/tv/progress')} />
        </View>
      </TvRow>
    </TvScroll>
  );
}
