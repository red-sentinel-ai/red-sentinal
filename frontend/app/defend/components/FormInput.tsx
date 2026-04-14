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
            <label className="font-display text-lg font-medium leading-tight text-[var(--color-text-primary)] sm:text-xl">
              {label}
            </label>
            {rightElement}
          </div>
          {subLabel && (
            <span className="font-body mt-1 text-sm text-[var(--color-text-secondary)] sm:text-base">
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
        className={`font-body w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] transition-all focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] ${
          isTextarea ? 'min-h-[200px] resize-none' : 'h-[56px] sm:h-[65px]'
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
