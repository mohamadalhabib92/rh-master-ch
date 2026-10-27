import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { Body, Button, Card, Chip, H1, H2, Muted, Row, Screen } from '../../components/ui';
import { LANGS } from '../../i18n/strings';
import { useI18n } from '../../lib/i18n';
import { appStore } from '../../lib/store';
import { colors } from '../../theme';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
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
        <H2>{t('dataLocal')}</H2>
        <Muted>{t('dataLocalText')}</Muted>
        {done ? <Body color={colors.ok}>{t('resetDone')}</Body> : null}
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
                setDone(true);
              }}
            />
            <Button variant="ghost" label={t('close')} onPress={() => setConfirm(false)} />
          </Row>
        ) : (
          <Button variant="ghost" label={t('resetData')} icon={<Ionicons name="trash-outline" size={16} color={colors.primary} />} onPress={() => { setDone(false); setConfirm(true); }} style={{ alignSelf: 'flex-start' }} />
        )}
      </Card>
      <Card>
        <H2>{t('aiNotice')}</H2>
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
