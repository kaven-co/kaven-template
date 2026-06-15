import { renderAsync } from '@react-email/render'
import React from 'react'

export type EmailTemplateName =
  | 'welcome'
  | 'password-reset'
  | 'invite'
  | 'plan-upgraded'
  | 'payment-failed'
  | 'tenant-created'

export interface EmailTemplateVars {
  brandName?: string
  brandColor?: string
  brandLogo?: string
  userName?: string
  actionUrl?: string
  planName?: string
  amount?: string
  inviterName?: string
  tenantName?: string
}

const DEFAULT_BRAND = {
  brandName: 'Kaven',
  brandColor: '#F59E0B',
  brandLogo: undefined,
}

export const templateRendererService = {
  async render(
    template: EmailTemplateName,
    vars: EmailTemplateVars,
  ): Promise<{ html: string; subject: string }> {
    const mergedVars = { ...DEFAULT_BRAND, ...vars }

    // Lazy import to avoid loading all templates on startup
    const { default: Component, subject } = await import(
      `../../frontend/emails/${template}.email`
    )
    const html = await renderAsync(React.createElement(Component, mergedVars))

    return { html, subject: subject(mergedVars) }
  },
}
