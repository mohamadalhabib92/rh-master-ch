import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { BackBar } from '../../components/BackBar';
import { Explain, PracticeItem } from '../../components/Practice';
import { Body, Button, EmptyState, H1, Muted, ProgressBar, Screen } from '../../components/ui';
import { findDrill } from '../../curriculum/catalog';
import { knownSourceLabel } from '../../lib/exam-session';
import { saveAnswer, saveDrill } from '../../lib/learn-actions';
import { useI18n } from '../../lib/i18n';

export default function DrillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const drill = findDrill(String(id));
  const [index, setIndex] = useState(0);
  const [ok, setOk] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  if (!drill) {
    return (
      <Screen>
        <BackBar label={t('back')} />
        <EmptyState title={t('notFound')} text={t('notFoundText')} />
      </Screen>
    );
  }
  const item = drill.items[index];
  const source = knownSourceLabel(drill.source?.name);
  const finished = index >= drill.items.length;
  return (
    <Screen>
      <BackBar label={t('tabLearn')} />
      <H1>{drill.title}</H1>
      <Muted>{drill.de.title}</Muted>
      <ProgressBar value={index / drill.items.length} />
      <Muted>
        {t('reference')} : {source.known ? source.text : t('sourceCheck')}
      </Muted>
      {finished ? (
        <>
          <Body>
            {score} / {drill.items.length}
          </Body>
          <Button
            label={t('finish')}
            onPress={() => {
              saveDrill(drill.id, score / drill.items.length);
            }}
          />
        </>
      ) : (
        <>
          <PracticeItem
            key={item.id}
            item={item}
            checked={ok !== null}
            onAnswer={(_value, correct) => {
              if (ok !== null) return;
              setOk(correct);
              if (correct) setScore((value) => value + 1);
              saveAnswer(`${drill.id}-${item.id}`, drill.competenceId, correct);
            }}
          />
          {ok !== null ? <Explain text={item.explain} ok={ok} /> : null}
          {ok !== null ? (
            <Button
              label={t('nextQuestion')}
              onPress={() => {
                setIndex((value) => value + 1);
                setOk(null);
              }}
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}
