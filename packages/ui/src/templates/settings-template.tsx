import * as React from 'react';
import { Typography } from '../atoms/typography';

export function SettingsTemplate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <Typography as="h1" variant="h2">{title}</Typography>
      {children}
    </section>
  );
}
