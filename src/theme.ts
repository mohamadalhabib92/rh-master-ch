/**
 * Jetons du design system. Les écrans lisent la palette via useTheme(),
 * pas ces constantes figées, sauf repli hors provider.
 */
import { layoutForWidth } from './lib/mac-layout';

export type Palette = {
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  ok: string;
  okSoft: string;
  warnBg: string;
  warnText: string;
  highlight: string;
  shadow: string;
  heroStart: string;
  heroEnd: string;
};

export const lightPalette: Palette = {
  bg: '#F3F0EA',
  bgElevated: '#F7F5F1',
  surface: '#FFFcf8',
  surfaceAlt: '#E8E2D8',
  text: '#1A1D23',
  muted: '#5C6570',
  border: '#E3DDD4',
  primary: '#9F1D32',
  primaryText: '#8E1528',
  primarySoft: '#F8E6EA',
  onPrimary: '#FFFFFF',
  accent: '#1F4B6E',
  accentSoft: '#E4EEF5',
  danger: '#9C2B24',
  dangerSoft: '#F8E4E2',
  ok: '#1F7A4D',
  okSoft: '#E3F4EB',
  warnBg: '#F8EFD6',
  warnText: '#6B4E12',
  highlight: '#F3D56A',
  shadow: 'rgba(26, 29, 35, 0.08)',
  heroStart: '#8E1528',
  heroEnd: '#1F4B6E',
};

export const darkPalette: Palette = {
  bg: '#101418',
  bgElevated: '#161C24',
  surface: '#1B232D',
  surfaceAlt: '#263140',
  text: '#F4F0E8',
  muted: '#A8B3BF',
  border: '#314052',
  primary: '#F07184',
  primaryText: '#FFB3BE',
  primarySoft: '#3A2430',
  onPrimary: '#1A0C10',
  accent: '#9CC4E4',
  accentSoft: '#1C3346',
  danger: '#FF8E86',
  dangerSoft: '#3A2224',
  ok: '#8ED4AE',
  okSoft: '#173226',
  warnBg: '#3A311C',
  warnText: '#F0D48A',
  highlight: '#8A6A20',
  shadow: 'rgba(0, 0, 0, 0.35)',
  heroStart: '#6E1224',
  heroEnd: '#16324A',
};

export const lightHigh: Palette = {
  ...lightPalette,
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  muted: '#1A1A1A',
  border: '#000000',
  primary: '#7A0018',
  primaryText: '#7A0018',
  accent: '#00264D',
};

export const darkHigh: Palette = {
  ...darkPalette,
  bg: '#000000',
  surface: '#000000',
  text: '#FFFFFF',
  muted: '#F2F2F2',
  border: '#FFFFFF',
  primary: '#FFD0D6',
  primaryText: '#FFD0D6',
  accent: '#D6ECFF',
};

/** Repli clair pour les rares styles encore statiques. */
export const colors = lightPalette;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 12, md: 16, lg: 24, pill: 999 };
export const hit = 48;
export const icon = { sm: 18, md: 22, lg: 28 };

export const type = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800' as const, letterSpacing: -0.6 },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 17, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
};

export const macType = {
  display: { fontSize: 40, lineHeight: 48, fontWeight: '800' as const, letterSpacing: -0.6 },
  h1: { fontSize: 34, lineHeight: 42, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
  body: { fontSize: 18, lineHeight: 28, fontWeight: '400' as const },
  small: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
};

export const motion = { fast: 160, base: 240, slow: 420 };

export function paletteFor(dark: boolean, contrast: 'default' | 'high'): Palette {
  if (dark && contrast === 'high') return darkHigh;
  if (dark) return darkPalette;
  if (contrast === 'high') return lightHigh;
  return lightPalette;
}

export function contentMaxWidth(width: number): number {
  return layoutForWidth(width).maxWidth;
}

export function columnCount(width: number): 1 | 2 {
  return layoutForWidth(width).columns;
}

export function sidebarFor(width: number): boolean {
  return layoutForWidth(width).sidebar;
}
