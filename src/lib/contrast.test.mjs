// Contraste WCAG AA (≥ 4,5:1) des paires texte/fond réellement utilisées par l'app.
import assert from 'node:assert/strict';
import test from 'node:test';
import { colors as c } from '../theme.ts';

const lum = (h) => {
  const x = h.replace("#", "");
  const hex = x.length === 3 ? x.split("").map((c) => c + c).join("") : x;
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const PAIRS = [
  ['text', 'bg'], ['text', 'surface'], ['text', 'surfaceAlt'],
  ['muted', 'bg'], ['muted', 'surface'], ['muted', 'surfaceAlt'],
  ['onPrimary', 'primary'], ['primaryText', 'surface'], ['primaryText', 'primarySoft'], ['primaryText', 'bg'],
  ['accent', 'surface'], ['accent', 'bg'], ['danger', 'surface'], ['danger', 'bg'], ['ok', 'surface'],
  ['warnText', 'warnBg'],
];

for (const [fg, bg] of PAIRS) {
  test(`AA : ${fg} sur ${bg}`, () => {
    assert.ok(c[fg] && c[bg], `jeton manquant ${fg}/${bg}`);
    const r = ratio(c[fg], c[bg]);
    assert.ok(r >= 4.5, `${fg} (${c[fg]}) sur ${bg} (${c[bg]}) = ${r.toFixed(2)} < 4,5`);
  });
}
