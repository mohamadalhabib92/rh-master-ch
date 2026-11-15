import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { HealthyBackup } from '../../components/HealthyBackup';
import { RawBackupNotice } from '../../components/RawBackupNotice';
import { Badge, Body, Button, Card, Chip, H1, H2, Muted, Row, Screen } from '../../components/ui';
import { LANGS } from '../../i18n/strings';
import { aiOptionalServiceDown } from '../../lib/flags';
import { useI18n } from '../../lib/i18n';
import { confirmProgressReset } from '../../lib/reset-progress';
import { appStore } from '../../lib/store';
import { FOCUS_CHOICES } from '../../lib/learn-state';
import { updateLearnSettings } from '../../lib/learn-actions';
import { useTheme } from '../../theme-context';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const theme = useTheme();
  const settings = appStore.useStore().learn.settings;
  const resetPhase = appStore.useDataStatus().resetPhase;
  const [confirm, setConfirm] = useState(false);
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
      <RawBackupNotice />
      <HealthyBackup />
      <Card>
        <H2>{t('dataLocal')}</H2>
        <Muted>{t('dataLocalText')}</Muted>
        {resetPhase === 'done' ? <Body color={theme.palette.ok}>{t('resetDone')}</Body> : null}
        {resetPhase === 'pending' ? <Body>{t('resetPending')}</Body> : null}
        {resetPhase === 'failed' ? <Body color={theme.palette.danger}>{t('resetFailed')}</Body> : null}
        {confirm ? (
          <Row style={{ flexWrap: 'wrap' }}>
            <Button
              variant="danger"
              label={t('confirmReset')}
              onPress={() => {
                confirmProgressReset(appStore);
                setConfirm(false);
              }}
            />
            <Button variant="ghost" label={t('close')} onPress={() => setConfirm(false)} />
          </Row>
        ) : (
          <Button variant="ghost" label={t('resetData')} icon={<Ionicons name="trash-outline" size={16} color={theme.palette.primaryText} />} onPress={() => setConfirm(true)} style={{ alignSelf: 'flex-start' }} />
        )}
      </Card>
      <Card>
        <H2>{t('designAppearance')}</H2>
        <Row style={{ flexWrap: 'wrap' }}>
          <Chip label={t('darkMode')} active={settings.dark} onPress={() => updateLearnSettings({ dark: !settings.dark })} />
          <Chip label={t('highContrast')} active={settings.contrast === 'high'} onPress={() => updateLearnSettings({ contrast: settings.contrast === 'high' ? 'default' : 'high' })} />
          <Chip label={t('dyslexiaFont')} active={settings.dyslexiaFont} onPress={() => updateLearnSettings({ dyslexiaFont: !settings.dyslexiaFont })} />
          <Chip label={t('reduceMotion')} active={settings.reduceMotion} onPress={() => updateLearnSettings({ reduceMotion: !settings.reduceMotion })} />
          <Chip label={t('haptics')} active={settings.haptics} onPress={() => updateLearnSettings({ haptics: !settings.haptics })} />
          <Chip label={settings.reminder === 'gentle' ? t('reminderGentle') : t('reminderOff')} active={settings.reminder === 'gentle'} onPress={() => updateLearnSettings({ reminder: settings.reminder === 'gentle' ? 'off' : 'gentle' })} />
        </Row>
        <Muted>{t('celebrations')}</Muted>
        <Row style={{ flexWrap: 'wrap' }}>
          <Chip label={t('celebrationsFull')} active={settings.celebrations === 'full'} onPress={() => updateLearnSettings({ celebrations: 'full' })} />
          <Chip label={t('celebrationsReduced')} active={settings.celebrations === 'reduced'} onPress={() => updateLearnSettings({ celebrations: 'reduced' })} />
          <Chip label={t('celebrationsOff')} active={settings.celebrations === 'off'} onPress={() => updateLearnSettings({ celebrations: 'off' })} />
        </Row>
        <Muted>{t('focusLength')}</Muted>
        <Row style={{ flexWrap: 'wrap' }}>
          {FOCUS_CHOICES.map((choice) => (
            <Chip key={choice} label={t('minutesShort', { n: choice })} active={settings.focusMinutes === choice} onPress={() => updateLearnSettings({ focusMinutes: choice })} />
          ))}
        </Row>
        <Button variant="ghost" label={t('onboard1Title')} onPress={() => updateLearnSettings({ onboarded: false })} style={{ alignSelf: 'flex-start' }} />
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
