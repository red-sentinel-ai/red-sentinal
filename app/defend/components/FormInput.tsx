'use client'

import type { DefendFormData } from '../hooks/useDefendForm'

interface FormInputProps {
  label: string
  subLabel?: string
  name: keyof DefendFormData
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
  isTextarea?: boolean
  rightElement?: React.ReactNode
  className?: string
  min?: string
  step?: string
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  subLabel,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false,
  isTextarea = false,
  rightElement,
  className = '',
  min,
  step,
}) => {
  const InputComponent = isTextarea ? 'textarea' : 'input'

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              {label}
            </label>
            {rightElement}
          </div>
          {subLabel && (
            <span className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {subLabel}
            </span>
          )}
        </div>
      </div>

      <InputComponent
        name={name}
        type={isTextarea ? undefined : type}
        value={value}
        onChange={onChange}
        className={`font-body w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] transition-all focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] ${
          isTextarea ? 'min-h-[120px] resize-y' : 'h-9'
        }`}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        spellCheck="false"
        {...(!isTextarea && min ? { min } : {})}
        {...(!isTextarea && step ? { step } : {})}
      />
      {error && <p className="font-body mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}
