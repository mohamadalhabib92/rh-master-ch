import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, useWindowDimensions } from 'react-native';
import { appStore } from './lib/store';
import { columnCount, contentMaxWidth, glassFor, macType, motion, paletteFor, radius, sidebarFor, space, type as phoneType, type Glass, type Palette } from './theme';
import { isMacApp } from './lib/mac-runtime';

export type Theme = {
  palette: Palette;
  glass: Glass;
  dark: boolean;
  contrast: 'default' | 'high';
  reduceMotion: boolean;
  reduceTransparency: boolean;
  tv: boolean;
  dyslexia: boolean;
  mac: boolean;
  sidebar: boolean;
  space: typeof space;
  radius: typeof radius;
  type: typeof phoneType;
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
  const [mac, setMac] = useState(false);
  const [osReduce, setOsReduce] = useState(false);
  const [osTransparency, setOsTransparency] = useState(false);
  const tv = Platform.isTV;
  useEffect(() => {
    setMac(isMacApp());
  }, []);
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
  useEffect(() => {
    let alive = true;
    let sub: { remove?: () => void } | undefined;
    const info = AccessibilityInfo as typeof AccessibilityInfo & {
      isReduceTransparencyEnabled?: () => Promise<boolean>;
    };
    try {
      if (typeof info.isReduceTransparencyEnabled === 'function') {
        void Promise.resolve(info.isReduceTransparencyEnabled())
          .then((value) => {
            if (alive) setOsTransparency(Boolean(value));
          })
          .catch(() => undefined);
      }
      sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', (value) => setOsTransparency(Boolean(value)));
    } catch {
      // Réglage indisponible (web, Android, télé).
    }
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  const value = useMemo<Theme>(() => {
    const dyslexia = settings.dyslexiaFont;
    const text = mac ? macType : phoneType;
    const palette = paletteFor(settings.dark, settings.contrast);
    const solid = settings.contrast === 'high' || osTransparency || tv;
    return {
      palette,
      glass: glassFor(palette, solid ? 'solid' : settings.dark ? 'dark' : 'light'),
      dark: settings.dark,
      contrast: settings.contrast,
      reduceMotion: settings.reduceMotion || osReduce,
      reduceTransparency: osTransparency,
      tv,
      dyslexia,
      mac,
      sidebar: sidebarFor(width),
      space,
      radius,
      type: text,
      motion,
      maxWidth: contentMaxWidth(width),
      columns: columnCount(width),
      width,
      fontFamily: dyslexia && Platform.OS === 'web' ? 'Verdana, Geneva, sans-serif' : undefined,
      bodyLine: dyslexia ? 28 : text.body.lineHeight,
      letterSpacing: dyslexia ? 0.4 : 0,
    };
  }, [mac, osReduce, osTransparency, settings.contrast, settings.dark, settings.dyslexiaFont, settings.reduceMotion, tv, width]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme hors ThemeProvider');
  return value;
}
