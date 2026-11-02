import React, { useState } from 'react';
import { Platform, Share } from 'react-native';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';
import { Button, Card, H3, Muted } from './ui';

/** Avertissement si la sauvegarde locale est illisible. N'écrit rien. */
export function RawBackupNotice() {
  const { t } = useI18n();
  const status = appStore.useDataStatus();
  const [hint, setHint] = useState<string | null>(null);
  if (!status.unreadable || status.rawBackup == null) return null;
  const raw = status.rawBackup;

  const exportRaw = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([raw], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'rhmaster-brut.txt';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setHint(t('exportRawDone'));
      return;
    }
    Share.share({ message: raw })
      .then(() => setHint(t('exportRawDone')))
      .catch(() => setHint(null));
  };

  return (
    <Card>
      <H3>{t('unreadableTitle')}</H3>
      <Muted>{t('unreadableText')}</Muted>
      <Button label={t('exportRaw')} onPress={exportRaw} style={{ alignSelf: 'flex-start' }} />
      {hint ? <Muted>{hint}</Muted> : null}
    </Card>
  );
}
