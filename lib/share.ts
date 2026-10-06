import type { SentinelAttribution } from '@/types/share'

/** X posts are 280 characters. */
export const X_POST_MAX_LENGTH = 280

/**
 * X bills every link as 23 characters regardless of its real length; +1 for
 * the space before it. The URL travels in its own intent parameter, so the
 * post text is budgeted against that fixed cost, not the raw URL length.
 */
const X_URL_BUDGET = 24
const X_TEXT_BUDGET = X_POST_MAX_LENGTH - X_URL_BUDGET

/** Excerpt ceilings for the prompt/reply, tightened when the story runs long. */
const EXCERPT_LIMITS = [72, 48, 32]

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

function cleanHandle(handle?: string | null): string | null {
  const value = handle?.trim().replace(/^@/, '')
  return value || null
}

/** Short speaker tag for the transcript line — first word of the name. */
function sentinelSpeaker(sentinelName: string): string {
  const first = sentinelName.trim().split(/\s+/)[0] || 'Sentinel'
  return /^the$/i.test(first) ? 'Sentinel' : first
}

/**
 * Held-outcome flavor, scaled to how close the attacker got. Mirrors the
 * backend share card's tier sublines — kept in sync by hand since the card
 * builder lives in backend-service.
 */
function heldOutcomeLine(score: number): string {
  if (score >= 80) return 'by a thread'
  if (score >= 50) return 'the wall stood'
  return 'the wall didn\u2019t flinch'
}

function buildAttributionLine(
  attribution?: SentinelAttribution | null
): string | null {
  if (!attribution) return null

  const handle = cleanHandle(attribution.org_x_handle)
  const description = attribution.org_description?.trim()

  if (handle && description) return `@${handle} builds ${description}`
  if (handle) return `Deployed by @${handle}`
  if (description) return `Deployed by ${description}`

  return null
}

function joinSections(sections: (string | null | undefined)[]): string {
  return sections
    .filter((section): section is string => Boolean(section))
    .join('\n\n')
}

/**
 * Builds an editable X post that reads like a field note: the attempt, the
 * transcript (attacker vs. Sentinel), the verdict. Pass `text` and `url` as
 * separate parameters to the X intent URL so X counts its shortened link
 * correctly. The red-team fact lives on the shared image card, not here.
 *
 * When the story exceeds the budget the fit ladder kicks in: tighten the
 * prompt/reply excerpts first, then drop the attribution line. The opening
 * and outcome are only ever touched by the final safety truncation.
 */
export function buildSharePost(options: {
  sentinelName: string
  shortDescription?: string | null
  success: boolean
  score: number
  chainName: string
  challengeUrl: string
  userPrompt: string
  sentinelReply: string
  attribution?: SentinelAttribution | null
}): { text: string; url: string } {
  const {
    sentinelName,
    shortDescription,
    success,
    score,
    chainName,
    challengeUrl,
    userPrompt,
    sentinelReply,
    attribution = null,
  } = options

  const subject = shortDescription?.trim()
  const opening = subject
    ? `I tried to jailbreak ${sentinelName}, ${subject} on ${chainName}.`
    : `I tried to jailbreak ${sentinelName} on ${chainName}.`

  const outcome = success
    ? `It broke. Red Sentinel verified the breach at ${score}/100.`
    : `It held — ${heldOutcomeLine(score)}. ${score}/100.`

  const cta = success
    ? 'Who breaks the next Sentinel? @redsentinel_ai'
    : 'Can you find a better angle? @redsentinel_ai'

  const attributionLine = buildAttributionLine(attribution)
  const speaker = sentinelSpeaker(sentinelName)
  const promptExcerpt = userPrompt.trim()
  const replyExcerpt = sentinelReply.trim()

  const compose = (excerptLimit: number, includeAttribution = true): string =>
    joinSections([
      opening,
      includeAttribution ? attributionLine : null,
      promptExcerpt ? `Me: “${truncate(promptExcerpt, excerptLimit)}”` : null,
      replyExcerpt ? `${speaker}: “${truncate(replyExcerpt, excerptLimit)}”` : null,
      outcome,
      cta,
    ])

  // The skeleton keeps only the story frame; used when even the smallest
  // excerpts cannot fit alongside everything else.
  const composeSkeleton = (includeAttribution: boolean): string =>
    joinSections([
      opening,
      includeAttribution ? attributionLine : null,
      outcome,
      cta,
    ])

  let text = ''
  for (const limit of EXCERPT_LIMITS) {
    text = compose(limit)
    if (text.length <= X_TEXT_BUDGET) return { text, url: challengeUrl }
  }
  // Attribution yields before the transcript does — the excerpts are the story.
  for (const limit of EXCERPT_LIMITS) {
    text = compose(limit, false)
    if (text.length <= X_TEXT_BUDGET) return { text, url: challengeUrl }
  }
  text = composeSkeleton(true)
  if (text.length <= X_TEXT_BUDGET) return { text, url: challengeUrl }

  return { text: truncate(composeSkeleton(false), X_TEXT_BUDGET), url: challengeUrl }
}
