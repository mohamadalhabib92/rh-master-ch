import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { colors } from '../theme';
import { Body } from './ui';

export function BackBar({ label }: { label: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 }}>
      <Ionicons name="chevron-back" size={20} color={colors.primaryText} />
      <Body color={colors.primaryText} style={{ fontWeight: '600' }}>{label}</Body>
    </Pressable>
  );
}
