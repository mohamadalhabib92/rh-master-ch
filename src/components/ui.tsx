import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme-context';
import { hit, space as spaceScale } from '../theme';
import { useMacItem, useMacScroll } from './MacBridge';

export function Screen({
  children,
  scroll = true,
  style,
  contentStyle,
  dir,
  calm,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  dir?: 'ltr' | 'rtl';
  calm?: boolean;
}) {
  const theme = useTheme();
  const scroller = useRef<{ scrollTo: (options: { y: number; animated?: boolean }) => void } | null>(null);
  const scrollTo = React.useCallback(
    (y: number) => scroller.current?.scrollTo({ y: Math.max(0, y - 40), animated: !theme.reduceMotion }),
    [theme.reduceMotion],
  );
  useMacScroll(scrollTo);
  const inner = scroll ? (
    <ScrollView ref={scroller as never} contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled">
      <View style={[styles.maxWidth, { maxWidth: theme.maxWidth, gap: theme.space.md }]}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }, contentStyle]}>
      <View style={[styles.maxWidth, { flex: 1, maxWidth: theme.maxWidth, gap: theme.space.md }]}>{children}</View>
    </View>
  );
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, { backgroundColor: calm ? theme.palette.bgElevated : theme.palette.bg }, dir ? { direction: dir } : null, style]}
    >
      {inner}
    </SafeAreaView>
  );
}

type TProps = TextProps & { color?: string; center?: boolean };
function useTextStyle(base: TextStyle): TextStyle {
  const theme = useTheme();
  return {
    ...base,
    color: theme.palette.text,
    fontFamily: theme.fontFamily,
    letterSpacing: (base.letterSpacing ?? 0) + (theme.dyslexia && base.fontSize && base.fontSize >= 16 ? theme.letterSpacing : 0),
  };
}

export function H1({ style, color, center, ...p }: TProps) {
  const theme = useTheme();
  const base = useTextStyle(theme.type.h1);
  return <Text {...p} style={[base, color ? { color } : null, center ? { textAlign: 'center' } : null, style]} />;
}
export function H2({ style, color, center, ...p }: TProps) {
  const theme = useTheme();
  const base = useTextStyle(theme.type.h2);
  return <Text {...p} style={[base, color ? { color } : null, center ? { textAlign: 'center' } : null, style]} />;
}
export function H3({ style, color, center, ...p }: TProps) {
  const theme = useTheme();
  const base = useTextStyle(theme.type.h3);
  return <Text {...p} style={[base, color ? { color } : null, center ? { textAlign: 'center' } : null, style]} />;
}
export function Body({ style, color, center, ...p }: TProps) {
  const theme = useTheme();
  const base = useTextStyle({ ...theme.type.body, lineHeight: theme.bodyLine });
  return <Text {...p} style={[base, color ? { color } : null, center ? { textAlign: 'center' } : null, style]} />;
}
export function Muted({ style, color, center, ...p }: TProps) {
  const theme = useTheme();
  const base = useTextStyle({ ...theme.type.small, color: theme.palette.muted, lineHeight: theme.dyslexia ? 22 : theme.type.small.lineHeight });
  return <Text {...p} style={[base, color ? { color } : null, center ? { textAlign: 'center' } : null, style]} />;
}

export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const macItem = useMacItem(!!onPress && theme.mac);
  macItem.setPress(onPress);
  const [hover, setHover] = useState(false);
  const cardStyle = {
    backgroundColor: theme.palette.surface,
    borderRadius: theme.radius.lg,
    borderColor: theme.palette.border,
    shadowColor: theme.palette.shadow,
    shadowOpacity: theme.dark ? 0.4 : 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  };
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onHoverIn={theme.mac ? () => setHover(true) : undefined}
        onHoverOut={theme.mac ? () => setHover(false) : undefined}
        onLayout={(event) => macItem.onLayout(event.nativeEvent.layout.y)}
        style={({ pressed }) => [
          styles.card,
          cardStyle,
          pressed && !theme.reduceMotion ? { opacity: 0.94, transform: [{ scale: 0.985 }] } : null,
          theme.mac && hover && !macItem.focused ? { borderColor: theme.palette.accent, shadowOpacity: 0.2 } : null,
          macItem.focused ? { borderColor: theme.palette.accent, borderWidth: 3, shadowColor: theme.palette.accent, shadowOpacity: 0.45, shadowRadius: 12 } : null,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, cardStyle, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const theme = useTheme();
  const macItem = useMacItem(!!onPress && !disabled && theme.mac);
  macItem.setPress(onPress);
  const [hover, setHover] = useState(false);
  const bg =
    variant === 'primary' ? theme.palette.primary : variant === 'secondary' ? theme.palette.primarySoft : variant === 'danger' ? theme.palette.danger : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? theme.palette.onPrimary : theme.palette.primaryText;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={theme.mac ? () => setHover(true) : undefined}
      onHoverOut={theme.mac ? () => setHover(false) : undefined}
      onLayout={(event) => macItem.onLayout(event.nativeEvent.layout.y)}
      style={({ pressed }) => [
        styles.button,
        small && { paddingHorizontal: theme.space.md, minHeight: 44 },
        {
          backgroundColor: bg,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.45 : pressed ? 0.9 : theme.mac && hover ? 0.88 : 1,
          transform: pressed && !theme.reduceMotion && !disabled ? [{ scale: 0.985 }] : undefined,
        },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.palette.border },
        macItem.focused ? { borderWidth: 3, borderColor: '#FFFFFF' } : null,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, { color: fg, fontFamily: theme.fontFamily }, small && { fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, onLongPress }: { label: string; active?: boolean; onPress?: () => void; onLongPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: active ? theme.palette.primary : theme.palette.border,
          backgroundColor: active ? theme.palette.primary : theme.palette.surface,
          transform: pressed && !theme.reduceMotion ? [{ scale: 0.98 }] : undefined,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? theme.palette.onPrimary : theme.palette.text, fontFamily: theme.fontFamily }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'warn' | 'ok' | 'info' }) {
  const theme = useTheme();
  const map = {
    neutral: [theme.palette.surfaceAlt, theme.palette.muted],
    warn: [theme.palette.warnBg, theme.palette.warnText],
    ok: [theme.palette.okSoft, theme.palette.ok],
    info: [theme.palette.accentSoft, theme.palette.accent],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({
  value,
  color,
  height = 8,
  label,
}: {
  value: number;
  color?: string;
  height?: number;
  label?: string;
}) {
  const theme = useTheme();
  const v = Math.max(0, Math.min(1, value || 0));
  const width = useRef(new Animated.Value(v)).current;
  useEffect(() => {
    if (theme.reduceMotion) {
      width.setValue(v);
      return;
    }
    Animated.timing(width, { toValue: v, duration: theme.motion.base, useNativeDriver: false }).start();
  }, [theme.motion.base, theme.reduceMotion, v, width]);
  const animated = width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      style={{ height, borderRadius: height, backgroundColor: theme.palette.surfaceAlt, overflow: 'hidden' }}
    >
      <Animated.View style={{ width: animated, height, backgroundColor: color ?? theme.palette.primary, borderRadius: height }} />
    </View>
  );
}

export function IconTile({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: theme.radius.md,
        backgroundColor: theme.palette.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

/** Deux colonnes à partir de 900 px, une seule en dessous. */
export function Cluster({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={{ flexDirection: theme.columns === 2 ? 'row' : 'column', flexWrap: 'wrap', gap: theme.space.md }}>{children}</View>;
}

export function ClusterItem({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={{ width: theme.columns === 2 ? '48%' : '100%', flexGrow: 0 }}>{children}</View>;
}

export function Slider({
  value,
  min = 0,
  max = 1,
  step = 0,
  onChange,
  onComplete,
  accessibilityLabel,
  rtl,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (v: number) => void;
  onComplete?: (v: number) => void;
  accessibilityLabel?: string;
  rtl?: boolean;
}) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const last = useRef(value);
  const range = max - min || 1;
  const ratio = Math.max(0, Math.min(1, (value - min) / range));
  const compute = (e: GestureResponderEvent) => {
    if (!width) return value;
    let r = Math.max(0, Math.min(1, e.nativeEvent.locationX / width));
    if (rtl) r = 1 - r;
    let v = min + r * range;
    if (step) v = Math.round(v / step) * step;
    last.current = v;
    return v;
  };
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: Math.round(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        const d = (step || range / 20) * (e.nativeEvent.actionName === 'increment' ? 1 : -1);
        const v = Math.max(min, Math.min(max, value + d));
        onChange?.(v);
        onComplete?.(v);
      }}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => onChange?.(compute(e))}
      onResponderMove={(e) => onChange?.(compute(e))}
      onResponderRelease={() => onComplete?.(last.current)}
      style={styles.sliderHit}
    >
      <View pointerEvents="none" style={[styles.sliderTrack, { backgroundColor: theme.palette.surfaceAlt }]}>
        <View style={[styles.sliderFill, { width: `${ratio * 100}%`, backgroundColor: theme.palette.primary }, rtl ? { right: 0 } : { left: 0 }]} />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.sliderThumb,
          { backgroundColor: theme.palette.surface, borderColor: theme.palette.primary },
          rtl ? { right: `${ratio * 100}%`, marginRight: -11 } : { left: `${ratio * 100}%`, marginLeft: -11 },
        ]}
      />
    </View>
  );
}

export function Skeleton({ height = 18, width = '100%', style }: { height?: number; width?: number | `${number}%`; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const a = useRef(new Animated.Value(0.55)).current;
  const [reduced, setReduced] = useState(theme.reduceMotion);
  useEffect(() => {
    let alive = true;
    let sub: { remove?: () => void } | undefined;
    try {
      void Promise.resolve(AccessibilityInfo.isReduceMotionEnabled())
        .then((value) => {
          if (alive) setReduced(Boolean(value) || theme.reduceMotion);
        })
        .catch(() => undefined);
      sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => setReduced(Boolean(value) || theme.reduceMotion));
    } catch {
      // Réglage indisponible.
    }
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, [theme.reduceMotion]);
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(a, { toValue: 0.55, duration: 700, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [a, reduced]);
  return <Animated.View style={[{ height, width, borderRadius: 12, backgroundColor: theme.palette.surfaceAlt, opacity: reduced ? 1 : a }, style]} />;
}

export function EmptyState({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.empty, { backgroundColor: theme.palette.surface, borderRadius: theme.radius.lg, borderColor: theme.palette.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.palette.accentSoft }]}>{icon}</View>
      <H3 center>{title}</H3>
      {text ? <Muted center>{text}</Muted> : null}
      {action}
    </View>
  );
}

export function Row({ children, style, gap = spaceScale.sm }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Spacer({ h = spaceScale.md }: { h?: number }) {
  return <View style={{ height: h }} />;
}

export function BootScreen({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View accessibilityLabel={label} style={[styles.screen, { backgroundColor: theme.palette.bg, alignItems: 'center', justifyContent: 'center', gap: 12, padding: spaceScale.lg }]}>
      <Skeleton height={132} />
      <Skeleton height={44} width="70%" />
      <Skeleton height={84} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spaceScale.lg, paddingBottom: 56, alignItems: 'center' },
  maxWidth: { width: '100%' },
  card: { padding: spaceScale.lg, borderWidth: StyleSheet.hairlineWidth, gap: spaceScale.sm },
  button: { minHeight: hit, paddingHorizontal: spaceScale.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: { minHeight: hit, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  chipText: { fontSize: 13, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  sliderHit: { height: 48, justifyContent: 'center' },
  sliderTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  sliderFill: { position: 'absolute', top: 0, bottom: 0 },
  sliderThumb: { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 36, paddingHorizontal: 20, borderWidth: StyleSheet.hairlineWidth },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
