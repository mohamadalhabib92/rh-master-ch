import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DisclaimerBanner, SourcesList } from '../../components/Disclaimer';
import { RawBackupNotice } from '../../components/RawBackupNotice';
import { ModuleCard } from '../../components/ModuleCard';
import { Badge, Body, Button, Card, H1, H2, Muted, ProgressBar, Row, Screen } from '../../components/ui';
import { NEWS } from '../../data/news';
import { MODULES, findModule } from '../../data/modules';
import { FEATURE_NEWS } from '../../lib/flags';
import { useI18n } from '../../lib/i18n';
import { appStore } from '../../lib/store';
import { useTheme } from '../../theme-context';

export default function Home() {
  const { t } = useI18n();
  const theme = useTheme();
  const s = appStore.useStore();
  const total = MODULES.reduce((a, m) => a + m.questions.length, 0);
  const done = MODULES.reduce((a, m) => a + (s.progress[m.id]?.correct.length ?? 0), 0);
  const last = findModule(s.lastModule ?? undefined);
  const next = last ?? MODULES.find((m) => (s.progress[m.id]?.correct.length ?? 0) < m.questions.length) ?? MODULES[0];
  const wide = theme.columns === 2;
  const pane = { width: wide ? '48%' : '100%', gap: 16 } as const;
  return (
    <Screen>
      <View style={{ flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap', gap: 16 }}>
        <View style={pane}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.palette.heroStart,
            borderRadius: theme.radius.lg,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.40)',
            borderBottomWidth: 3,
            borderBottomColor: theme.dark ? '#3A0A14' : '#5C0E1C',
            boxShadow: theme.glass.buttonRest,
          },
        ]}
      >
        <Row>
          <View style={styles.flag}>
            <Ionicons name="add" size={26} color="#fff" />
          </View>
          <Badge label={t('offline')} tone="ok" />
        </Row>
        <H1 color="#fff">{t('appName')}</H1>
        <Body color="#FCE3E7">{t('tagline')}</Body>
        <Button label={t('tabLearn')} variant="secondary" onPress={() => router.push('/learn')} style={{ alignSelf: 'flex-start' }} />
        <Button
          label={done > 0 ? t('continueStudy') : t('startStudy')}
          variant="secondary"
          onPress={() => router.push(`/module/${next.id}`)}
          icon={<Ionicons name="play" size={16} color={theme.palette.primaryText} />}
          style={{ alignSelf: 'flex-start', marginTop: 4 }}
        />
        </View>
        <DisclaimerBanner />
        <RawBackupNotice />
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
        </View>
        <View style={pane}>
      {last ? <ModuleCard m={last} /> : null}
      {FEATURE_NEWS && NEWS.length > 0 ? (
        <Card>
          <H2>{t('news')}</H2>
          {NEWS.map((item) => (
            <View key={item.id} style={{ gap: 2 }}>
              <Body>{item.title}</Body>
              <Muted>
                {item.date} — {item.source}
              </Muted>
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <H2>{t('news')}</H2>
            <Badge label={t('newsComing')} tone="warn" />
          </Row>
          <Muted>{t('newsComingText')}</Muted>
        </Card>
      )}
      <Card>
        <SourcesList />
      </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 24, gap: 8 },
  flag: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
