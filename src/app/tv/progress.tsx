import React from 'react';
import { View } from 'react-native';
import { TvBack, TvBody, TvMuted, TvScroll, TvTitle } from '../../components/tv/ui';
import { catalog } from '../../curriculum/catalog';
import { MODULES } from '../../data/modules';
import { pick } from '../../data/types';
import { levelFor } from '../../lib/learn-state';
import { appStore } from '../../lib/store';
import { useTheme } from '../../theme-context';

export default function TvProgress() {
  const state = appStore.useStore();
  const theme = useTheme();
  const total = MODULES.reduce((sum, module) => sum + module.questions.length, 0);
  const done = MODULES.reduce((sum, module) => sum + (state.progress[module.id]?.correct.length ?? 0), 0);
  const lessons = catalog.lessons.filter((lesson) => state.learn.lessons[lesson.id]).length;
  return (
    <TvScroll>
      <TvBack preferred />
      <TvTitle>Progression</TvTitle>
      <TvBody>
        Niveau {levelFor(state.learn.xp)} · {state.learn.xp} XP · série {state.learn.streak.count}, {state.learn.streak.freezes} gels
      </TvBody>
      <TvMuted>
        {done} / {total} questions réussies · {lessons} / {catalog.lessons.length} leçons
      </TvMuted>
      <View style={{ height: 16, borderRadius: 8, backgroundColor: theme.palette.surfaceAlt, overflow: 'hidden' }}>
        <View style={{ width: `${total ? (done / total) * 100 : 0}%`, height: 16, backgroundColor: theme.palette.primary }} />
      </View>
      {MODULES.map((module) => {
        const correct = state.progress[module.id]?.correct.length ?? 0;
        return (
          <TvMuted key={module.id}>
            {pick(module.title, 'fr').value} · {correct} / {module.questions.length}
          </TvMuted>
        );
      })}
    </TvScroll>
  );
}
