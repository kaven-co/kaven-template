'use client';

// Kaven Payments Module — UpgradeButton
// Opens Paddle or Stripe checkout for plan upgrades.

import { useState } from 'react';
import { openPaddleCheckout } from '../../lib/paddle';

interface UpgradeButtonProps {
  priceId: string;
  planName: string;
  provider?: 'stripe' | 'paddle';
  stripeCheckoutUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function UpgradeButton({
  priceId,
  planName,
  provider = 'stripe',
  stripeCheckoutUrl,
  className,
  children,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (provider === 'paddle') {
        openPaddleCheckout(priceId);
      } else {
        // Stripe: redirect to checkout session URL
        if (stripeCheckoutUrl) {
          window.location.href = stripeCheckoutUrl;
        } else {
          // Create session via API
          const res = await fetch('/api/checkout/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId: priceId, interval: 'MONTHLY' }),
          });
          const { url } = await res.json();
          if (url) window.location.href = url;
        }
      }
    } catch (err) {
      console.error('[UpgradeButton] Checkout failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
      aria-label={`Upgrade to ${planName}`}
    >
      {loading ? 'Processando...' : children ?? `Upgrade para ${planName}`}
    </button>
  );
}
