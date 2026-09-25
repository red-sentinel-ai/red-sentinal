import type { ReactNode } from 'react'

/** Labeled form field with inline error for the dark partner theme. */
export function PartnerFormField({
  label,
  htmlFor,
  error,
  required = true,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="font-body mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]"
      >
        {label}
        {required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
      </label>
      {children}
      {error && (
        <p className="font-body mt-2 text-xs font-medium text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
