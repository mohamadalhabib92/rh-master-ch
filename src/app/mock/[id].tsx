import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackBar } from '../../components/BackBar';
import { Explain, PracticeItem } from '../../components/Practice';
import { Body, Button, Card, EmptyState, H1, Muted, ProgressBar, Screen } from '../../components/ui';
import { findCase, findExam } from '../../curriculum/catalog';
import { swissNote } from '../../curriculum/plan';
import { saveMock } from '../../lib/learn-actions';
import { useI18n } from '../../lib/i18n';

export default function MockScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const exam = findExam(String(id));
  const [index, setIndex] = useState(0);
  const [ok, setOk] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [left, setLeft] = useState(exam ? exam.minutes * 60 : 0);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!exam || closed) return;
    const timer = setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          setClosed(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [closed, exam]);
  if (!exam) {
    return (
      <Screen>
        <BackBar label={t('back')} />
        <EmptyState title={t('notFound')} text={t('notFoundText')} />
      </Screen>
    );
  }
  const item = exam.items[index];
  const finished = closed || index >= exam.items.length;
  const related = exam.caseId ? findCase(exam.caseId) : undefined;
  const note = swissNote(correct, exam.items.length);
  return (
    <Screen>
      <BackBar label={t('tabLearn')} />
      <Muted>{exam.de.title}</Muted>
      <H1>{exam.title}</H1>
      <Body>{exam.intro}</Body>
      <Muted>{t('mockLeft', { n: Math.ceil(left / 60) })}</Muted>
      <ProgressBar value={exam.items.length ? index / exam.items.length : 0} />
      {finished ? (
        <Card>
          <H1>{t('noteLabel', { n: note.toFixed(1) })}</H1>
          <Muted>{closed && index < exam.items.length ? t('mockTimeUp') : t('noteHint')}</Muted>
          <Body>
            {correct} / {exam.items.length}
          </Body>
          {related ? <Body>{related.title}</Body> : null}
          <Button label={t('finish')} onPress={() => saveMock(exam.id, note)} />
        </Card>
      ) : (
        <>
          <PracticeItem
            key={item.id}
            item={item}
            checked={ok !== null}
            onAnswer={(_value, good) => {
              if (ok !== null) return;
              setOk(good);
              if (good) setCorrect((value) => value + 1);
            }}
          />
          {ok !== null ? <Explain text={item.explain} ok={ok} /> : null}
          {ok !== null ? (
            <Button
              label={index + 1 >= exam.items.length ? t('mockSubmit') : t('nextQuestion')}
              onPress={() => {
                setIndex((value) => value + 1);
                setOk(null);
              }}
            />
          ) : (
            <Button variant="ghost" label={t('mockSubmit')} onPress={() => setClosed(true)} />
          )}
        </>
      )}
    </Screen>
  );
}
