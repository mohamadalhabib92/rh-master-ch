import React, { useState } from 'react';
import { Platform, Share, TextInput } from 'react-native';
import { planRestore } from '../lib/progress-export';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';
import { colors, radius } from '../theme';
import { Body, Button, Card, H3, Muted } from './ui';

function download(name: string, text: string) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return;
  }
  void Share.share({ message: text });
}

/** Export et restauration explicites. Le JSON n'est pas rendu à l'écran. */
export function HealthyBackup() {
  const { t } = useI18n();
  const status = appStore.useDataStatus();
  const healthy = status.healthy;
  const [hint, setHint] = useState<string | null>(null);
  const [paste, setPaste] = useState('');
  const [checked, setChecked] = useState<{ m: number; c: number; e: number } | null>(null);
  const counts = (m: number, c: number, e: number, fp: string) => t('backupCounts', { fp, m, c, e });

  return (
    <Card>
      <H3>{t('backupTitle')}</H3>
      {healthy ? (
        <>
          <Muted>{counts(healthy.counts.modules, healthy.counts.correctIds, healthy.counts.mistakeIds, healthy.sha256.slice(0, 12))}</Muted>
          <Button
            label={t('backupExport')}
            variant="secondary"
            onPress={() => {
              const envelope = appStore.getHealthyExport();
              if (!envelope) return;
              download('rhmaster-sauvegarde.json', JSON.stringify(envelope));
              setHint(t('backupExportDone'));
            }}
            style={{ alignSelf: 'flex-start' }}
          />
          {healthy.sideReady ? (
            <Button
              label={t('backupRollback')}
              variant="ghost"
              onPress={() => {
                void appStore.restoreSideCopy().then((result) => {
                  setHint(result === 'restored' ? t('backupRollbackDone') : t('backupBad'));
                });
              }}
              style={{ alignSelf: 'flex-start' }}
            />
          ) : null}
        </>
      ) : null}
      <TextInput
        value={paste}
        onChangeText={(value) => {
          setPaste(value);
          setChecked(null);
        }}
        placeholder={t('backupPaste')}
        placeholderTextColor={colors.muted}
        accessibilityLabel={t('backupPaste')}
        autoCorrect={false}
        style={{ minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, color: colors.text }}
      />
      <Button
        label={t('backupCheck')}
        variant="secondary"
        onPress={() => {
          let parsed: unknown = null;
          try {
            parsed = JSON.parse(paste);
          } catch {
            parsed = null;
          }
          const plan = planRestore(parsed);
          if (!plan.ok) {
            setChecked(null);
            setHint(t('backupBad'));
            return;
          }
          setChecked({ m: plan.counts.modules, c: plan.counts.correctIds, e: plan.counts.mistakeIds });
          setHint(t('backupChecked', { m: plan.counts.modules, c: plan.counts.correctIds, e: plan.counts.mistakeIds }));
        }}
        style={{ alignSelf: 'flex-start' }}
      />
      {checked ? (
        <Button
          label={t('backupApply')}
          onPress={() => {
            let parsed: unknown = null;
            try {
              parsed = JSON.parse(paste);
            } catch {
              parsed = null;
            }
            void appStore.applyVerifiedRestore(parsed).then((result) => {
              setHint(result === 'restored' ? t('backupRollbackDone') : t('backupBad'));
              if (result === 'restored') setPaste('');
            });
          }}
          style={{ alignSelf: 'flex-start' }}
        />
      ) : null}
      {hint ? <Body>{hint}</Body> : null}
    </Card>
  );
}
