import * as React from 'react';
import { Typography } from '../atoms/typography';
import { cn } from '../patterns/utils';

export interface CardHeaderActionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function CardHeaderAction({ title, description, action, className, ...props }: CardHeaderActionProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)} {...props}>
      <div>
        <Typography as="h3" variant="h5">{title}</Typography>
        {description ? <Typography variant="body-sm" className="text-[#6A6A6A]">{description}</Typography> : null}
      </div>
      {action}
    </div>
  );
}
