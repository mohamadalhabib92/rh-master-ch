import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import { setOnboarded } from '../lib/learn-actions';
import { shouldShowOnboarding } from '../lib/learn-state';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';
import { useTheme } from '../theme-context';
import { Body, Button, H1, Muted, Row } from './ui';

const STEPS = [
  { title: 'onboard1Title', text: 'onboard1Text', icon: 'albums-outline' },
  { title: 'onboard2Title', text: 'onboard2Text', icon: 'sunny-outline' },
  { title: 'onboard3Title', text: 'onboard3Text', icon: 'options-outline' },
] as const;

export function Onboarding() {
  const state = appStore.useStore();
  const { t } = useI18n();
  const theme = useTheme();
  const [step, setStep] = useState(0);
  if (!shouldShowOnboarding(state as unknown as Record<string, unknown>)) return null;
  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  return (
    <Modal visible animationType={theme.reduceMotion ? 'none' : 'fade'} transparent>
      <View style={{ flex: 1, backgroundColor: theme.glass.translucent ? 'rgba(11, 16, 22, 0.46)' : theme.palette.bg, justifyContent: 'center', padding: 24 }}>
        <View
          style={{
            width: '100%',
            maxWidth: 520,
            alignSelf: 'center',
            gap: 16,
            backgroundColor: theme.glass.translucent ? theme.glass.surface : theme.palette.surface,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.glass.border,
            borderTopColor: theme.glass.highlight,
            padding: 24,
          }}
        >
          <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: theme.palette.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={current.icon} size={32} color={theme.palette.primaryText} />
          </View>
          <Muted>
            {step + 1} / {STEPS.length}
          </Muted>
          <H1>{t(current.title)}</H1>
          <Body>{t(current.text)}</Body>
          <Row style={{ flexWrap: 'wrap' }}>
            <Button
              label={last ? t('onboardStart') : t('onboardNext')}
              onPress={() => {
                if (last) setOnboarded();
                else setStep((value) => value + 1);
              }}
            />
            {last ? null : <Button variant="ghost" label={t('onboardSkip')} onPress={() => setOnboarded()} />}
          </Row>
        </View>
      </View>
    </Modal>
  );
}
