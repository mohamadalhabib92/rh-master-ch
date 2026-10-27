import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { Highlight } from '../../components/Highlight';
import { Card, EmptyState, H1, Muted, Row } from '../../components/ui';
import { GLOSSARY, normalize } from '../../data/glossary';
import { useI18n } from '../../lib/i18n';
import { useDebounced } from '../../lib/useDebounced';
import { colors, radius, space } from '../../theme';

export default function Glossary() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState('');
  const dq = useDebounced(q, 250);
  const index = useMemo(() => GLOSSARY.map((g) => ({ g, hay: normalize([g.fr, g.de, g.it, g.en, g.def].join(' | ')) })), []);
  const list = useMemo(() => {
    const n = normalize(dq.trim());
    if (n.length < 1) return GLOSSARY;
    return index.filter((x) => x.hay.includes(n)).map((x) => x.g);
  }, [dq, index]);
  const others = (['fr', 'de', 'it', 'en'] as const).filter((l) => l !== lang);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={list}
        keyExtractor={(g) => g.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48, width: '100%', maxWidth: 760, alignSelf: 'center' }}
        ListHeaderComponent={
          <View style={{ gap: space.md }}>
            <H1>{t('tabGlossary')}</H1>
            <DisclaimerBanner />
            <View style={styles.search}>
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder={t('glossarySearch')}
                placeholderTextColor={colors.muted}
                accessibilityLabel={t('glossarySearch')}
                style={styles.input}
                autoCorrect={false}
              />
              {q ? <Ionicons name="close-circle" size={18} color={colors.muted} onPress={() => setQ('')} /> : null}
            </View>
            <Muted>{t('terms', { n: list.length })}</Muted>
          </View>
        }
        ListEmptyComponent={<EmptyState icon={<Ionicons name="search-outline" size={36} color={colors.muted} />} title={t('noTerm')} text={t('noTermText')} />}
        renderItem={({ item: g }) => (
          <Card>
            <Highlight text={g[lang]} query={dq} style={styles.term} />
            <Row style={{ flexWrap: 'wrap' }} gap={6}>
              {others.map((l) => (
                <View key={l} style={styles.tr}>
                  <Muted>
                    <Muted style={{ fontWeight: '700' }}>{l.toUpperCase()} </Muted>
                    <Highlight text={g[l]} query={dq} />
                  </Muted>
                </View>
              ))}
            </Row>
            <Highlight text={g.def} query={dq} style={styles.def} />
            {lang !== 'fr' ? <Muted style={{ fontStyle: 'italic' }}>{t('frOnly')}</Muted> : null}
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, minHeight: 46 },
  input: { flex: 1, fontSize: 16, color: colors.text, minHeight: 44 },
  term: { fontSize: 16, fontWeight: '700', color: colors.text },
  tr: { backgroundColor: colors.surfaceAlt, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  def: { fontSize: 14, lineHeight: 20, color: colors.text },
});
