import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme-context';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function Highlight({ text, query, style, color }: { text: string; query?: string; style?: StyleProp<TextStyle>; color?: string }) {
  const theme = useTheme();
  const q = (query ?? '').trim();
  const markBg = color ?? (theme.dark ? '#E6C56A' : theme.palette.highlight);
  if (q.length < 2) return <Text allowFontScaling style={style}>{text}</Text>;
  const parts = text.split(new RegExp(`(${escape(q)})`, 'gi'));
  return (
    <Text allowFontScaling style={style}>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <Text key={i} style={{ backgroundColor: markBg, color: '#1A1408', fontWeight: '700' }}>
            {p}
          </Text>
        ) : (
          <Text key={i}>{p}</Text>
        ),
      )}
    </Text>
  );
}
