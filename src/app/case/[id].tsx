import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { BackBar } from '../../components/BackBar';
import { Body, Button, Card, EmptyState, H1, H2, Muted, Row, Screen } from '../../components/ui';
import { findCase } from '../../curriculum/catalog';
import { scoreRubric } from '../../curriculum/plan';
import { knownSourceLabel } from '../../lib/exam-session';
import { saveCase } from '../../lib/learn-actions';
import { useI18n } from '../../lib/i18n';
import { useTheme } from '../../theme-context';
import { Ionicons } from '@expo/vector-icons';

export default function CaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const theme = useTheme();
  const item = findCase(String(id));
  const [hits, setHits] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  if (!item) {
    return (
      <Screen>
        <BackBar label={t('back')} />
        <EmptyState title={t('notFound')} text={t('notFoundText')} />
      </Screen>
    );
  }
  const scored = scoreRubric(item.rubric.map((row) => ({ points: row.points, hit: !!hits[row.id] })));
  const source = knownSourceLabel(item.source?.name);
  return (
    <Screen>
      <BackBar label={t('tabLearn')} />
      <Muted>
        {item.minutes} min · {item.de.title}
      </Muted>
      <H1>{item.title}</H1>
      <Muted>
        {t('reference')} : {source.known ? source.text : t('sourceCheck')}
      </Muted>
      <Card>
        <Body>{item.prompt}</Body>
      </Card>
      <H2>{t('caseRubric')}</H2>
      {item.rubric.map((row) => (
        <Pressable
          key={row.id}
          accessibilityRole="checkbox"
          accessibilityLabel={row.label}
          accessibilityState={{ checked: !!hits[row.id] }}
          onPress={() => setHits((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
        >
          <Card>
            <Row>
              <Ionicons name={hits[row.id] ? 'checkbox' : 'square-outline'} size={22} color={theme.palette.primaryText} />
              <Body style={{ flex: 1 }}>{row.label}</Body>
              <Muted>{row.points}</Muted>
            </Row>
          </Card>
        </Pressable>
      ))}
      <Button
        label={t('caseShow')}
        onPress={() => {
          setOpen(true);
          saveCase(item.id, scored.note);
        }}
      />
      {open ? (
        <Card>
          <H2>{t('noteLabel', { n: scored.note.toFixed(1) })}</H2>
          <Muted>{t('noteHint')}</Muted>
          <Body>{item.modelAnswer}</Body>
          <Muted>
            {item.source.name} · {item.source.consultedAt}
          </Muted>
        </Card>
      ) : null}
    </Screen>
  );
}
