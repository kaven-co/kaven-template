import * as React from 'react';
import { BrandLogo } from '../brand/brand-logo';

export function AuthTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#F9F9F9_0%,#FFFFFF_100%)] p-6">
      <div className="w-full max-w-md rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-[0_8px_24px_rgba(16,185,129,0.15)]">
        <BrandLogo className="mb-6" />
        {children}
      </div>
    </div>
  );
}
