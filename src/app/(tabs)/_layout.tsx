import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { useI18n } from '../../lib/i18n';
import { colors } from '../../theme';

export default function TabsLayout() {
  const { t } = useI18n();
  const icon =
    (name: keyof typeof Ionicons.glyphMap) =>
    ({ color, size }: { color: import('react-native').ColorValue; size: number }) => (
      <Ionicons name={name} color={(color ?? undefined) as string | undefined} size={size} />
    );
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabHome'), tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="modules" options={{ title: t('tabModules'), tabBarIcon: icon('school-outline') }} />
      <Tabs.Screen name="calc" options={{ title: t('tabCalc'), tabBarIcon: icon('calculator-outline') }} />
      <Tabs.Screen name="glossary" options={{ title: t('tabGlossary'), tabBarIcon: icon('book-outline') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabSettings'), tabBarIcon: icon('settings-outline') }} />
    </Tabs>
  );
}
