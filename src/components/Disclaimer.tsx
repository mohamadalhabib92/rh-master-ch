import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { OFFICIAL_SOURCES } from '../data/laws';
import { useI18n } from '../lib/i18n';
import { colors, radius, space } from '../theme';
import { H3, Muted } from './ui';

/** Bandeau permanent : contenu pédagogique, pas un conseil juridique. */
export function DisclaimerBanner() {
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('disclaimerTitle')}
      onPress={() => router.push('/disclaimer')}
      style={({ pressed }) => [styles.banner, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name="information-circle" size={18} color="#8A5A00" />
      <Text style={styles.bannerText}>{t('disclaimerShort')}</Text>
      <Ionicons name="chevron-forward" size={16} color="#8A5A00" />
    </Pressable>
  );
}

export function SourcesList() {
  const { t } = useI18n();
  return (
    <View style={{ gap: 6 }}>
      <H3>{t('sourcesOfficial')}</H3>
      {OFFICIAL_SOURCES.map((s) => {
        const placeholder = s.url.startsWith('YOUR_');
        return (
          <Pressable
            key={s.label}
            disabled={placeholder}
            accessibilityRole="link"
            onPress={() => Linking.openURL(s.url).catch(() => undefined)}
            style={styles.source}
          >
            <Ionicons name={placeholder ? 'create-outline' : 'open-outline'} size={16} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sourceLabel}>{s.label}</Text>
              <Muted numberOfLines={1}>{s.url}</Muted>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF4DB',
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F3DFA8',
  },
  bannerText: { flex: 1, fontSize: 12.5, lineHeight: 17, color: '#6B4700', fontWeight: '600' },
  source: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  sourceLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
});
