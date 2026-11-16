import { router } from 'expo-router';
import React, { createContext, useContext, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme-context';
import { TV_FOCUS, tvSafeInsets } from '../../lib/tv-focus';

type ScrollApi = { scrollTo: (y: number) => void; padV: number };
const ScrollCtx = createContext<ScrollApi | null>(null);

function FocusGuide({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const RN = require('react-native') as { TVFocusGuideView?: React.ComponentType<{ children?: React.ReactNode; style?: StyleProp<ViewStyle>; trapFocusUp?: boolean; trapFocusDown?: boolean; trapFocusLeft?: boolean; trapFocusRight?: boolean }> };
  if (Platform.isTV && RN.TVFocusGuideView) {
    const Guide = RN.TVFocusGuideView;
    return (
      <Guide trapFocusLeft trapFocusRight trapFocusUp trapFocusDown style={style}>
        {children}
      </Guide>
    );
  }
  return <View style={style}>{children}</View>;
}

export function TvScreen({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const pad = tvSafeInsets(theme.width, theme.width * (9 / 16));
  return (
    <View style={{ flex: 1, backgroundColor: theme.palette.bg, paddingHorizontal: pad.horizontal, paddingVertical: pad.vertical }}>
      {children}
    </View>
  );
}

export function TvScroll({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const ref = useRef<{ scrollTo: (options: { y: number; animated?: boolean }) => void } | null>(null);
  const pad = tvSafeInsets(theme.width, Math.max(theme.width * 0.5625, 600));
  const api = React.useMemo<ScrollApi>(
    () => ({
      padV: pad.vertical,
      scrollTo(y: number) {
        ref.current?.scrollTo({ y: Math.max(0, y - pad.vertical), animated: !theme.reduceMotion });
      },
    }),
    [pad.vertical, theme.reduceMotion],
  );
  return (
    <ScrollCtx.Provider value={api}>
      <ScrollView
        ref={ref as never}
        style={{ flex: 1, backgroundColor: theme.palette.bg }}
        contentContainerStyle={{
          paddingHorizontal: pad.horizontal,
          paddingTop: pad.vertical,
          paddingBottom: pad.vertical + 48,
          gap: 28,
        }}
      >
        {children}
      </ScrollView>
    </ScrollCtx.Provider>
  );
}

export function TvTitle({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <TextBlock size={56} weight="800" color={theme.palette.text}>{children}</TextBlock>;
}

export function TvBody({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <TextBlock size={28} weight="400" color={theme.palette.text} line={40}>{children}</TextBlock>;
}

export function TvMuted({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <TextBlock size={22} weight="500" color={theme.palette.muted} line={32}>{children}</TextBlock>;
}

function TextBlock({
  children,
  size,
  weight,
  color,
  line,
}: {
  children: React.ReactNode;
  size: number;
  weight: '400' | '500' | '700' | '800';
  color: string;
  line?: number;
}) {
  return <Text style={{ color, fontSize: size, lineHeight: line ?? Math.round(size * 1.25), fontWeight: weight }}>{children}</Text>;
}

/**
 * Seule enveloppe focusable du salon. Le repos est plus sombre ;
 * le focus est un aplat clair, un bord épais, un léger agrandissement et un halo.
 */
export function TvFocusable({
  label,
  onPress,
  preferred,
  children,
  style,
}: {
  label: string;
  onPress?: () => void;
  preferred?: boolean;
  children: React.ReactNode | ((focused: boolean) => React.ReactNode);
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const scroll = useContext(ScrollCtx);
  const [focused, setFocused] = useState(false);
  const y = useRef(0);
  const scale = focused && !theme.reduceMotion ? TV_FOCUS.scale : 1;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      hasTVPreferredFocus={preferred}
      onLayout={(event) => {
        y.current = event.nativeEvent.layout.y;
      }}
      onFocus={() => {
        setFocused(true);
        scroll?.scrollTo(y.current);
      }}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={[
        {
          opacity: focused ? 1 : TV_FOCUS.unfocusedOpacity,
          transform: [{ scale }],
          borderWidth: TV_FOCUS.borderWidth,
          borderColor: focused ? '#FFFFFF' : theme.palette.border,
          backgroundColor: focused ? theme.palette.primarySoft : theme.palette.surface,
          borderRadius: 28,
          paddingHorizontal: 28,
          paddingVertical: 22,
          minHeight: 96,
          justifyContent: 'center',
          shadowColor: '#FFFFFF',
          shadowOpacity: focused ? 0.85 : 0,
          shadowRadius: focused ? TV_FOCUS.glowRadius : 0,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    >
      {typeof children === 'function' ? children(focused) : children}
    </Pressable>
  );
}

export function TvButton({
  label,
  hint,
  onPress,
  preferred,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
  preferred?: boolean;
}) {
  const theme = useTheme();
  return (
    <TvFocusable label={hint ? `${label}. ${hint}` : label} onPress={onPress} preferred={preferred}>
      {(focused) => (
        <>
          <TextBlock size={32} weight="800" color={focused ? theme.palette.primaryText : theme.palette.text}>
            {label}
          </TextBlock>
          {hint ? (
            <TextBlock size={20} weight="500" color={theme.palette.muted} line={28}>
              {hint}
            </TextBlock>
          ) : null}
        </>
      )}
    </TvFocusable>
  );
}

export function TvBack({ preferred }: { preferred?: boolean }) {
  return <TvButton label="Retour" onPress={() => router.back()} preferred={preferred} />;
}

export function TvRow({ children }: { children: React.ReactNode }) {
  return (
    <FocusGuide style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
      {children}
    </FocusGuide>
  );
}

