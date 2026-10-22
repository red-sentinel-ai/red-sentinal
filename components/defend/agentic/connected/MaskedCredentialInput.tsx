'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { fieldInputClassName, fieldLabelClassName, fieldSubLabelClassName } from './field-styles'

interface MaskedCredentialInputProps {
  label: string
  subLabel?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  name?: string
}

/**
 * Masked secret input. The value lives only in component state — it is never
 * written to storage or a URL, and the form clears it on reset.
 */
export function MaskedCredentialInput({
  label,
  subLabel,
  value,
  onChange,
  placeholder = 'Optional bearer token',
  name,
}: MaskedCredentialInputProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className={fieldLabelClassName}>{label}</label>
        {subLabel && <span className={fieldSubLabelClassName}>{subLabel}</span>}
      </div>
      <div className="relative">
        <input
          name={name}
          type={isRevealed ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          data-lpignore="true"
          className={`${fieldInputClassName} pr-10`}
        />
        <button
          type="button"
          onClick={() => setIsRevealed(current => !current)}
          aria-label={isRevealed ? 'Hide credential' : 'Show credential'}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        >
          {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
