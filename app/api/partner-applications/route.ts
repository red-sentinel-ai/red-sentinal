import { NextRequest, NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { sendPartnerApplicationNotification } from '@/lib/emailUtils'
import type { PartnerApplicationFieldErrors, PartnerApplicationInput } from '@/types/partners'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MAX_LENGTHS: Record<keyof PartnerApplicationInput, number> = {
  project_name: 120,
  contact_name: 120,
  email: 254,
  telegram_handle: 64,
  campaign_goal: 2000,
}

const REQUIRED_FIELDS: Array<keyof PartnerApplicationInput> = [
  'project_name',
  'contact_name',
  'email',
  'telegram_handle',
  'campaign_goal',
]

function validateInput(body: Partial<PartnerApplicationInput>): {
  fields: PartnerApplicationFieldErrors
  value: PartnerApplicationInput | null
} {
  const fields: PartnerApplicationFieldErrors = {}
  const value: Record<string, string> = {}

  for (const field of REQUIRED_FIELDS) {
    const raw = typeof body[field] === 'string' ? (body[field] as string).trim() : ''

    if (!raw) {
      fields[field] = 'This field is required'
      continue
    }
    if (raw.length > MAX_LENGTHS[field]) {
      fields[field] = `Must be ${MAX_LENGTHS[field]} characters or fewer`
      continue
    }
    value[field] = raw
  }

  if (!fields.email && !EMAIL_PATTERN.test(value.email ?? '')) {
    fields.email = 'Enter a valid email address'
  }

  return { fields, value: Object.keys(fields).length ? null : (value as PartnerApplicationInput) }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<PartnerApplicationInput>
    const { fields, value } = validateInput(body)

    if (!value) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted fields and try again.',
          fields,
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_partner_applications')
      .insert({ ...value, status: 'pending_review' })
      .select('application_id, status, submitted_at')
      .single()

    if (error || !data) {
      console.error('Failed to persist partner application:', error)
      return NextResponse.json(
        { success: false, error: 'Could not submit your application. Please try again.' },
        { status: 500 }
      )
    }

    // The record is already saved — a notification failure must not discard
    // the application, so delivery errors are only logged for observability.
    const notification = await sendPartnerApplicationNotification(value, data.application_id)
    if (!notification.success) {
      console.error(
        `Partner application ${data.application_id} was stored but the team notification failed`
      )
    }

    return NextResponse.json(
      {
        success: true,
        application: {
          application_id: data.application_id,
          status: data.status,
          submitted_at: data.submitted_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing partner application:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error while submitting application' },
      { status: 500 }
    )
  }
}
