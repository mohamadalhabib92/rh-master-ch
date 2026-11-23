import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dictionaries, type Lang } from '../i18n/strings';
import { reportCrash } from '../lib/crash';
import { appStore } from '../lib/store';
import { darkPalette, hit, lightPalette, radius, space, type Palette } from '../theme';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/** Repli global : pas d'écran blanc, pas de pile technique en production. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    reportCrash(error);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return <ErrorFallback error={this.state.error} onRetry={this.reset} />;
  }
}

function text(lang: Lang, key: keyof typeof dictionaries.fr): string {
  const dict = dictionaries[lang];
  const value = dict?.[key];
  return typeof value === 'string' ? value : dictionaries.fr[key];
}

function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  let lang: Lang = 'fr';
  let palette: Palette = lightPalette;
  try {
    const state = appStore.get();
    lang = state.lang;
    palette = state.learn.settings.dark ? darkPalette : lightPalette;
  } catch {
    lang = 'fr';
  }
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.bg }]}>
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Text allowFontScaling style={[styles.title, { color: palette.text }]}>{text(lang, 'errorTitle')}</Text>
        <Text allowFontScaling style={[styles.body, { color: palette.text }]}>{text(lang, 'errorText')}</Text>
        {__DEV__ ? <Text allowFontScaling style={[styles.dev, { color: palette.muted }]}>{error.message}</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={text(lang, 'errorRetry')} onPress={onRetry} style={[styles.button, { backgroundColor: palette.primary, borderBottomColor: palette.border }]}>
          <Text allowFontScaling style={[styles.buttonText, { color: palette.onPrimary }]}>{text(lang, 'errorRetry')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  card: { width: '100%', maxWidth: 480, borderRadius: radius.lg, borderWidth: 1, borderTopWidth: 1, padding: space.xl, gap: space.md },
  title: { fontSize: 22, fontWeight: '800' },
  body: { fontSize: 15, lineHeight: 22 },
  dev: { fontSize: 12 },
  button: { minHeight: hit, borderRadius: radius.md, borderBottomWidth: 3, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  buttonText: { fontWeight: '700', fontSize: 15 },
});
