import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../theme-context';
import { Body } from './ui';

export function BackBar({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 }}
    >
      <Ionicons name="chevron-back" size={22} color={theme.palette.primaryText} />
      <Body color={theme.palette.primaryText} style={{ fontWeight: '600' }}>{label}</Body>
    </Pressable>
  );
}
