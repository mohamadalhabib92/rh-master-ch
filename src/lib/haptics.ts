import { Platform } from 'react-native';
import { allowsHaptics } from './mac-layout';
import { isMacApp } from './mac-runtime';
import { appStore } from './store';

async function pulse(kind: 'select' | 'success' | 'warn') {
  if (!allowsHaptics({ tv: Platform.isTV, mac: isMacApp() })) return;
  const settings = appStore.get().learn?.settings;
  if (!settings?.haptics || settings.reduceMotion || settings.celebrations === 'off') return;
  if (Platform.OS === 'web') return;
  try {
    const Haptics = await import('expo-haptics');
    if (kind === 'success') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'warn') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else await Haptics.selectionAsync();
  } catch {
    // Appareil sans vibreur, ou module absent (Apple TV).
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
