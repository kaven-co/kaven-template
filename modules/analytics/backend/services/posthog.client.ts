// Kaven Analytics Module — PostHog Client
// Wrapper lazy-loaded: só inicializa se POSTHOG_API_KEY estiver definido.
// Se posthog-node não estiver instalado, retorna null silenciosamente.

interface PostHogClient {
  capture(event: { distinctId: string; event: string; properties?: Record<string, unknown> }): void
  shutdown(): Promise<void>
}

let _posthog: PostHogClient | null = null

export function getPostHogClient(): PostHogClient | null {
  if (!process.env.POSTHOG_API_KEY) return null
  if (_posthog) return _posthog

  // Lazy import para não quebrar se posthog-node não estiver instalado
  try {
    const { PostHog } = require('posthog-node')
    _posthog = new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST ?? 'https://app.posthog.com',
      flushAt: 20,
      flushInterval: 10000,
    })
  } catch {
    // posthog-node não instalado ou falha na inicialização — silencioso
  }
  return _posthog
}
