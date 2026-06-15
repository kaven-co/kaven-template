'use client'

import { useState } from 'react'

// Installed at: apps/admin/app/(dashboard)/email-templates/page.tsx

const TEMPLATES = [
  'welcome',
  'password-reset',
  'invite',
  'plan-upgraded',
  'payment-failed',
  'tenant-created',
] as const

type TemplateName = (typeof TEMPLATES)[number]

export default function EmailPreviewPage() {
  const [selected, setSelected] = useState<TemplateName>('welcome')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPreview = async (template: TemplateName) => {
    setSelected(template)
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/email-templates/preview?template=${template}`)
      if (!res.ok) throw new Error(`Failed to load preview: ${res.statusText}`)
      const data = await res.json()
      setPreviewHtml(data.html)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Sidebar */}
      <aside className="w-48 shrink-0">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Templates
        </h2>
        <nav className="flex flex-col gap-1">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => loadPreview(t)}
              className={[
                'rounded-md px-3 py-2 text-sm text-left transition-colors',
                selected === t
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-foreground',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </nav>
      </aside>

      {/* Preview */}
      <div className="flex-1 rounded-lg border bg-white overflow-hidden">
        {loading && (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Loading preview...
          </div>
        )}
        {error && (
          <div className="flex h-full items-center justify-center text-destructive text-sm">
            {error}
          </div>
        )}
        {!loading && !error && previewHtml && (
          <iframe
            srcDoc={previewHtml}
            className="h-full w-full border-0"
            title={`Preview: ${selected}`}
          />
        )}
        {!loading && !error && !previewHtml && (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Select a template to preview
          </div>
        )}
      </div>
    </div>
  )
}
