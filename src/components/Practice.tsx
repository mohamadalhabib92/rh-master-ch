import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { DrillItem } from '../curriculum/types';
import { gradeItem } from '../curriculum/plan';
import { hapticSelect, hapticSuccess, hapticWarn } from '../lib/haptics';
import { useTheme } from '../theme-context';
import { Body, Button, Card, Muted } from './ui';

export function PracticeItem({
  item,
  checked,
  onAnswer,
}: {
  item: DrillItem;
  checked: boolean;
  onAnswer: (value: unknown, ok: boolean) => void;
}) {
  const theme = useTheme();
  const [given, setGiven] = useState<unknown>(item.type === 'order' ? [] : item.type === 'match' ? [] : null);
  const submit = (value: unknown) => {
    const ok = gradeItem(item, value);
    if (ok) hapticSuccess();
    else hapticWarn();
    onAnswer(value, ok);
  };
  if (item.type === 'boolean') {
    return (
      <View style={{ gap: 8 }}>
        <Body>{item.prompt}</Body>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {[true, false].map((value) => (
            <Button
              key={String(value)}
              small
              variant={given === value ? 'primary' : 'secondary'}
              label={value ? 'Vrai' : 'Faux'}
              onPress={() => {
                if (checked) return;
                hapticSelect();
                setGiven(value);
                submit(value);
              }}
            />
          ))}
        </View>
      </View>
    );
  }
  if (item.type === 'single') {
    return (
      <View style={{ gap: 8 }}>
        <Body>{item.prompt}</Body>
        {item.options.map((option, index) => {
          const selected = given === index;
          const right = checked && index === item.answer;
          const wrong = checked && selected && index !== item.answer;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityLabel={option}
              accessibilityState={{ selected, disabled: checked }}
              disabled={checked}
              onPress={() => {
                hapticSelect();
                setGiven(index);
                submit(index);
              }}
              style={{
                padding: 14,
                minHeight: 48,
                borderRadius: theme.radius.md,
                borderWidth: 1.5,
                borderTopWidth: 1,
                borderTopColor: theme.glass.highlight,
                borderColor: right ? theme.palette.ok : wrong ? theme.palette.danger : selected ? theme.palette.primary : theme.palette.border,
                backgroundColor: right ? theme.palette.okSoft : wrong ? theme.palette.dangerSoft : selected ? theme.palette.primarySoft : theme.glass.translucent ? theme.glass.surface : theme.palette.surface,
              }}
            >
              <Text allowFontScaling maxFontSizeMultiplier={3} style={{ color: theme.palette.text, fontSize: 16, lineHeight: 22, fontFamily: theme.fontFamily }}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
  if (item.type === 'order') {
    const picked = (given as string[]) ?? [];
    const remaining = item.steps.filter((step) => !picked.includes(step.id));
    return (
      <View style={{ gap: 8 }}>
        <Body>{item.prompt}</Body>
        <Muted>Touche les étapes dans l’ordre.</Muted>
        {picked.map((id, index) => (
          <Card key={id}>
            <Body>
              {index + 1}. {item.steps.find((step) => step.id === id)?.label}
            </Body>
          </Card>
        ))}
        {remaining.map((step) => (
          <Button
            key={step.id}
            variant="secondary"
            label={step.label}
            onPress={() => {
              if (checked) return;
              hapticSelect();
              const next = [...picked, step.id];
              setGiven(next);
              if (next.length === item.steps.length) submit(next);
            }}
          />
        ))}
      </View>
    );
  }
  const picked = (given as string[]) ?? [];
  const pool = [...item.pairs].filter((pair) => !picked.includes(pair.id));
  return (
    <View style={{ gap: 8 }}>
      <Body>{item.prompt}</Body>
      <Muted>Touche d’abord la gauche, puis la droite qui lui correspond. Ici, choisis les paires dans l’ordre proposé à gauche.</Muted>
      {item.pairs.map((pair) => (
        <Button
          key={pair.id}
          variant={picked.includes(pair.id) ? 'primary' : 'secondary'}
          label={`${pair.left} → ${pair.right}`}
          disabled={checked || picked.includes(pair.id)}
          onPress={() => {
            hapticSelect();
            const next = [...picked, pair.id];
            setGiven(next);
            if (next.length === item.pairs.length) submit(next);
          }}
        />
      ))}
      {pool.length === 0 ? null : <Muted>{pool.length} encore</Muted>}
    </View>
  );
}

export function Explain({ text, ok }: { text: string; ok: boolean }) {
  const theme = useTheme();
  return (
    <Card style={{ borderColor: ok ? theme.palette.ok : theme.palette.warnText, borderWidth: 1 }}>
      <Body>{ok ? 'Bien vu.' : 'Pas cette fois. L’explication reste là.'}</Body>
      <Muted>{text}</Muted>
    </Card>
  );
}
