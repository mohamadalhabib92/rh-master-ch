import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { Highlight } from '../../components/Highlight';
import { Card, EmptyState, GlassWash, H1, Muted, Row } from '../../components/ui';
import { GLOSSARY, normalize } from '../../data/glossary';
import { useI18n } from '../../lib/i18n';
import { useDebounced } from '../../lib/useDebounced';
import { onGlossaryFind } from '../../lib/mac-runtime';
import { space } from '../../theme';
import { useTheme } from '../../theme-context';

export default function Glossary() {
  const { t, lang } = useI18n();
  const theme = useTheme();
  const [q, setQ] = useState('');
  const inputRef = useRef<{ focus: () => void } | null>(null);
  const dq = useDebounced(q, 250);
  const index = useMemo(() => GLOSSARY.map((g) => ({ g, hay: normalize([g.fr, g.de, g.it, g.en, g.def].join(' | ')) })), []);
  const list = useMemo(() => {
    const n = normalize(dq.trim());
    if (n.length < 1) return GLOSSARY;
    return index.filter((x) => x.hay.includes(n)).map((x) => x.g);
  }, [dq, index]);
  const others = (['fr', 'de', 'it', 'en'] as const).filter((l) => l !== lang);
  useEffect(() => onGlossaryFind(() => inputRef.current?.focus()), []);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.glass.canvas, overflow: 'hidden' }}>
      <GlassWash />
      <FlatList
        data={list}
        keyExtractor={(g) => g.id}
        numColumns={theme.columns}
        key={theme.columns}
        columnWrapperStyle={theme.columns === 2 ? { gap: 12 } : undefined}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48, width: '100%', maxWidth: theme.maxWidth, alignSelf: 'center' }}
        ListHeaderComponent={
          <View style={{ gap: space.md }}>
            <H1>{t('tabGlossary')}</H1>
            <DisclaimerBanner />
            <View
              style={[
                styles.search,
                {
                  backgroundColor: theme.glass.translucent ? theme.glass.surface : theme.palette.surface,
                  borderColor: theme.glass.translucent ? theme.glass.border : theme.palette.border,
                  borderTopColor: theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(26,29,35,0.16)',
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <Ionicons name="search" size={18} color={theme.palette.muted} />
              <TextInput
                ref={inputRef as never}
                value={q}
                onChangeText={setQ}
                placeholder={t('glossarySearch')}
                placeholderTextColor={theme.palette.muted}
                accessibilityLabel={t('glossarySearch')}
                style={[styles.input, { color: theme.palette.text, fontFamily: theme.fontFamily }]}
                autoCorrect={false}
              />
              {q ? (
                <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={() => setQ('')} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close-circle" size={18} color={theme.palette.muted} />
                </Pressable>
              ) : null}
            </View>
            <Muted>{t('terms', { n: list.length })}</Muted>
          </View>
        }
        ListEmptyComponent={<EmptyState icon={<Ionicons name="search-outline" size={36} color={theme.palette.muted} />} title={t('noTerm')} text={t('noTermText')} />}
        renderItem={({ item: g }) => (
          <Card>
            <Highlight text={g[lang]} query={dq} style={[styles.term, { color: theme.palette.text }]} />
            <Row style={{ flexWrap: 'wrap' }} gap={6}>
              {others.map((l) => (
                <View key={l} style={[styles.tr, { backgroundColor: theme.palette.surfaceAlt }]}>
                  <Muted>
                    <Muted style={{ fontWeight: '700' }}>{l.toUpperCase()} </Muted>
                    <Highlight text={g[l]} query={dq} />
                  </Muted>
                </View>
              ))}
            </Row>
            <Highlight text={g.def} query={dq} style={[styles.def, { color: theme.palette.text }]} />
            {lang !== 'fr' ? <Muted style={{ fontStyle: 'italic' }}>{t('frOnly')}</Muted> : null}
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderTopWidth: 2, paddingHorizontal: 12, minHeight: 48 },
  input: { flex: 1, fontSize: 16, minHeight: 44 },
  term: { fontSize: 16, fontWeight: '700' },
  tr: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  def: { fontSize: 15, lineHeight: 22 },
});
