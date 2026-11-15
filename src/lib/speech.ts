import * as Speech from 'expo-speech';
import { appStore } from './store';

export function speakText(text: string) {
  const rate = appStore.get().learn?.settings.speechRate ?? 0.95;
  const lang = appStore.get().lang === 'de' ? 'de-CH' : 'fr-CH';
  try {
    Speech.stop();
    Speech.speak(text, { language: lang, rate });
  } catch {
    // Synthèse indisponible.
  }
}

export function stopSpeech() {
  try {
    Speech.stop();
  } catch {
    // Déjà arrêté.
  }
}
