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
            <label className="font-display text-[20px] font-medium leading-tight text-on-surface">{label}</label>
            {rightElement}
          </div>
          {subLabel && (
            <span className="mt-1 text-[16px] font-normal text-on-surface-variant">{subLabel}</span>
          )}
        </div>
      </div>

      <InputComponent
        name={name}
        type={isTextarea ? undefined : type}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-[16px] text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container/20 sm:text-base font-body ${
          isTextarea ? 'min-h-[200px] resize-none' : 'h-[56px] sm:h-[65px]'
        }`}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        spellCheck="false"
        {...(!isTextarea && min ? { min } : {})}
        {...(!isTextarea && step ? { step } : {})}
      />
      {error && <p className="mt-1 text-sm text-tertiary">{error}</p>}
    </div>
  )
}
