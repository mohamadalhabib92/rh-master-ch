import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { useVibrations } from '../../components/access';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { RawBackupNotice } from '../../components/RawBackupNotice';
import { Badge, Body, Button, Card, Chip, H1, H2, Muted, Row, Screen } from '../../components/ui';
import { LANGS } from '../../i18n/strings';
import { aiOptionalServiceDown } from '../../lib/flags';
import { useI18n } from '../../lib/i18n';
import { appStore } from '../../lib/store';
import { colors } from '../../theme';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const resetPhase = appStore.useDataStatus().resetPhase;
  const [confirm, setConfirm] = useState(false);
  const [vibrations, setVibrations] = useVibrations();
  return (
    <Screen>
      <H1>{t('settings')}</H1>
      <DisclaimerBanner />
      <Card>
        <H2>{t('language')}</H2>
        <Row style={{ flexWrap: 'wrap' }}>
          {LANGS.map((l) => (
            <Chip key={l.code} label={l.label} active={lang === l.code} onPress={() => setLang(l.code)} />
          ))}
        </Row>
        {lang !== 'fr' ? <Muted>{t('provisional')}</Muted> : null}
      </Card>
      <Card>
        <H2>{t('comfort')}</H2>
        <Row style={{ minHeight: 48, justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Body>{t('vibrations')}</Body>
            <Muted>{t('vibrationsHint')}</Muted>
          </View>
          <Switch
            accessibilityLabel={t('vibrations')}
            accessibilityHint={t('vibrationsHint')}
            value={vibrations}
            onValueChange={setVibrations}
            trackColor={{ true: colors.primary, false: colors.muted }}
            ios_backgroundColor={colors.muted}
          />
        </Row>
        <Button variant="ghost" label={t('focusSettings')} onPress={() => router.push('/focus')} style={{ alignSelf: 'flex-start' }} />
      </Card>
      <RawBackupNotice />
      <Card>
        <H2>{t('dataLocal')}</H2>
        <Muted>{t('dataLocalText')}</Muted>
        {resetPhase === 'done' ? <Body color={colors.ok}>{t('resetDone')}</Body> : null}
        {resetPhase === 'pending' ? <Body>{t('resetPending')}</Body> : null}
        {confirm ? (
          <Row style={{ flexWrap: 'wrap' }}>
            <Button
              variant="danger"
              label={t('confirmReset')}
              onPress={() => {
                const keep = appStore.get().lang;
                appStore.reset();
                appStore.set({ lang: keep });
                setConfirm(false);
              }}
            />
            <Button variant="ghost" label={t('close')} onPress={() => setConfirm(false)} />
          </Row>
        ) : (
          <Button variant="ghost" label={t('resetData')} icon={<Ionicons name="trash-outline" size={16} color={colors.primaryText} />} onPress={() => setConfirm(true)} style={{ alignSelf: 'flex-start' }} />
        )}
      </Card>
      <Card>
        <H2>{t('aiNotice')}</H2>
        {aiOptionalServiceDown() ? <Badge label={t('optionalServiceDown')} tone="warn" /> : null}
        <Muted>{t('aiNoticeText')}</Muted>
      </Card>
      <Card>
        <H2>{t('about')}</H2>
        <Muted>{t('aboutText')}</Muted>
        <Button variant="secondary" label={t('disclaimerTitle')} onPress={() => router.push('/disclaimer')} style={{ alignSelf: 'flex-start' }} />
        <Muted>v1.0.0</Muted>
      </Card>
    </Screen>
  );
}
