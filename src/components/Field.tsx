import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme-context';

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
  const theme = useTheme();
  return (
    <View style={{ gap: 4, flexGrow: 1, flexBasis: 220 }}>
      <Text style={[styles.label, { color: theme.palette.text }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        placeholder={placeholder}
        placeholderTextColor={theme.palette.muted}
        style={[styles.input, { color: theme.palette.text, borderColor: error ? theme.palette.danger : theme.palette.border, backgroundColor: theme.palette.surface, borderRadius: theme.radius.md }]}
      />
      {error ? <Text style={[styles.err, { color: theme.palette.danger }]}>{error}</Text> : hint ? <Text style={[styles.hint, { color: theme.palette.warnText }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600' },
  input: { minHeight: 48, borderWidth: 1, paddingHorizontal: 12, fontSize: 16 },
  err: { fontSize: 12 },
  hint: { fontSize: 12 },
});
