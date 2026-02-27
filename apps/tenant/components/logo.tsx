import { cn } from '@/lib/utils';
import { BrandLogo } from '@kaven/ui-base';

export function Logo({
  size = 'medium',
  className,
}: {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const sizes = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-12',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <BrandLogo variant="icon" size={size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'} className={cn(sizes[size])} />
      {size !== 'small' && <span className="font-bold text-xl text-foreground">Kaven</span>}
    </div>
  );
}
