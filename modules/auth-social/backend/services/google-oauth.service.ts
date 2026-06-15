import { prisma } from '../../../lib/prisma'
import { generateAccessToken } from '../../../lib/jwt'

export interface GoogleUser {
  sub: string
  email: string
  name: string
  picture?: string
}

export const googleOAuthService = {
  /**
   * Troca o authorization code pelo user info do Google.
   * Faz dois requests: token exchange + userinfo.
   */
  async exchangeCodeForUser(code: string): Promise<GoogleUser> {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        redirect_uri: `${process.env.APP_URL}/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      throw new Error(`Google token exchange failed: ${tokenRes.status}`)
    }

    const tokens = (await tokenRes.json()) as { access_token: string }

    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    )

    if (!userRes.ok) {
      throw new Error(`Google userinfo fetch failed: ${userRes.status}`)
    }

    return userRes.json() as Promise<GoogleUser>
  },

  /**
   * Upsert: encontra ou cria User + SocialAccount a partir do perfil Google.
   * Retorna o user e um access token JWT.
   */
  async upsertUser(googleUser: GoogleUser) {
    // Tenta encontrar SocialAccount já vinculada
    const existing = await prisma.socialAccount.findUnique({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: googleUser.sub,
        },
      },
      include: { user: true },
    })

    if (existing) {
      const token = await generateAccessToken({
        sub: existing.user.id,
        email: existing.user.email,
        role: (existing.user as any).role ?? 'user',
      })
      return { user: existing.user, token }
    }

    // Upsert pelo email: pode existir conta local sem vinculação social
    const user = await prisma.user.upsert({
      where: { email: googleUser.email },
      update: { name: googleUser.name },
      create: {
        email: googleUser.email,
        name: googleUser.name,
        emailVerified: new Date(),
      },
    })

    await prisma.socialAccount.create({
      data: {
        provider: 'google',
        providerId: googleUser.sub,
        userId: user.id,
      },
    })

    const token = await generateAccessToken({
      sub: user.id,
      email: user.email,
      role: (user as any).role ?? 'user',
    })

    return { user, token }
  },
}
