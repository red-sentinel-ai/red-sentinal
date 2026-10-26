'use client'

import { AlertTriangle } from 'lucide-react'

import type { ExistingAgentCapability, ExistingAgentDraft } from '@/app/defend/agentic-types'
import {
  CONNECTION_URL_HINT,
  validateConnectionUrl,
  type MissingCapability,
} from '@/app/defend/deployment-utils'
import { MaskedCredentialInput } from './MaskedCredentialInput'
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldSubLabelClassName,
  panelClassName,
} from './field-styles'

interface CapabilityOption {
  capability: ExistingAgentCapability
  label: string
  description: string
  placeholder: string
}

const CAPABILITY_OPTIONS: CapabilityOption[] = [
  {
    capability: 'session',
    label: 'Session identifier',
    description: 'Request field carrying a per-attacker session id, so test state stays isolated.',
    placeholder: 'e.g. session_id',
  },
  {
    capability: 'reset',
    label: 'Reset',
    description: 'Request field or path that returns the test state to its starting point.',
    placeholder: 'e.g. reset or /sessions/{session_id}/reset',
  },
  {
    capability: 'evidence',
    label: 'Execution evidence',
    description:
      'Response field listing tool calls with identity, arguments, and outcome — needed for any condition about tool actions.',
    placeholder: 'e.g. tool_calls',
  },
]

interface ExistingAgentConnectionPanelProps {
  value: ExistingAgentDraft
  missingCapabilities: MissingCapability[]
  onChange: (changes: Partial<ExistingAgentDraft>) => void
  onCapabilityChange: (
    capability: ExistingAgentCapability,
    changes: { enabled?: boolean; path?: string }
  ) => void
}

export function ExistingAgentConnectionPanel({
  value,
  missingCapabilities,
  onChange,
  onCapabilityChange,
}: ExistingAgentConnectionPanelProps) {
  const urlError = value.url ? validateConnectionUrl(value.url) : null

  return (
    <div className={panelClassName}>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          Existing agent endpoint
        </p>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Attacker prompts are sent to your agent as-is. Its model settings and private instructions
          stay on your side — you only map how requests and responses look.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <label className={fieldLabelClassName}>Endpoint URL</label>
          <span className={fieldSubLabelClassName}>{CONNECTION_URL_HINT}</span>
        </div>
        <input
          type="url"
          value={value.url}
          onChange={event => onChange({ url: event.target.value })}
          placeholder="https://agent.staging.example/chat"
          autoComplete="off"
          spellCheck="false"
          className={fieldInputClassName}
        />
        {urlError && <p className="font-body text-xs text-[var(--color-danger)]">{urlError}</p>}
      </div>

      <MaskedCredentialInput
        label="Bearer token"
        subLabel="Optional. Sent only to Red Sentinel's connector — never stored in your browser."
        value={value.credential}
        onChange={credential => onChange({ credential })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div>
            <label className={fieldLabelClassName}>Request mapping</label>
            <span className={fieldSubLabelClassName}>
              Request body field that receives the attacker prompt.
            </span>
          </div>
          <input
            type="text"
            value={value.requestPromptPath}
            onChange={event => onChange({ requestPromptPath: event.target.value })}
            placeholder="e.g. prompt or messages[-1].content"
            autoComplete="off"
            spellCheck="false"
            className={`${fieldInputClassName} font-mono`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <label className={fieldLabelClassName}>Response mapping</label>
            <span className={fieldSubLabelClassName}>
              Response body field holding the agent&apos;s reply.
            </span>
          </div>
          <input
            type="text"
            value={value.responseOutputPath}
            onChange={event => onChange({ responseOutputPath: event.target.value })}
            placeholder="e.g. output or choices[0].message.content"
            autoComplete="off"
            spellCheck="false"
            className={`${fieldInputClassName} font-mono`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <label className={fieldLabelClassName}>Supported session capabilities</label>
          <span className={fieldSubLabelClassName}>
            Map the capabilities your API already exposes. Nothing here changes your agent&apos;s
            logic; a capability your API lacks needs an adapter only if a selected Breach Condition
            requires it.
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {CAPABILITY_OPTIONS.map(option => {
            const mapping = value.capabilities[option.capability]
            return (
              <div
                key={option.capability}
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border-subtle)] p-3"
              >
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={mapping.enabled}
                    onChange={event =>
                      onCapabilityChange(option.capability, { enabled: event.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 accent-[var(--color-gold-primary)]"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm text-[var(--color-text-primary)]">{option.label}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {option.description}
                    </span>
                  </span>
                </label>
                {mapping.enabled && (
                  <input
                    type="text"
                    value={mapping.path}
                    onChange={event =>
                      onCapabilityChange(option.capability, { path: event.target.value })
                    }
                    placeholder={option.placeholder}
                    autoComplete="off"
                    spellCheck="false"
                    className={`${fieldInputClassName} font-mono`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {missingCapabilities.length > 0 && (
        <div
          role="alert"
          className="border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 flex flex-col gap-2 rounded-lg border p-3"
        >
          <p className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
            <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
            Your API is missing a capability your Breach Conditions need — an adapter is required.
          </p>
          <ul className="flex flex-col gap-1.5">
            {missingCapabilities.map(missing => (
              <li key={missing.capability} className="text-xs text-[var(--color-text-muted)]">
                <span className="font-medium text-[var(--color-text-secondary)]">
                  {missing.capability}
                </span>{' '}
                — required by &quot;{missing.requiredBy}&quot;. {missing.guidance}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
