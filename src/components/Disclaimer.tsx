import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { OFFICIAL_SOURCES, visibleOfficialSources } from '../data/laws';
import { useI18n } from '../lib/i18n';
import { radius, space } from '../theme';
import { useTheme } from '../theme-context';
import { H3, Muted } from './ui';

/** Bandeau permanent : contenu pédagogique, pas un conseil juridique. */
export function DisclaimerBanner() {
  const { t } = useI18n();
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('disclaimerTitle')}
      onPress={() => router.push('/disclaimer')}
      style={({ pressed }) => [
        styles.banner,
        {
          backgroundColor: theme.palette.warnBg,
          borderColor: theme.palette.border,
          borderTopColor: theme.glass.highlight,
          transform: pressed && !theme.reduceMotion ? [{ translateY: 1 }] : undefined,
        },
      ]}
    >
      <Ionicons name="information-circle" size={18} color={theme.palette.warnText} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text allowFontScaling style={[styles.bannerText, { color: theme.palette.warnText }]}>
          {t('disclaimerShort')}
        </Text>
        <Text allowFontScaling style={[styles.bannerSub, { color: theme.palette.warnText }]}>
          {t('notAffiliated')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.palette.warnText} />
    </Pressable>
  );
}

export function SourcesList() {
  const { t } = useI18n();
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <H3>{t('sourcesOfficial')}</H3>
      {visibleOfficialSources(OFFICIAL_SOURCES).map((s) => {
        const placeholder = s.url.startsWith('YOUR_');
        return (
          <Pressable
            key={s.label}
            disabled={placeholder}
            accessibilityRole="link"
            accessibilityLabel={s.label}
            onPress={() => Linking.openURL(s.url).catch(() => undefined)}
            style={[styles.source, { borderColor: theme.palette.border }]}
          >
            <Ionicons name={placeholder ? 'create-outline' : 'open-outline'} size={16} color={theme.palette.accent} />
            <View style={{ flex: 1 }}>
              <Text allowFontScaling style={[styles.sourceLabel, { color: theme.palette.text }]}>
                {s.label}
              </Text>
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
    minHeight: 48,
    borderWidth: 1,
    borderTopWidth: 1,
  },
  bannerText: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  bannerSub: { fontSize: 12, lineHeight: 16 },
  source: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 44, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  sourceLabel: { fontSize: 14, fontWeight: '600' },
});
