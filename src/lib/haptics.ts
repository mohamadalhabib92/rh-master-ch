import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { appStore } from './store';

async function pulse(kind: 'select' | 'success' | 'warn') {
  const settings = appStore.get().learn?.settings;
  if (!settings?.haptics || settings.reduceMotion || settings.celebrations === 'off') return;
  if (Platform.OS === 'web') return;
  try {
    if (kind === 'success') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'warn') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else await Haptics.selectionAsync();
  } catch {
    // Appareil sans vibreur.
  }
}

export function hapticSelect() {
  void pulse('select');
}
export function hapticSuccess() {
  void pulse('success');
}
export function hapticWarn() {
  void pulse('warn');
}
