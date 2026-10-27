import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BootScreen } from '../components/ui';
import { I18nProvider } from '../lib/i18n';
import { appStore } from '../lib/store';
import { colors } from '../theme';

function Gate({ children }: { children: React.ReactNode }) {
  const hydrated = appStore.useHydrated();
  if (!hydrated) return <BootScreen label="RH Master CH…" />;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Gate>
        <I18nProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="module/[id]" />
            <Stack.Screen name="quiz/[id]" />
            <Stack.Screen name="disclaimer" options={{ presentation: 'modal' }} />
          </Stack>
        </I18nProvider>
      </Gate>
    </SafeAreaProvider>
  );
}
