import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { useFocus } from '../../lib/focus';
import { useI18n } from '../../lib/i18n';
import { colors } from '../../theme';
import { useWindowDimensions } from 'react-native';

export default function TabsLayout() {
  // Libellés d'onglets : suivent la taille de texte du système jusqu'à ×1,4, au-delà la barre déborderait.
  const { fontScale } = useWindowDimensions();
  const tabFs = (n: number) => Math.round(n * Math.min(fontScale, 1.4));
  const { t } = useI18n();
  // Mode Focus : barre d'onglets masquée pendant la séance (aucun « switch » en un geste).
  const focusOn = useFocus().active != null;
  const icon =
    (name: keyof typeof Ionicons.glyphMap) =>
    ({ color, size }: { color: import('react-native').ColorValue; size: number }) => (
      <Ionicons name={name} color={(color ?? undefined) as string | undefined} size={size} />
    );
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: focusOn ? { display: 'none' } : { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: { fontSize: tabFs(10), fontWeight: '600' },
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
