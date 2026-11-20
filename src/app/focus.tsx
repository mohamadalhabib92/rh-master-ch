import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackBar } from '../components/BackBar';
import { Body, Button, H1, Muted, Screen } from '../components/ui';
import { FOCUS_CHOICES } from '../lib/learn-state';
import { updateLearnSettings } from '../lib/learn-actions';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';
import { useTheme } from '../theme-context';

export default function FocusScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const minutes = appStore.useStore().learn.settings.focusMinutes;
  const [left, setLeft] = useState(minutes * 60);
  const [run, setRun] = useState(false);
  const [phase, setPhase] = useState<'focus' | 'break'>('focus');
  const [stopped, setStopped] = useState(false);
  useEffect(() => {
    if (!run) return;
    const timer = setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          if (phase === 'focus') {
            setPhase('break');
            return appStore.get().learn.settings.breakMinutes * 60;
          }
          setRun(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, run]);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return (
    <Screen calm scroll={false}>
      <BackBar label={t('tabLearn')} />
      <Muted>{phase === 'break' ? t('focusBreak') : t('focusMode')}</Muted>
      <H1 style={{ fontSize: theme.width >= 900 ? 72 : 56, lineHeight: theme.width >= 900 ? 84 : 66, textAlign: 'center' }}>
        {mm}:{ss}
      </H1>
      <Body center>{t('focusLead')}</Body>
      {stopped ? <Muted center>{t('focusStopNote')}</Muted> : null}
      <Button label={run ? t('focusPause') : t('focusStart')} onPress={() => setRun((value) => !value)} />
      <Button
        variant="ghost"
        label={t('focusStop')}
        onPress={() => {
          setRun(false);
          setStopped(true);
        }}
      />
      <Muted center>{t('focusLength')}</Muted>
      {FOCUS_CHOICES.map((choice) => (
        <Button
          key={choice}
          variant={choice === minutes ? 'primary' : 'secondary'}
          label={t('minutesShort', { n: choice })}
          onPress={() => {
            updateLearnSettings({ focusMinutes: choice });
            if (!run && phase === 'focus') setLeft(choice * 60);
          }}
        />
      ))}
      <Button variant="ghost" label={t('back')} onPress={() => router.back()} />
    </Screen>
  );
}
