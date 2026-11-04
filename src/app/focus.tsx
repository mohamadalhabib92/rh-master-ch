import React from 'react';
import { FocusScreen } from '../components/FocusScreen';
import { MODULES } from '../data/modules';
import { useI18n } from '../lib/i18n';
import { appStore } from '../lib/store';

/** Mode Focus (≥ 10 min) : le module en cours continue dans la séance. */
export default function Focus() {
  const { t } = useI18n();
  const s = appStore.useStore();
  const next = MODULES.find((m) => m.id === s.lastModule) ?? MODULES.find((m) => (s.progress[m.id]?.correct.length ?? 0) < m.questions.length) ?? MODULES[0];
  return (
    <FocusScreen
      focusName={t('focusNameStudy')}
      activities={[
        { id: 'module', label: t('focusActModule'), icon: 'book-outline', href: `/module/${next.id}` },
        { id: 'glossary', label: t('focusActGlossary'), icon: 'list-outline', href: '/glossary' },
        { id: 'stay', label: t('focusActStay'), icon: 'leaf-outline' },
      ]}
    />
  );
}
