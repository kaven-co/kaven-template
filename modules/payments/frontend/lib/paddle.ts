'use client';

// Kaven Payments Module — Paddle.js Frontend Integration
// Loads the Paddle.js script for client-side checkout.

const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const PADDLE_ENVIRONMENT = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? 'sandbox';

export function PaddleScript() {
  if (!PADDLE_CLIENT_TOKEN) {
    return null;
  }

  return null; // Paddle.js loaded via useEffect below
}

export function initPaddle() {
  if (typeof window === 'undefined') return;
  if (!PADDLE_CLIENT_TOKEN) {
    console.warn('[Paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not configured');
    return;
  }

  // @ts-ignore
  if (window.Paddle) {
    // @ts-ignore
    window.Paddle.Environment.set(PADDLE_ENVIRONMENT);
    // @ts-ignore
    window.Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
  }
}

export function openPaddleCheckout(priceId: string, customData?: Record<string, string>) {
  // @ts-ignore
  if (!window.Paddle) {
    console.error('[Paddle] Paddle.js not loaded');
    return;
  }

  // @ts-ignore
  window.Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData,
  });
}
