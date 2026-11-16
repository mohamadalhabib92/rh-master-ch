import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useI18n } from '../../lib/i18n';
import { useTheme } from '../../theme-context';

const ITEMS: { href: '/' | '/learn' | '/modules' | '/calc' | '/glossary' | '/settings'; key: 'tabHome' | 'tabLearn' | 'tabModules' | 'tabCalc' | 'tabGlossary' | 'tabSettings'; icon: keyof typeof Ionicons.glyphMap }[] = [
  { href: '/', key: 'tabHome', icon: 'home-outline' },
  { href: '/learn', key: 'tabLearn', icon: 'leaf-outline' },
  { href: '/modules', key: 'tabModules', icon: 'school-outline' },
  { href: '/calc', key: 'tabCalc', icon: 'calculator-outline' },
  { href: '/glossary', key: 'tabGlossary', icon: 'book-outline' },
  { href: '/settings', key: 'tabSettings', icon: 'settings-outline' },
];

function Sidebar() {
  const { t } = useI18n();
  const theme = useTheme();
  const path = usePathname();
  return (
    <ScrollView
      style={{ width: 248, backgroundColor: theme.palette.surface, borderRightWidth: 1, borderRightColor: theme.palette.border }}
      contentContainerStyle={{ padding: 20, gap: 8, paddingBottom: 32 }}
    >
      <Text style={{ color: theme.palette.text, fontSize: theme.type.h3.fontSize, fontWeight: '800', marginBottom: 12 }}>{t('appName')}</Text>
      {ITEMS.map((item, index) => {
        const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
        return (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            accessibilityLabel={t(item.key)}
            accessibilityState={{ selected: active }}
            hasTVPreferredFocus={index === 0}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => ({
              minHeight: 48,
              borderRadius: 14,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: active ? theme.palette.primarySoft : 'transparent',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons name={item.icon} size={22} color={active ? theme.palette.primaryText : theme.palette.muted} />
            <Text style={{ color: active ? theme.palette.primaryText : theme.palette.text, fontSize: 17, fontWeight: '700' }}>{t(item.key)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function TabsLayout() {
  const { t } = useI18n();
  const theme = useTheme();
  const icon =
    (name: keyof typeof Ionicons.glyphMap) =>
    ({ color, size }: { color: import('react-native').ColorValue; size: number }) => (
      <Ionicons name={name} color={(color ?? undefined) as string | undefined} size={size} />
    );
  return (
    <View style={{ flex: 1, flexDirection: theme.sidebar ? 'row' : 'column', backgroundColor: theme.palette.bg }}>
      {theme.sidebar ? <Sidebar /> : null}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.palette.primaryText,
            tabBarInactiveTintColor: theme.palette.muted,
            tabBarStyle: theme.sidebar
              ? { display: 'none', height: 0 }
              : { backgroundColor: theme.palette.surface, borderTopColor: theme.palette.border, minHeight: 60, paddingTop: 4 },
            tabBarLabelStyle: { fontWeight: '600' },
          }}
        >
          <Tabs.Screen name="index" options={{ title: t('tabHome'), tabBarIcon: icon('home-outline'), tabBarAccessibilityLabel: t('tabHome') }} />
          <Tabs.Screen name="learn" options={{ title: t('tabLearn'), tabBarIcon: icon('leaf-outline'), tabBarAccessibilityLabel: t('tabLearn') }} />
          <Tabs.Screen name="modules" options={{ title: t('tabModules'), tabBarIcon: icon('school-outline'), tabBarAccessibilityLabel: t('tabModules') }} />
          <Tabs.Screen name="calc" options={{ title: t('tabCalc'), tabBarIcon: icon('calculator-outline') }} />
          <Tabs.Screen name="glossary" options={{ title: t('tabGlossary'), tabBarIcon: icon('book-outline') }} />
          <Tabs.Screen name="settings" options={{ title: t('tabSettings'), tabBarIcon: icon('settings-outline') }} />
        </Tabs>
      </View>
    </View>
  );
}

