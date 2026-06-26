'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import type { EnvironmentTemplateDetail } from '@/app/defend/agentic-types'
import { BankingEditor, type BankingEnvironment } from './environment/BankingEditor'
import { EmailInboxEditor, type EmailEnvironment } from './environment/EmailInboxEditor'
import { JsonTextEditor } from './environment/JsonTextEditor'

type EditorTab = 'form' | 'json'

/** Namespaces that have a friendly form editor. Everything else uses raw JSON. */
const NAMESPACES_WITH_FORM_EDITOR = ['email', 'banking']

interface EnvironmentSeedEditorProps {
  templateDetail: EnvironmentTemplateDetail
  /** The full `initial_environment`, keyed by namespace (e.g. `{ email: {...} }`). */
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
}

export function EnvironmentSeedEditor({
  templateDetail,
  value,
  onChange,
}: EnvironmentSeedEditorProps) {
  const { namespace, name: templateName } = templateDetail
  const hasFormEditor = NAMESPACES_WITH_FORM_EDITOR.includes(namespace)

  const [activeTab, setActiveTab] = useState<EditorTab>(hasFormEditor ? 'form' : 'json')

  // On first selecting a template, copy its default environment in as the
  // starting point so the editors always have data to show.
  useEffect(() => {
    const alreadySeeded = value[namespace] !== undefined
    if (alreadySeeded) return
    const defaults = templateDetail.default_environment?.[namespace] ?? {}
    onChange({ ...value, [namespace]: structuredClone(defaults) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateDetail.template_id])

  // This template's slice of the environment. Falls back to the template
  // default until the seeding effect above persists it to the parent.
  const namespaceData =
    (value[namespace] as Record<string, unknown> | undefined) ??
    (templateDetail.default_environment?.[namespace] as Record<string, unknown>) ??
    {}

  // Save edits back, keeping the namespace wrapper key intact.
  const saveNamespaceData = (updated: Record<string, unknown>) =>
    onChange({ ...value, [namespace]: updated })

  const renderActiveEditor = () => {
    if (activeTab === 'json') {
      return <JsonTextEditor value={namespaceData} onChange={saveNamespaceData} />
    }
    switch (namespace) {
      case 'email':
        return (
          <EmailInboxEditor
            value={namespaceData as EmailEnvironment}
            onChange={saveNamespaceData}
          />
        )
      case 'banking':
        return (
          <BankingEditor value={namespaceData as BankingEnvironment} onChange={saveNamespaceData} />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Seed the {templateName} environment
          </label>
          <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
            Set the starting data your Sentinel sees. Hidden instructions inside this data are how
            attackers attempt prompt injection.
          </span>
        </div>

        {hasFormEditor && (
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-[var(--color-border-default)]">
            {(['form', 'json'] as EditorTab[]).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                )}
              >
                {tab === 'form' ? 'Form' : 'JSON'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
        {renderActiveEditor()}
      </div>
    </div>
  )
}
