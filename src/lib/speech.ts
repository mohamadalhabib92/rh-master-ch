import { Platform } from 'react-native';
import { appStore } from './store';

export function speakText(text: string) {
  if (Platform.isTV) return;
  const rate = appStore.get().learn?.settings.speechRate ?? 0.95;
  const lang = appStore.get().lang === 'de' ? 'de-CH' : 'fr-CH';
  void import('expo-speech')
    .then((Speech) => {
      Speech.stop();
      Speech.speak(text, { language: lang, rate });
    })
    .catch(() => undefined);
}

export function stopSpeech() {
  if (Platform.isTV) return;
  void import('expo-speech')
    .then((Speech) => Speech.stop())
    .catch(() => undefined);
}
