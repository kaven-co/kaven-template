import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  socialAccount: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  user: {
    upsert: vi.fn(),
  },
}))

vi.mock('../../../lib/prisma', () => ({ prisma: prismaMock }))

vi.mock('../../../lib/jwt', () => ({
  generateAccessToken: vi.fn().mockResolvedValue('mock_jwt_token'),
}))

// Mock global fetch
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

// ---------------------------------------------------------------------------
// Import SUT after mocks are in place
// ---------------------------------------------------------------------------

import { googleOAuthService } from '../backend/services/google-oauth.service'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const GOOGLE_USER = {
  sub: 'google-sub-123',
  email: 'user@example.com',
  name: 'Test User',
  picture: 'https://example.com/photo.jpg',
}

const DB_USER = {
  id: 'user-cuid-1',
  email: 'user@example.com',
  name: 'Test User',
  role: 'user',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('googleOAuthService.exchangeCodeForUser', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it('happy path: retorna GoogleUser ao trocar code válido', async () => {
    // Primeiro fetch: token exchange
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'google_access_token' }),
    })
    // Segundo fetch: userinfo
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => GOOGLE_USER,
    })

    const result = await googleOAuthService.exchangeCodeForUser('valid_code')

    expect(result.sub).toBe(GOOGLE_USER.sub)
    expect(result.email).toBe(GOOGLE_USER.email)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('lança erro quando token exchange falha (ex: sem GOOGLE_CLIENT_ID)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 400 })

    await expect(
      googleOAuthService.exchangeCodeForUser('bad_code')
    ).rejects.toThrow('Google token exchange failed: 400')
  })

  it('lança erro quando userinfo falha', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'token' }),
    })
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 })

    await expect(
      googleOAuthService.exchangeCodeForUser('code')
    ).rejects.toThrow('Google userinfo fetch failed: 401')
  })
})

describe('googleOAuthService.upsertUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy path: encontra SocialAccount existente → retorna token sem criar nada', async () => {
    prismaMock.socialAccount.findUnique.mockResolvedValue({
      provider: 'google',
      providerId: GOOGLE_USER.sub,
      userId: DB_USER.id,
      user: DB_USER,
    })

    const { user, token } = await googleOAuthService.upsertUser(GOOGLE_USER)

    expect(user.email).toBe(DB_USER.email)
    expect(token).toBe('mock_jwt_token')
    expect(prismaMock.user.upsert).not.toHaveBeenCalled()
    expect(prismaMock.socialAccount.create).not.toHaveBeenCalled()
  })

  it('email novo: cria User + SocialAccount', async () => {
    prismaMock.socialAccount.findUnique.mockResolvedValue(null)
    prismaMock.user.upsert.mockResolvedValue(DB_USER)
    prismaMock.socialAccount.create.mockResolvedValue({
      provider: 'google',
      providerId: GOOGLE_USER.sub,
      userId: DB_USER.id,
    })

    const { user, token } = await googleOAuthService.upsertUser(GOOGLE_USER)

    expect(prismaMock.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: GOOGLE_USER.email },
        create: expect.objectContaining({ email: GOOGLE_USER.email }),
      })
    )
    expect(prismaMock.socialAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          provider: 'google',
          providerId: GOOGLE_USER.sub,
        }),
      })
    )
    expect(user.id).toBe(DB_USER.id)
    expect(token).toBe('mock_jwt_token')
  })

  it('email existente (conta local): faz upsert do user e vincula SocialAccount', async () => {
    prismaMock.socialAccount.findUnique.mockResolvedValue(null)
    prismaMock.user.upsert.mockResolvedValue({ ...DB_USER, name: GOOGLE_USER.name })
    prismaMock.socialAccount.create.mockResolvedValue({})

    const { user } = await googleOAuthService.upsertUser({
      ...GOOGLE_USER,
      name: 'Updated Name',
    })

    expect(prismaMock.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { name: 'Updated Name' },
      })
    )
    expect(user.email).toBe(DB_USER.email)
  })
})
