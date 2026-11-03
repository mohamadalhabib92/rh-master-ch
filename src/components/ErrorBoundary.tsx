import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dictionaries, type Lang } from '../i18n/strings';
import { reportCrash } from '../lib/crash';
import { appStore } from '../lib/store';
import { colors, hit, radius, space } from '../theme';

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
  try {
    lang = appStore.get().lang;
  } catch {
    lang = 'fr';
  }
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{text(lang, 'errorTitle')}</Text>
        <Text style={styles.body}>{text(lang, 'errorText')}</Text>
        {__DEV__ ? <Text style={styles.dev}>{error.message}</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={text(lang, 'errorRetry')} onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>{text(lang, 'errorRetry')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  card: { width: '100%', maxWidth: 480, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.xl, gap: space.md },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  dev: { fontSize: 12, color: colors.muted },
  button: { minHeight: hit, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  buttonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
});
