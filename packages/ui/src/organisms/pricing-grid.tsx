import * as React from 'react';
import { Button } from '../atoms/button';
import { Typography } from '../atoms/typography';
import { Badge } from '../atoms/badge';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  highlighted?: boolean;
}

export interface PricingGridProps {
  plans: PricingPlan[];
}

export function PricingGrid({ plans }: PricingGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <article key={plan.id} className={plan.highlighted ? 'rounded-xl border-2 border-[#10B981] bg-white p-6' : 'rounded-xl border border-[#E5E5E5] bg-white p-6'}>
          {plan.highlighted ? <Badge variant="default">Most Popular</Badge> : null}
          <Typography as="h3" variant="h4" className="mt-2">{plan.name}</Typography>
          <Typography variant="display-m" className="mt-3">{plan.price}</Typography>
          <Typography variant="body-sm" className="mt-2 text-[#6A6A6A]">{plan.description}</Typography>
          <Button className="mt-5" variant={plan.highlighted ? 'contained' : 'outline'} color="primary" fullWidth>
            Escolher plano
          </Button>
        </article>
      ))}
    </div>
  );
}
