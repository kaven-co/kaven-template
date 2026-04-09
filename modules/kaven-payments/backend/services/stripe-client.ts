import Stripe from 'stripe';
import { env } from '../config/env';
import { secureLog } from '../utils/secure-logger';

if (!env.STRIPE_SECRET_KEY) {
  secureLog.warn('[Stripe] STRIPE_SECRET_KEY not configured — Stripe features will be unavailable');
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});
