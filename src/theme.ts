/**
 * Tokens uniques — administration claire.
 * Palette conservée : fond #F6F5F3, texte #1C1C1E, rouge suisse #C8102E (aplats).
 * primaryText est la variante plus foncée pour le texte et les petites icônes
 * sur fond clair (AA). #C8102E sur #FFFFFF ≈ 5,9:1 ; #9E0E24 sur #FFFFFF ≈ 8,3:1
 * et sur #FBE7EA ≈ 7,0:1.
 */
export const colors = {
  bg: '#F6F5F3',
  surface: '#FFFFFF',
  surfaceAlt: '#ECE9E6',
  text: '#1C1C1E',
  muted: '#5F6368',
  border: '#E1DDD8',
  primary: '#C8102E',
  primaryText: '#9E0E24',
  primarySoft: '#FBE7EA',
  onPrimary: '#FFFFFF',
  accent: '#1F4E79',
  danger: '#B3261E',
  highlight: '#FFE27A',
  ok: '#2E7D4F',
  warnBg: '#FFF4DB',
  warnText: '#6B4700',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 18 };
/** Cible minimale WCAG 2.2 / 44 pt. */
export const hit = 44;
