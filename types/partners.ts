/** Public partner-application intake contract (WO-2, blueprint:
 * Campaign Console and Assisted Launch). Shared by the /partners form,
 * the intake API route, and the team notification email. */

export type PartnerApplicationInput = {
  project_name: string
  contact_name: string
  email: string
  telegram_handle: string
  campaign_goal: string
}

/** Field-level validation errors keyed by PartnerApplicationInput field. */
export type PartnerApplicationFieldErrors = Partial<Record<keyof PartnerApplicationInput, string>>

export type PartnerApplicationReceipt = {
  application_id: string
  status: 'pending_review'
  submitted_at: string
}

export type PartnerApplicationSuccessResponse = {
  success: true
  application: PartnerApplicationReceipt
}

export type PartnerApplicationErrorResponse = {
  success: false
  error: string
  fields?: PartnerApplicationFieldErrors
}

export type PartnerApplicationResponse =
  | PartnerApplicationSuccessResponse
  | PartnerApplicationErrorResponse
