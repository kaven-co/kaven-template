import * as React from 'react';
import { BrandLogo } from '../brand/brand-logo';

export function MarketingTemplate({ hero, children }: { hero: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex h-20 items-center border-b border-[#E5E5E5] px-6">
        <BrandLogo />
      </header>
      <section className="bg-[linear-gradient(135deg,#10B981_0%,#00D9FF_50%,#F97316_100%)]/10 p-10">{hero}</section>
      <main className="p-10">{children}</main>
    </div>
  );
}
