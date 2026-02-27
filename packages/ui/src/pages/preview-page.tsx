import * as React from 'react';
import { DashboardTemplate } from '../templates/dashboard-template';
import { SettingsPanel } from '../organisms/settings-panel';

export function PreviewPage() {
  return (
    <DashboardTemplate navItems={[{ href: '#', label: 'Dashboard', active: true }, { href: '#', label: 'Configurações' }]}>
      <SettingsPanel title="Atomic Design Preview" description="Página de preview para documentação interna">
        <p>Atoms, Molecules, Organisms, Templates e Pages conectados.</p>
      </SettingsPanel>
    </DashboardTemplate>
  );
}
