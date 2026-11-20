import assert from 'node:assert/strict';
import { test } from 'node:test';
import { darkPalette, glassFor, hit, lightPalette } from './theme.ts';

function channel(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: [number, number, number]): number {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const left = luminance(a);
  const right = luminance(b);
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);
  return (lighter + 0.05) / (darker + 0.05);
}

function hex(value: string): [number, number, number] {
  return [parseInt(value.slice(1, 3), 16), parseInt(value.slice(3, 5), 16), parseInt(value.slice(5, 7), 16)];
}

function rgba(value: string): { rgb: [number, number, number]; a: number } {
  const match = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/);
  assert.ok(match, value);
  return { rgb: [Number(match[1]), Number(match[2]), Number(match[3])], a: Number(match[4]) };
}

function over(fg: { rgb: [number, number, number]; a: number }, bg: [number, number, number]): [number, number, number] {
  return [
    Math.round(fg.rgb[0] * fg.a + bg[0] * (1 - fg.a)),
    Math.round(fg.rgb[1] * fg.a + bg[1] * (1 - fg.a)),
    Math.round(fg.rgb[2] * fg.a + bg[2] * (1 - fg.a)),
  ];
}

test('verre stays translucent in both themes and opaque when asked', () => {
  assert.equal(glassFor(lightPalette, 'light').translucent, true);
  assert.equal(glassFor(darkPalette, 'dark').translucent, true);
  assert.equal(glassFor(lightPalette, 'solid').translucent, false);
  assert.equal(glassFor(lightPalette, 'solid').surface, lightPalette.surface);
  assert.ok(hit >= 44);
});

test('text on verre clears AA, including over the color wash', () => {
  for (const [palette, mode, text, muted] of [
    [lightPalette, 'light' as const, lightPalette.text, lightPalette.muted],
    [darkPalette, 'dark' as const, darkPalette.text, darkPalette.muted],
  ]) {
    const glass = glassFor(palette, mode);
    const canvas = hex(palette.bg);
    const wash = over(rgba(glass.washA), canvas);
    const onWash = over(rgba(glass.surface), wash);
    const onCanvas = over(rgba(glass.surface), canvas);
    assert.ok(contrast(hex(text), onWash) >= 4.5, `${mode} text on wash`);
    assert.ok(contrast(hex(muted), onWash) >= 4.5, `${mode} muted on wash`);
    assert.ok(contrast(hex(text), onCanvas) >= 4.5, `${mode} text on canvas`);
    assert.ok(contrast(hex(muted), canvas) >= 4.5, `${mode} muted on canvas`);
  }
  assert.ok(contrast(hex('#FFFFFF'), hex(lightPalette.primary)) >= 4.5);
  assert.ok(contrast(hex(darkPalette.onPrimary), hex(darkPalette.primary)) >= 4.5);
  assert.ok(contrast(hex('#FFFFFF'), hex(lightPalette.heroStart)) >= 4.5);
});
