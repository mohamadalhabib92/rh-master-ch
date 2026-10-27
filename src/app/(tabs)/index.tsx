import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DisclaimerBanner, SourcesList } from '../../components/Disclaimer';
import { ModuleCard } from '../../components/ModuleCard';
import { Badge, Body, Button, Card, H1, H2, Muted, ProgressBar, Row, Screen } from '../../components/ui';
import { MODULES, findModule } from '../../data/modules';
import { useI18n } from '../../lib/i18n';
import { appStore } from '../../lib/store';
import { colors, radius, space } from '../../theme';

export default function Home() {
  const { t } = useI18n();
  const s = appStore.useStore();
  const total = MODULES.reduce((a, m) => a + m.questions.length, 0);
  const done = MODULES.reduce((a, m) => a + (s.progress[m.id]?.correct.length ?? 0), 0);
  const last = findModule(s.lastModule ?? undefined);
  const next = last ?? MODULES.find((m) => (s.progress[m.id]?.correct.length ?? 0) < m.questions.length) ?? MODULES[0];
  return (
    <Screen>
      <View style={styles.hero}>
        <Row>
          <View style={styles.flag}>
            <Ionicons name="add" size={26} color="#fff" />
          </View>
          <Badge label={t('offline')} tone="ok" />
        </Row>
        <H1 color="#fff">{t('appName')}</H1>
        <Body color="#FCE3E7">{t('tagline')}</Body>
        <Button
          label={done > 0 ? t('continueStudy') : t('startStudy')}
          variant="secondary"
          onPress={() => router.push(`/module/${next.id}`)}
          icon={<Ionicons name="play" size={16} color={colors.primary} />}
          style={{ alignSelf: 'flex-start', marginTop: 4 }}
        />
      </View>
      <DisclaimerBanner />
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>{t('overallProgress')}</H2>
          <Muted>{Math.round((done / total) * 100)} %</Muted>
        </Row>
        <ProgressBar value={done / total} height={8} />
        <Muted>
          {t('questionsDone', { n: done, t: total })} · {t('modulesCount', { n: MODULES.length })}
        </Muted>
      </Card>
      {last ? <ModuleCard m={last} /> : null}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>{t('news')}</H2>
          <Badge label={t('newsComing')} tone="warn" />
        </Row>
        <Muted>{t('newsComingText')}</Muted>
      </Card>
      <Card>
        <SourcesList />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: space.xl, gap: space.sm },
  flag: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
