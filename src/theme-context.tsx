import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, useWindowDimensions } from 'react-native';
import { appStore } from './lib/store';
import { columnCount, contentMaxWidth, motion, paletteFor, radius, space, type, type Palette } from './theme';

export type Theme = {
  palette: Palette;
  dark: boolean;
  contrast: 'default' | 'high';
  reduceMotion: boolean;
  dyslexia: boolean;
  space: typeof space;
  radius: typeof radius;
  type: typeof type;
  motion: typeof motion;
  maxWidth: number;
  columns: 1 | 2;
  width: number;
  fontFamily?: string;
  bodyLine: number;
  letterSpacing: number;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = appStore.useStore().learn.settings;
  const { width } = useWindowDimensions();
  const [osReduce, setOsReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    let sub: { remove?: () => void } | undefined;
    try {
      void Promise.resolve(AccessibilityInfo.isReduceMotionEnabled())
        .then((value) => {
          if (alive) setOsReduce(Boolean(value));
        })
        .catch(() => undefined);
      sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => setOsReduce(Boolean(value)));
    } catch {
      // Réglage indisponible.
    }
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  const value = useMemo<Theme>(() => {
    const dyslexia = settings.dyslexiaFont;
    return {
      palette: paletteFor(settings.dark, settings.contrast),
      dark: settings.dark,
      contrast: settings.contrast,
      reduceMotion: settings.reduceMotion || osReduce,
      dyslexia,
      space,
      radius,
      type,
      motion,
      maxWidth: contentMaxWidth(width),
      columns: columnCount(width),
      width,
      fontFamily: dyslexia && Platform.OS === 'web' ? 'Verdana, Geneva, sans-serif' : undefined,
      bodyLine: dyslexia ? 28 : type.body.lineHeight,
      letterSpacing: dyslexia ? 0.4 : 0,
    };
  }, [osReduce, settings.contrast, settings.dark, settings.dyslexiaFont, settings.reduceMotion, width]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme hors ThemeProvider');
  return value;
}
