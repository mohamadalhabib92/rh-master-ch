import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, H2, Muted, Skeleton } from './ui';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';
import { colors, space } from '../theme';

/**
 * Squelettes pendant la lecture locale, puis repli borné à 8 s.
 * Le splash natif n'est pas retenu (pas de preventAutoHideAsync) : dès que le JS
 * s'affiche, il disparaît. Aucun « Loading » infini.
 */
export function BootGate({ children }: { children: React.ReactNode }) {
  const phase = appStore.usePhase();
  const { t } = useI18n();

  if (phase === 'ready') return <>{children}</>;

  if (phase === 'timedOut') {
    return (
      <View style={styles.screen}>
        <View style={styles.box}>
          <H2>{t('bootTimeoutTitle')}</H2>
          <Muted>{t('bootTimeoutText')}</Muted>
          <Button label={t('bootRetry')} onPress={() => appStore.retryHydration()} />
          <Button variant="secondary" label={t('bootOffline')} onPress={() => appStore.continueOffline()} />
        </View>
      </View>
    );
  }

  return (
    <View accessibilityLabel={t('bootSkeletonLabel')} accessibilityRole="progressbar" style={styles.screen}>
      <View style={styles.box}>
        <Skeleton height={132} />
        <Skeleton height={44} />
        <Skeleton height={84} />
        <Skeleton height={84} />
        <Skeleton height={84} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', padding: space.lg, paddingTop: 48 },
  box: { width: '100%', maxWidth: 760, gap: space.md },
});
