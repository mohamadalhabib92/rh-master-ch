import React, { useMemo, useState } from 'react';
import { BackBar } from '../components/BackBar';
import { Body, Button, Card, EmptyState, H1, Muted, Screen } from '../components/ui';
import { catalog } from '../curriculum/catalog';
import { figureById, formatFigure } from '../curriculum/figures';
import { gradeFlashcard, todayIso } from '../lib/learn-actions';
import { hapticSelect } from '../lib/haptics';
import { useI18n } from '../lib/i18n';
import { isDue, type SrsCard, type SrsGrade } from '../lib/srs';
import { appStore } from '../lib/store';

const GRADES: { grade: SrsGrade; key: 'gradeAgain' | 'gradeHard' | 'gradeGood' | 'gradeEasy' }[] = [
  { grade: 1, key: 'gradeAgain' },
  { grade: 3, key: 'gradeHard' },
  { grade: 4, key: 'gradeGood' },
  { grade: 5, key: 'gradeEasy' },
];

export default function CardsScreen() {
  const { t } = useI18n();
  const learn = appStore.useStore().learn;
  const today = todayIso();
  const due = useMemo(
    () =>
      catalog.cards.filter((card) => {
        const state = learn.srs[card.id] as SrsCard | undefined;
        return !state || isDue(state, today);
      }),
    [learn.srs, today],
  );
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const card = due[index];
  return (
    <Screen>
      <BackBar label={t('tabLearn')} />
      <H1>{t('openCards')}</H1>
      {!card ? (
        <EmptyState title={t('noDue')} text={t('emptyLearnText')} />
      ) : (
        <Card>
          <Muted>
            {index + 1} / {due.length}
          </Muted>
          <Body>{show ? card.back : card.front}</Body>
          {show && card.figureId ? <Muted>{formatFigure(figureById(catalog.figures, card.figureId) ?? catalog.figures[0])}</Muted> : null}
          <Muted>{card.de.front}</Muted>
          {note ? <Muted>{note}</Muted> : null}
          {show ? (
            GRADES.map((entry) => (
              <Button
                key={entry.key}
                variant={entry.grade >= 4 ? 'primary' : 'secondary'}
                label={t(entry.key)}
                onPress={() => {
                  hapticSelect();
                  const event = gradeFlashcard(card.id, entry.grade);
                  setNote(event === 'freeze' ? t('streakFreeze') : event === 'reset' ? t('streakReset') : t('xpGain', { n: entry.grade >= 3 ? 8 : 3 }));
                  setShow(false);
                  setIndex((value) => value + 1);
                }}
              />
            ))
          ) : (
            <Button label={t('check')} onPress={() => setShow(true)} />
          )}
        </Card>
      )}
    </Screen>
  );
}
