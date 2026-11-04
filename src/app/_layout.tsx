import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BootGate } from '../components/BootGate';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FeedbackProvider } from '../components/motion';
import { I18nProvider } from '../lib/i18n';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <I18nProvider>
          <BootGate>
            <FeedbackProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="module/[id]" />
              <Stack.Screen name="quiz/[id]" />
              <Stack.Screen name="disclaimer" options={{ presentation: 'modal' }} />
            </Stack>
            </FeedbackProvider>
          </BootGate>
        </I18nProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
