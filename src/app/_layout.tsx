import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BootGate } from '../components/BootGate';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { MacBridge } from '../components/MacBridge';
import { Onboarding } from '../components/Onboarding';
import { I18nProvider } from '../lib/i18n';
import { ThemeProvider, useTheme } from '../theme-context';

function Shell() {
  const theme = useTheme();
  const path = usePathname();
  if (Platform.isTV) {
    return (
      <BootGate>
        <StatusBar hidden />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.glass.canvas } }}>
          <Stack.Screen name="tv" />
        </Stack>
        {path.startsWith('/tv') ? null : <Redirect href="/tv" />}
      </BootGate>
    );
  }
  return (
    <BootGate>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <MacBridge>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.glass.canvas } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="module/[id]" />
        <Stack.Screen name="quiz/[id]" />
        <Stack.Screen name="lesson/[id]" />
        <Stack.Screen name="drill/[id]" />
        <Stack.Screen name="case/[id]" />
        <Stack.Screen name="mock/[id]" />
        <Stack.Screen name="cards" />
        <Stack.Screen name="focus" />
        <Stack.Screen name="plan" />
        <Stack.Screen name="disclaimer" options={{ presentation: 'modal' }} />
      </Stack>
      <Onboarding />
      </MacBridge>
    </BootGate>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <I18nProvider>
          <ThemeProvider>
            <Shell />
          </ThemeProvider>
        </I18nProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
