import type { SentinelAttribution, ShareFact } from '@/types/share'

/** X posts are 280 characters; the challenge URL eats into that budget. */
export const X_POST_MAX_LENGTH = 280

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

function pickRandomFact(facts: ShareFact[]): ShareFact | null {
  if (facts.length === 0) return null
  return facts[Math.floor(Math.random() * facts.length)]
}

/**
 * Composes the prefilled (and still editable on X) post text for the share
 * card. Everything is truncated so text + URL stay within X's 280 characters.
 */
export function buildSharePost(options: {
  sentinelName: string
  success: boolean
  score: number
  chainName: string
  challengeUrl: string
  facts?: ShareFact[]
  attribution?: SentinelAttribution | null
}): { text: string; fact: ShareFact | null } {
  const {
    sentinelName,
    success,
    score,
    chainName,
    challengeUrl,
    facts = [],
    attribution = null,
  } = options

  const fact = pickRandomFact(facts)
  const orgLine = attribution
    ? attribution.org_description
      ? ` Deployed by ${attribution.org_description}`
      : ''
    : ''
  const orgHandle =
    attribution?.org_x_handle && attribution.org_x_handle.length > 0
      ? ` (@${attribution.org_x_handle})`
      : ''

  // Lead with the outcome, keep the fact + attribution optional so the post
  // still fits when they are long.
  const headline = success
    ? `I breached ${sentinelName} on ${chainName} — verified jailbreak, ${score}/100. ⚔️`
    : `${sentinelName} on ${chainName} held the line — my best shot scored ${score}/100. 🛡️`

  const urlBudget = X_POST_MAX_LENGTH - challengeUrl.length - 1
  let text = truncate(`${headline}${orgLine}${orgHandle}`, urlBudget)

  if (fact) {
    const withFact = truncate(`${headline}${orgLine}${orgHandle}\n\n${fact.fact}`, urlBudget)
    if (withFact.length <= urlBudget) {
      text = withFact
    } else {
      const shortenedFact = truncate(fact.fact, Math.max(0, urlBudget - text.length - 2))
      if (shortenedFact) {
        text = truncate(`${text}\n\n${shortenedFact}`, urlBudget)
      }
    }
  }

  return { text: `${text}\n${challengeUrl}`, fact }
}
