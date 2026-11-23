import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SourcesList } from '../components/Disclaimer';
import { Badge, Body, Button, Card, H1, H2, Muted, Row, Screen } from '../components/ui';
import { aiOptionalServiceDown } from '../lib/flags';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';
import { useTheme } from '../theme-context';

export default function Disclaimer() {
  const { t } = useI18n();
  const theme = useTheme();
  const close = () => {
    appStore.set({ disclaimerSeen: true });
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  return (
    <Screen>
      <Row>
        <Ionicons name="information-circle" size={28} color={theme.palette.warnText} />
        <H1>{t('disclaimerTitle')}</H1>
      </Row>
      <Card>
        <Body>{t('disclaimerText')}</Body>
      </Card>
      <Card>
        <H2>{t('aiNotice')}</H2>
        {aiOptionalServiceDown() ? <Badge label={t('optionalServiceDown')} tone="warn" /> : null}
        <Muted>{t('aiNoticeText')}</Muted>
      </Card>
      <Card>
        <SourcesList />
      </Card>
      <Button label={t('understood')} onPress={close} />
    </Screen>
  );
}
