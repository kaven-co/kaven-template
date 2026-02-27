'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@kaven/ui-base';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kaven/ui-base';
import { Badge } from '@kaven/ui-base';
import { CheckCircle2, ArrowRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Confetti — lightweight, no extra dependency
// Uses CSS keyframes defined inline via a <style> tag injected once.
// ---------------------------------------------------------------------------

function ConfettiPiece({ index }: { index: number }) {
  const colors = [
    'bg-primary',
    'bg-emerald-400',
    'bg-amber-400',
    'bg-sky-400',
    'bg-violet-400',
    'bg-rose-400',
  ];
  const color = colors[index % colors.length];
  const left = `${(index * 7 + 5) % 100}%`;
  const delay = `${(index * 0.17) % 1.5}s`;
  const duration = `${2.2 + (index % 3) * 0.4}s`;
  const size = index % 3 === 0 ? 'h-3 w-2' : 'h-2 w-2';

  return (
    <div
      className={`absolute ${color} ${size} rounded-sm opacity-0`}
      style={{
        left,
        top: '-16px',
        animation: `confetti-fall ${duration} ${delay} ease-in forwards`,
      }}
    />
  );
}

function Confetti() {
  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Activation status poller
// We poll /api/subscriptions/current for up to 30 s waiting for the webhook
// to fire and the subscription to become active. Gives instant feedback.
// ---------------------------------------------------------------------------

type ActivationStatus = 'pending' | 'active' | 'timeout';

function useActivationPoller(sessionId: string | null): ActivationStatus {
  const [status, setStatus] = useState<ActivationStatus>('pending');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    let attempts = 0;
    const maxAttempts = 10; // 10 × 3 s = 30 s
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch('/api/subscriptions/current', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.status === 'ACTIVE') {
            setStatus('active');
            // Bust React Query cache so sidebar / feature limits refresh
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            clearInterval(interval);
            return;
          }
        }
      } catch {
        // silently retry
      }

      if (attempts >= maxAttempts) {
        setStatus('timeout');
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, queryClient]);

  return status;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const activationStatus = useActivationPoller(sessionId);

  return (
    <div className="relative min-h-[500px] flex items-center justify-center p-4">
      <Confetti />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Success card */}
        <Card className="shadow-lg border-emerald-200 dark:border-emerald-800">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription className="text-base">
              Your plan is being activated. This usually takes a few seconds.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Activation status */}
            <div className="flex items-center justify-center gap-2 py-2">
              {activationStatus === 'pending' && (
                <Badge
                  variant="secondary"
                  className="animate-pulse text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950"
                >
                  Activating your plan...
                </Badge>
              )}
              {activationStatus === 'active' && (
                <Badge className="bg-emerald-500 text-white">
                  Plan activated!
                </Badge>
              )}
              {activationStatus === 'timeout' && (
                <Badge variant="outline" className="text-muted-foreground">
                  Activation in progress — refresh in a moment
                </Badge>
              )}
            </div>

            {sessionId && (
              <p className="text-center text-xs text-muted-foreground font-mono">
                Session: {sessionId.slice(0, 24)}...
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Link href="/dashboard">
                <Button className="w-full gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full gap-2">
                  View Plans
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Support note */}
        <p className="text-center text-xs text-muted-foreground">
          Didn&apos;t receive a confirmation email?{' '}
          <Link href="/help" className="underline underline-offset-2 hover:text-foreground">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
