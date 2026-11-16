/** Mise en page large. L’iPhone portrait (< 760 pt) reste une colonne de 720. */

export type MacLayout = {
  maxWidth: number;
  columns: 1 | 2;
  sidebar: boolean;
};

export function layoutForWidth(width: number): MacLayout {
  if (width >= 1100) return { maxWidth: 1040, columns: 2, sidebar: true };
  if (width >= 1000) return { maxWidth: 980, columns: 2, sidebar: true };
  if (width >= 900) return { maxWidth: 980, columns: 2, sidebar: false };
  return { maxWidth: 720, columns: 1, sidebar: false };
}

export type DeviceFlags = { tv: boolean; mac: boolean };

/** Vibrations, appareil photo et notifications n’existent pas de façon fiable sur le Mac ni la télé. */
export function allowsHaptics(flags: DeviceFlags): boolean {
  return !flags.tv && !flags.mac;
}

export function allowsCamera(flags: DeviceFlags): boolean {
  return !flags.tv && !flags.mac;
}

export function allowsNotifications(flags: DeviceFlags): boolean {
  return !flags.tv && !flags.mac;
}
