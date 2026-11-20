/**
 * Focus du salon. Un seul jeu de valeurs, lu par l’enveloppe TvFocusable
 * et par le test qui empêche un focus invisible.
 */
export const TV_FOCUS = {
  scale: 1.08,
  borderWidth: 6,
  unfocusedOpacity: 0.62,
  glowRadius: 28,
} as const;

/** Marges sûres à 1920×1080. Elles se mettent à l’échelle si le téléviseur est autre. */
export const TV_SAFE = {
  horizontal: 90,
  vertical: 60,
  referenceWidth: 1920,
  referenceHeight: 1080,
} as const;

export function tvSafeInsets(width: number, height: number) {
  const w = width > 0 ? width : TV_SAFE.referenceWidth;
  const h = height > 0 ? height : TV_SAFE.referenceHeight;
  return {
    horizontal: Math.round((TV_SAFE.horizontal * w) / TV_SAFE.referenceWidth),
    vertical: Math.round((TV_SAFE.vertical * h) / TV_SAFE.referenceHeight),
  };
}
