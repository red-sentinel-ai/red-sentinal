'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, TriangleAlert } from 'lucide-react'

import { SUI_SENTINEL_SUPPORT_EMAIL } from '@/constants'
import { PartnerFormField } from '@/components/partners/PartnerFormField'
import type {
  PartnerApplicationFieldErrors,
  PartnerApplicationInput,
  PartnerApplicationReceipt,
  PartnerApplicationResponse,
} from '@/types/partners'

const EMPTY_INPUT: PartnerApplicationInput = {
  project_name: '',
  contact_name: '',
  email: '',
  telegram_handle: '',
  campaign_goal: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FIELD_META: Array<{
  name: keyof PartnerApplicationInput
  label: string
  placeholder: string
  textarea?: boolean
}> = [
  {
    name: 'project_name',
    label: 'Project name',
    placeholder: 'e.g. SuiSwap Protocol',
  },
  {
    name: 'contact_name',
    label: 'Your name',
    placeholder: 'Who should we reach out to?',
  },
  {
    name: 'email',
    label: 'Email address',
    placeholder: 'you@project.xyz',
  },
  {
    name: 'telegram_handle',
    label: 'Telegram handle',
    placeholder: '@yourhandle',
  },
  {
    name: 'campaign_goal',
    label: 'What do you want the campaign to highlight?',
    placeholder:
      'Tell us about your community and what a challenge around your docs, ecosystem, or lore could look like.',
    textarea: true,
  },
]

function validateInput(values: PartnerApplicationInput): PartnerApplicationFieldErrors {
  const errors: PartnerApplicationFieldErrors = {}

  for (const { name, label } of FIELD_META) {
    if (!values[name].trim()) {
      errors[name] = `${label} is required`
    }
  }
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  return errors
}

export function PartnerApplicationForm() {
  const [values, setValues] = useState<PartnerApplicationInput>(EMPTY_INPUT)
  const [errors, setErrors] = useState<PartnerApplicationFieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<PartnerApplicationReceipt | null>(null)

  const setField = (name: keyof PartnerApplicationInput, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const validationErrors = validateInput(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/partner-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await response.json()) as PartnerApplicationResponse

      if (response.ok && data.success) {
        setReceipt(data.application)
        return
      }

      if (!data.success && data.fields) {
        setErrors(data.fields)
      }
      setSubmitError(
        (!data.success && data.error) || 'Could not submit your application. Please try again.'
      )
    } catch {
      setSubmitError('Network error — please try again, or email us instead.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (receipt) {
    return (
      <div className="border-[var(--color-success)]/40 border bg-[var(--color-success-muted)] p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto size-10 text-[var(--color-success)]" />
        <h3 className="font-display mt-4 text-lg font-bold uppercase tracking-[0.04em] text-white md:text-xl">
          Application received
        </h3>
        <p className="font-body mx-auto mt-3 max-w-md text-xs font-medium leading-relaxed text-[var(--color-text-secondary)] sm:text-sm">
          Your application is in our review queue. The Red Sentinel team will contact you at{' '}
          <span className="text-white">{values.email}</span> to qualify your campaign and walk you
          through the assisted launch.
        </p>
        <p className="font-body mt-4 font-mono text-[10px] tracking-normal text-[var(--color-text-muted)]">
          reference: {receipt.application_id}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {FIELD_META.map(({ name, label, placeholder, textarea }) => (
          <div key={name} className={textarea ? 'sm:col-span-2' : undefined}>
            <PartnerFormField label={label} htmlFor={`partner-${name}`} error={errors[name]}>
              {textarea ? (
                <textarea
                  id={`partner-${name}`}
                  value={values[name]}
                  onChange={event => setField(name, event.target.value)}
                  placeholder={placeholder}
                  rows={5}
                  maxLength={2000}
                  aria-invalid={!!errors[name]}
                  className="font-body w-full resize-y border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-white aria-[invalid=true]:border-[var(--color-danger)]"
                />
              ) : (
                <input
                  id={`partner-${name}`}
                  type={name === 'email' ? 'email' : 'text'}
                  value={values[name]}
                  onChange={event => setField(name, event.target.value)}
                  placeholder={placeholder}
                  maxLength={name === 'email' ? 254 : 120}
                  aria-invalid={!!errors[name]}
                  className="font-body h-11 w-full border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-3 text-sm text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-white aria-[invalid=true]:border-[var(--color-danger)]"
                />
              )}
            </PartnerFormField>
          </div>
        ))}
      </div>

      {submitError && (
        <div className="border-[var(--color-danger)]/40 mt-5 flex items-start gap-3 border bg-[var(--color-danger-muted)] p-4">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--color-danger)]" />
          <p className="font-body text-xs font-medium leading-relaxed text-[var(--color-text-secondary)]">
            {submitError} You can also reach us at{' '}
            <a
              href={`mailto:${SUI_SENTINEL_SUPPORT_EMAIL}`}
              className="text-white underline underline-offset-2 hover:text-[var(--color-text-muted)]"
            >
              {SUI_SENTINEL_SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-body inline-flex items-center gap-2 border border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-black transition-colors hover:bg-transparent hover:text-white disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting…' : 'Submit application'}
          {!isSubmitting && <ArrowRight className="size-3.5" />}
        </button>
        <p className="font-body text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          No account needed. Our team reviews every application before anything goes live.
        </p>
      </div>
    </form>
  )
}
