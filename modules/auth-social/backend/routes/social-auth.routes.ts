import type { FastifyInstance } from 'fastify'
import { googleOAuthService } from '../services/google-oauth.service'

export async function socialAuthRoutes(app: FastifyInstance) {
  // GET /auth/google → redirect para Google consent screen
  app.get('/auth/google', async (request, reply) => {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      redirect_uri: `${process.env.APP_URL}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
    })
    return reply.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    )
  })

  // GET /auth/google/callback → troca code por user info → upsert user → JWT
  app.get('/auth/google/callback', async (request, reply) => {
    const { code } = request.query as { code?: string }

    if (!code) {
      return reply.status(400).send({ error: 'Missing code' })
    }

    try {
      const googleUser = await googleOAuthService.exchangeCodeForUser(code)
      const { token } = await googleOAuthService.upsertUser(googleUser)
      return reply.redirect(
        `${process.env.APP_URL}/auth/callback?token=${token}`
      )
    } catch (err) {
      app.log.error(err, 'Google OAuth callback error')
      return reply.redirect(
        `${process.env.APP_URL}/auth/error?reason=google_oauth_failed`
      )
    }
  })
}
