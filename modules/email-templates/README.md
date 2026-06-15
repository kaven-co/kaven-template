# email-templates

Kaven module — professional React Email transactional templates with brand customization.

## Templates included

| Template | Subject |
|---|---|
| `welcome` | Welcome to {brandName}! |
| `password-reset` | Reset your {brandName} password |
| `invite` | {inviterName} invited you to {tenantName} |
| `plan-upgraded` | You're now on the {planName} plan! |
| `payment-failed` | Action required: payment failed on {brandName} |
| `tenant-created` | Your {brandName} workspace "{tenantName}" is ready |

## Installation

```bash
kaven module install email-templates
```

Requires: `@react-email/render`, `@react-email/components` (installed automatically).

## Usage

```typescript
import { templateRendererService } from '@/modules/notifications/template-renderer.service'

const { html, subject } = await templateRendererService.render('welcome', {
  userName: 'Ana',
  actionUrl: 'https://app.example.com/get-started',
  brandName: 'MyApp',
  brandColor: '#6366f1',
})
```

## Brand customization

All templates accept:

| Var | Default | Description |
|---|---|---|
| `brandName` | `'Kaven'` | Product name |
| `brandColor` | `'#F59E0B'` | Primary color (hex) |
| `brandLogo` | `undefined` | Logo URL (optional) |
| `userName` | `'there'` | Recipient name |
| `actionUrl` | `'#'` | CTA link |
| `planName` | varies | Plan name (plan-upgraded) |
| `amount` | `''` | Payment amount (payment-failed) |
| `inviterName` | varies | Inviter name (invite) |
| `tenantName` | varies | Workspace name |

## Preview (admin)

After install, visit `/admin/email-templates` to preview all templates live.

## Tier

`builder` — available on Builder plan and above.
