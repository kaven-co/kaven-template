// Kaven Payments Module — Paddle Client
// Wrapper for Paddle SDK. Configured via PADDLE_API_KEY env var.
// Note: Paddle integration is optional. Stripe is the primary provider.

import { secureLog } from '../../utils/secure-logger';

const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
const PADDLE_ENVIRONMENT = (process.env.PADDLE_ENVIRONMENT as 'production' | 'sandbox') ?? 'sandbox';

if (!PADDLE_API_KEY) {
  secureLog.warn('[Paddle] PADDLE_API_KEY not configured — Paddle features will be unavailable');
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaddleSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  customerId: string;
  priceId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface PaddleCheckoutSession {
  id: string;
  url: string;
  customerId?: string;
}

// ─── Paddle Client ────────────────────────────────────────────────────────────

export class PaddleClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = PADDLE_ENVIRONMENT === 'production'
      ? 'https://api.paddle.com'
      : 'https://sandbox-api.paddle.com';
    this.apiKey = PADDLE_API_KEY ?? '';
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Paddle API error ${response.status}: ${JSON.stringify(error)}`);
    }

    return response.json() as Promise<T>;
  }

  async createCheckoutSession(params: {
    priceId: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<PaddleCheckoutSession> {
    return this.request<PaddleCheckoutSession>('POST', '/transactions', {
      items: [{ price_id: params.priceId, quantity: 1 }],
      customer_id: params.customerId,
      checkout: {
        url: params.successUrl,
      },
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.request('POST', `/subscriptions/${subscriptionId}/cancel`, {
      effective_from: 'immediately',
    });
  }
}

export const paddleClient = new PaddleClient();
