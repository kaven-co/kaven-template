import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @react-email/render before importing the service
vi.mock('@react-email/render', () => ({
  renderAsync: vi.fn().mockResolvedValue('<html><body>mocked html</body></html>'),
}))

// Mock React createElement to pass through props
vi.mock('react', () => ({
  default: {
    createElement: vi.fn((component: unknown, props: unknown) => ({ component, props })),
  },
  createElement: vi.fn((component: unknown, props: unknown) => ({ component, props })),
}))

// Mock template modules
const mockSubject = vi.fn()
const MockComponent = vi.fn()

vi.mock('../../frontend/emails/welcome.email', () => ({
  default: MockComponent,
  subject: (vars: { brandName?: string }) => `Welcome to ${vars.brandName ?? 'Kaven'}!`,
}))

vi.mock('../../frontend/emails/password-reset.email', () => ({
  default: MockComponent,
  subject: (vars: { brandName?: string }) => `Reset your ${vars.brandName ?? 'Kaven'} password`,
}))

vi.mock('../../frontend/emails/invite.email', () => ({
  default: MockComponent,
  subject: (vars: { inviterName?: string; tenantName?: string }) =>
    `${vars.inviterName ?? 'Someone'} invited you to ${vars.tenantName ?? 'a workspace'}`,
}))

vi.mock('../../frontend/emails/plan-upgraded.email', () => ({
  default: MockComponent,
  subject: (vars: { planName?: string }) => `You're now on the ${vars.planName ?? 'new'} plan!`,
}))

vi.mock('../../frontend/emails/payment-failed.email', () => ({
  default: MockComponent,
  subject: (vars: { brandName?: string }) =>
    `Action required: payment failed on ${vars.brandName ?? 'Kaven'}`,
}))

vi.mock('../../frontend/emails/tenant-created.email', () => ({
  default: MockComponent,
  subject: (vars: { brandName?: string; tenantName?: string }) =>
    `Your ${vars.brandName ?? 'Kaven'} workspace "${vars.tenantName}" is ready`,
}))

import { templateRendererService } from '../backend/services/template-renderer.service'
import { renderAsync } from '@react-email/render'

describe('templateRendererService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(renderAsync).mockResolvedValue('<html><body>mocked html</body></html>')
  })

  it('renders welcome template with custom vars and returns html + subject', async () => {
    const result = await templateRendererService.render('welcome', {
      brandName: 'MyApp',
      userName: 'Ana',
    })

    expect(result.html).toBe('<html><body>mocked html</body></html>')
    expect(result.subject).toBe('Welcome to MyApp!')
    expect(renderAsync).toHaveBeenCalledOnce()
  })

  it('renders welcome template with default brand when no vars provided', async () => {
    const result = await templateRendererService.render('welcome', {})

    expect(result.html).toBeDefined()
    expect(result.subject).toBe('Welcome to Kaven!')
  })

  it('renders password-reset template with correct subject', async () => {
    const result = await templateRendererService.render('password-reset', {
      brandName: 'MyApp',
    })

    expect(result.subject).toBe('Reset your MyApp password')
  })

  it('renders invite template with inviter and tenant name in subject', async () => {
    const result = await templateRendererService.render('invite', {
      inviterName: 'Carlos',
      tenantName: 'Acme Corp',
    })

    expect(result.subject).toBe('Carlos invited you to Acme Corp')
  })

  it('renders plan-upgraded template with plan name in subject', async () => {
    const result = await templateRendererService.render('plan-upgraded', {
      planName: 'Pro',
    })

    expect(result.subject).toBe("You're now on the Pro plan!")
  })

  it('renders payment-failed template with brand in subject', async () => {
    const result = await templateRendererService.render('payment-failed', {
      brandName: 'MyApp',
    })

    expect(result.subject).toBe('Action required: payment failed on MyApp')
  })

  it('renders tenant-created template with workspace name in subject', async () => {
    const result = await templateRendererService.render('tenant-created', {
      brandName: 'MyApp',
      tenantName: 'Acme Corp',
    })

    expect(result.subject).toBe('Your MyApp workspace "Acme Corp" is ready')
  })

  it('merges DEFAULT_BRAND with provided vars (provided vars take precedence)', async () => {
    const React = await import('react')

    await templateRendererService.render('welcome', {
      brandName: 'Override',
      userName: 'Bob',
    })

    // React.createElement should have been called with merged props
    expect(React.default.createElement).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        brandName: 'Override',
        userName: 'Bob',
        brandColor: '#F59E0B', // default preserved
      }),
    )
  })

  it('does not throw when all vars are omitted', async () => {
    await expect(templateRendererService.render('welcome', {})).resolves.not.toThrow()
  })
})
