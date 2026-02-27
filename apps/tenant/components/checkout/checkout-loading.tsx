'use client';

import { Card, CardContent } from '@kaven/ui-base';
import { Skeleton } from '@kaven/ui-base';
import { Loader2, ShieldCheck } from 'lucide-react';

/**
 * CheckoutLoading
 *
 * Displayed while we call POST /api/checkout/create-session and wait for
 * Stripe to return the hosted checkout URL.
 */
export function CheckoutLoading() {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Order summary skeleton */}
        <Card className="border shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="pt-2 border-t">
              <Skeleton className="h-6 w-1/4" />
            </div>
          </CardContent>
        </Card>

        {/* Redirect indicator */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-base font-medium text-foreground">
            Redirecting to secure payment...
          </p>
          <p className="text-sm text-muted-foreground">
            You will be taken to Stripe&apos;s secure checkout page.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
