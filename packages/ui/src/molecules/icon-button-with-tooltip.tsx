import * as React from 'react';
import { Button, type ButtonProps } from '../atoms/button';

export interface IconButtonWithTooltipProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  tooltip: string;
}

export function IconButtonWithTooltip({ icon, tooltip, 'aria-label': ariaLabel, ...props }: IconButtonWithTooltipProps) {
  return (
    <Button variant="ghost" size={props.size ?? 'md'} aria-label={ariaLabel ?? tooltip} title={tooltip} {...props}>
      {icon}
      <span className="sr-only">{tooltip}</span>
    </Button>
  );
}
