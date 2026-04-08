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
  labelClassName?: string
  subLabelClassName?: string
  inputClassName?: string
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
  labelClassName = '',
  subLabelClassName = '',
  inputClassName = '',
}) => {
  const InputComponent = isTextarea ? 'textarea' : 'input'

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <label className={`text-[20px] font-medium leading-tight text-black ${labelClassName}`}>
              {label}
            </label>
            {rightElement}
          </div>
          {subLabel && (
            <span className={`mt-1 text-[16px] font-normal text-[#5E5E5E] ${subLabelClassName}`}>
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
        className={`w-full rounded-xl border bg-transparent p-4 text-[16px] text-black placeholder-gray-400 transition-all focus:outline-none focus:ring-1 sm:text-base ${
          isTextarea ? 'min-h-[200px] resize-none' : 'h-[56px] sm:h-[65px]'
        } ${inputClassName}`}
        style={{
          borderColor: 'var(--jp-dark-pink)',
        }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        spellCheck="false"
        {...(!isTextarea && min ? { min } : {})}
        {...(!isTextarea && step ? { step } : {})}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
