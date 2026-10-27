import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SourcesList } from '../components/Disclaimer';
import { Body, Button, Card, H1, H2, Muted, Row, Screen } from '../components/ui';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';

export default function Disclaimer() {
  const { t } = useI18n();
  const close = () => {
    appStore.set({ disclaimerSeen: true });
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  return (
    <Screen>
      <Row>
        <Ionicons name="information-circle" size={28} color="#8A5A00" />
        <H1>{t('disclaimerTitle')}</H1>
      </Row>
      <Card>
        <Body>{t('disclaimerText')}</Body>
      </Card>
      <Card>
        <H2>{t('aiNotice')}</H2>
        <Muted>{t('aiNoticeText')}</Muted>
      </Card>
      <Card>
        <SourcesList />
      </Card>
      <Button label={t('understood')} onPress={close} />
    </Screen>
  );
}
