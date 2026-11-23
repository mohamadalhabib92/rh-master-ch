import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackBar } from '../../components/BackBar';
import { Explain, PracticeItem } from '../../components/Practice';
import { Badge, Body, Button, Card, EmptyState, H1, H2, Muted, ProgressBar, Row, Screen } from '../../components/ui';
import { findCase, findExam } from '../../curriculum/catalog';
import { swissNote } from '../../curriculum/plan';
import { formatClock, knownSourceLabel, reviewOrder, type ItemMark } from '../../lib/exam-session';
import { saveMock } from '../../lib/learn-actions';
import { useI18n } from '../../lib/i18n';
import { useTheme } from '../../theme-context';

export default function MockScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const theme = useTheme();
  const exam = findExam(String(id));
  const [index, setIndex] = useState(0);
  const [ok, setOk] = useState<boolean | null>(null);
  const [marks, setMarks] = useState<Record<string, ItemMark>>({});
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
  const clock = formatClock(left);
  const urgent = left > 0 && left < 60;
  const source = knownSourceLabel(exam.source?.name);
  const sourceText = source.known ? source.text : t('sourceCheck');
  const flagged = item ? Boolean(marks[item.id]?.flagged) : false;
  const toggleFlag = () => {
    if (!item) return;
    setMarks((prev) => ({
      ...prev,
      [item.id]: { ok: prev[item.id]?.ok ?? ok, flagged: !prev[item.id]?.flagged },
    }));
  };
  return (
    <Screen>
      <BackBar label={t('tabLearn')} />
      <Muted>{exam.de.title}</Muted>
      <H1>{exam.title}</H1>
      <Body>{exam.intro}</Body>
      <H2
        accessibilityLabel={t('mockClock', { clock })}
        color={urgent ? theme.palette.danger : undefined}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {t('mockClock', { clock })}
      </H2>
      <Muted>{t('reference')} : {sourceText}</Muted>
      <ProgressBar value={exam.items.length ? Math.min(1, index / exam.items.length) : 0} label={t('mockReview')} />
      {finished ? (
        <>
          <Card>
            <H1>{t('noteLabel', { n: note.toFixed(1) })}</H1>
            <Muted>{closed && index < exam.items.length ? t('mockTimeUp') : t('noteHint')}</Muted>
            <Body>
              {correct} / {exam.items.length}
            </Body>
            {related ? <Body>{related.title}</Body> : null}
            <Button label={t('finish')} onPress={() => saveMock(exam.id, note)} />
          </Card>
          <H2>{t('mockReview')}</H2>
          {reviewOrder(exam.items, marks).map((row, position) => {
            const mark = marks[row.id];
            const status = mark?.ok === true ? t('correct') : mark?.ok === false ? t('incorrect') : t('mockUnanswered');
            const tone = mark?.ok === true ? 'ok' : mark?.ok === false ? 'warn' : 'neutral';
            return (
              <Card key={row.id} accessibilityLabel={`${position + 1}. ${row.prompt}. ${status}`}>
                <Row style={{ flexWrap: 'wrap' }}>
                  <Badge label={status} tone={tone} />
                  {mark?.flagged ? <Badge label={t('mockFlagBadge')} tone="info" /> : null}
                </Row>
                <Body>{row.prompt}</Body>
                <Muted>{row.explain}</Muted>
                <Muted>
                  {t('reference')} : {sourceText}
                </Muted>
              </Card>
            );
          })}
        </>
      ) : (
        <>
          <Muted>{t('questionOf', { n: index + 1, t: exam.items.length })}</Muted>
          <PracticeItem
            key={item.id}
            item={item}
            checked={ok !== null}
            onAnswer={(_value, good) => {
              if (ok !== null) return;
              setOk(good);
              if (good) setCorrect((value) => value + 1);
              setMarks((prev) => ({
                ...prev,
                [item.id]: { ok: good, flagged: Boolean(prev[item.id]?.flagged) },
              }));
            }}
          />
          <Button variant={flagged ? 'primary' : 'ghost'} label={flagged ? t('mockUnflag') : t('mockFlag')} onPress={toggleFlag} />
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
