import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../theme';

export function Field({
  label,
  value,
  onChange,
  error,
  hint,
  keyboard = 'decimal-pad',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  hint?: string;
  keyboard?: 'decimal-pad' | 'default' | 'numbers-and-punctuation';
  placeholder?: string;
}) {
  return (
    <View style={{ gap: 4, flexGrow: 1, flexBasis: 220 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, error ? { borderColor: colors.danger } : null]}
      />
      {error ? <Text style={styles.err}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  input: { minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 12, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  err: { fontSize: 12, color: colors.danger },
  hint: { fontSize: 11.5, color: '#8A5A00' },
});
