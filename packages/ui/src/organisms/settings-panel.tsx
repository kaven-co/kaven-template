import * as React from 'react';
import { Typography } from '../atoms/typography';

export interface SettingsPanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsPanel({ title, description, children }: SettingsPanelProps) {
  return (
    <section className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      <Typography as="h3" variant="h4">{title}</Typography>
      {description ? <Typography variant="body-sm" className="mt-1 text-[#6A6A6A]">{description}</Typography> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
