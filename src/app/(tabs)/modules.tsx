import React from 'react';
import { DisclaimerBanner } from '../../components/Disclaimer';
import { ModuleCard } from '../../components/ModuleCard';
import { H1, Muted, Screen } from '../../components/ui';
import { MODULES } from '../../data/modules';
import { useI18n } from '../../lib/i18n';

export default function Modules() {
  const { t } = useI18n();
  return (
    <Screen>
      <H1>{t('tabModules')}</H1>
      <Muted>{t('modulesCount', { n: MODULES.length })}</Muted>
      <DisclaimerBanner />
      {MODULES.map((m) => (
        <ModuleCard key={m.id} m={m} />
      ))}
    </Screen>
  );
}
