'use client';

import { cn } from '@/lib/utils';
import { usePlatformSettings } from '@/hooks/use-platform-settings';
import { BrandLogo } from '@kaven/ui-base';

export function Logo({
  size = 'medium',
  className,
}: {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const { data } = usePlatformSettings();
  const logoUrl = data?.logoUrl || null;
  const companyName = data?.companyName || 'Kaven';

  const sizes = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-12',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={logoUrl} 
          alt={companyName}
          className={cn(sizes[size], 'object-contain')}
        />
      ) : (
        <BrandLogo variant="icon" size={size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'} className={cn(sizes[size])} />
      )}
      {size !== 'small' && <span className="font-bold text-xl text-foreground">{companyName}</span>}
    </div>
  );
}
