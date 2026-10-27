import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import type { Module } from '../data/types';
import { pick } from '../data/types';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';
import { colors, radius } from '../theme';
import { Badge, Card, H3, Muted, ProgressBar, Row } from './ui';

export function moduleRatio(m: Module, correct: string[] | undefined) {
  return (correct?.length ?? 0) / m.questions.length;
}

export function ModuleCard({ m }: { m: Module }) {
  const { t, lang } = useI18n();
  const s = appStore.useStore();
  const p = s.progress[m.id];
  const ratio = moduleRatio(m, p?.correct);
  const status = ratio >= 1 ? 'completed' : ratio > 0 || s.ficheRead[m.id] ? 'inProgress' : 'notStarted';
  return (
    <Card onPress={() => router.push(`/module/${m.id}`)} accessibilityLabel={pick(m.title, lang).value}>
      <Row gap={12} style={{ alignItems: 'flex-start' }}>
        <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Muted>{t('module', { n: m.n })}</Muted>
          <H3>{pick(m.title, lang).value}</H3>
          <Row>
            <Badge label={t(status)} tone={status === 'completed' ? 'ok' : status === 'inProgress' ? 'info' : 'neutral'} />
            <Muted>{t('questionsDone', { n: p?.correct.length ?? 0, t: m.questions.length })}</Muted>
          </Row>
        </View>
      </Row>
      <ProgressBar value={ratio} color={ratio >= 1 ? colors.ok : colors.primary} />
    </Card>
  );
}
