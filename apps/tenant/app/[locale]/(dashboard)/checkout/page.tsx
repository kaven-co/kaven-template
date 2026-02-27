'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePlan, type Plan, type Price } from '@/hooks/use-plans';
import { useTenant } from '@/hooks/use-tenant';
import { CheckoutLoading } from '@/components/checkout/checkout-loading';
import { Button } from '@kaven/ui-base';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kaven/ui-base';
import { Badge } from '@kaven/ui-base';
import { Alert } from '@kaven/ui-base';
import { Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BillingInterval = 'MONTHLY' | 'YEARLY';

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
  }).format(Number(amount));
}

function findPrice(plan: Plan, interval: BillingInterval): Price | undefined {
  return plan.prices?.find((p) => p.interval === interval && p.isActive);
}

function intervalLabel(interval: BillingInterval): string {
  return interval === 'MONTHLY' ? 'month' : 'year';
}

// ---------------------------------------------------------------------------
// Order Summary sub-component (rendered before redirect)
// ---------------------------------------------------------------------------

interface OrderSummaryProps {
  plan: Plan;
  price: Price;
  interval: BillingInterval;
}

function OrderSummary({ plan, price, interval }: OrderSummaryProps) {
  const amount = Number(price.amount);
  const originalAmount = price.originalAmount ? Number(price.originalAmount) : null;
  const hasDiscount = originalAmount && originalAmount > amount;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
        <CardDescription>Review your plan before proceeding to payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan name + badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{plan.name}</span>
            {plan.badge && (
              <Badge variant="secondary" className="text-xs">
                {plan.badge}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {interval.toLowerCase()}
          </Badge>
        </div>

        {/* Features list */}
        {plan.features && plan.features.length > 0 && (
          <div className="space-y-1.5">
            {plan.features.slice(0, 5).map((feature) => (
              <div key={feature.code} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {feature.name}
                  {feature.limitValue !== undefined &&
                    feature.limitValue !== null &&
                    feature.limitValue !== -1 && (
                      <span> ({feature.limitValue} {feature.unit})</span>
                    )}
                  {feature.limitValue === -1 && <span> (Unlimited)</span>}
                </span>
              </div>
            ))}
            {plan.features.length > 5 && (
              <p className="text-xs text-muted-foreground pl-6">
                +{plan.features.length - 5} more features included
              </p>
            )}
          </div>
        )}

        <hr className="border-border/50" />

        {/* Pricing */}
        <div className="space-y-1">
          {hasDiscount && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Original price</span>
              <span className="text-muted-foreground line-through">
                {formatAmount(originalAmount, price.currency)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <div className="text-right">
              <p className="text-xl font-bold">
                {formatAmount(amount, price.currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                per {intervalLabel(interval)}
              </p>
            </div>
          </div>
          {plan.trialDays > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-right">
              {plan.trialDays}-day free trial included
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const planId = searchParams.get('planId') ?? '';
  const interval = (searchParams.get('interval') ?? 'MONTHLY') as BillingInterval;

  const { data: plan, isLoading: isPlanLoading, error: planError } = usePlan(planId);
  const { tenant } = useTenant();

  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Validate query params
  const isValidInterval = interval === 'MONTHLY' || interval === 'YEARLY';

  // Derive selected price once plan is loaded
  const selectedPrice = plan ? findPrice(plan, interval) : undefined;

  // Create Stripe checkout session and redirect
  useEffect(() => {
    // Wait until we have all required data
    if (!plan || !selectedPrice || !tenant?.id || isCreatingSession) return;

    let cancelled = false;

    async function createSession() {
      if (cancelled) return;

      setIsCreatingSession(true);
      setSessionError(null);

      try {
        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            interval,
            tenantId: tenant!.id,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.message || body?.error || `HTTP ${response.status}`);
        }

        const session: CheckoutSessionResponse = await response.json();

        if (!session.url) {
          throw new Error('No checkout URL received from server');
        }

        if (!cancelled) {
          // Hard redirect to Stripe hosted checkout
          window.location.href = session.url;
        }
      } catch (err) {
        if (!cancelled) {
          const message = getErrorMessage(err);
          setSessionError(message);
          setIsCreatingSession(false);
          toast.error(`Failed to start checkout: ${message}`);
        }
      }
    }

    createSession();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id, selectedPrice?.id, tenant?.id]);

  // ── Guard: missing / invalid query params ──────────────────────────────
  if (!planId || !isValidInterval) {
    return (
      <div className="max-w-md mx-auto py-16 space-y-6">
        <Alert
          variant="standard"
          severity="error"
          icon={<AlertCircle className="h-4 w-4" />}
        >
          Invalid checkout link. Please go back to the pricing page and select a plan.
        </Alert>
        <Link href="/pricing">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Button>
        </Link>
      </div>
    );
  }

  // ── Plan fetch error ───────────────────────────────────────────────────
  if (planError) {
    return (
      <div className="max-w-md mx-auto py-16 space-y-6">
        <Alert
          variant="standard"
          severity="error"
          icon={<AlertCircle className="h-4 w-4" />}
        >
          Could not load plan details. Please try again.
        </Alert>
        <Link href="/pricing">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Button>
        </Link>
      </div>
    );
  }

  // ── No active price for interval ───────────────────────────────────────
  if (plan && !selectedPrice) {
    return (
      <div className="max-w-md mx-auto py-16 space-y-6">
        <Alert
          variant="standard"
          severity="error"
          icon={<AlertCircle className="h-4 w-4" />}
        >
          The selected plan does not have a{' '}
          {interval === 'MONTHLY' ? 'monthly' : 'yearly'} price configured.
          Please choose a different billing interval.
        </Alert>
        <Link href="/pricing">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Button>
        </Link>
      </div>
    );
  }

  // ── Session creation error ─────────────────────────────────────────────
  if (sessionError) {
    return (
      <div className="max-w-md mx-auto py-16 space-y-6">
        {plan && selectedPrice && (
          <OrderSummary plan={plan} price={selectedPrice} interval={interval} />
        )}
        <Alert
          variant="standard"
          severity="error"
          icon={<AlertCircle className="h-4 w-4" />}
        >
          {sessionError}
        </Alert>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              setSessionError(null);
              // Reset triggers the useEffect again via state change
              setIsCreatingSession(false);
            }}
            className="w-full"
          >
            Try Again
          </Button>
          <Link href="/pricing">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading: plan fetch or session creation ────────────────────────────
  if (isPlanLoading || isCreatingSession || (plan && !sessionError)) {
    return (
      <div className="max-w-md mx-auto py-8 space-y-6">
        {plan && selectedPrice && (
          <OrderSummary plan={plan} price={selectedPrice} interval={interval} />
        )}
        <CheckoutLoading />
      </div>
    );
  }

  // Fallback (should not be reached)
  return <CheckoutLoading />;
}
