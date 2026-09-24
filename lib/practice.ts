/**
 * Practice-arena client helpers (web2 only — no wallet required).
 *
 * The red-team server identifies an attacker by address and auto-resumes the
 * most recent active session for a given attacker + sentinel. Practice has no
 * wallet, so we mint a stable per-browser identity and persist it in
 * localStorage.
 */

const PRACTICE_ATTACKER_KEY = 'practice_attacker_address'

/** The red-team network practice sentinels live on. */
export const PRACTICE_NETWORK = 'testnet'

/**
 * Returns a stable per-browser practice-attacker address, generating and
 * persisting one on first use. Pass `forceNew` to rotate it, which is how we
 * start a genuinely fresh attack session instead of resuming the previous one.
 */
export function getPracticeAttackerAddress(forceNew = false): string {
  if (typeof window === 'undefined') return 'practice-server'

  if (!forceNew) {
    const existing = window.localStorage.getItem(PRACTICE_ATTACKER_KEY)
    if (existing) return existing
  }

  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2)
  const address = `practice-${random}`
  window.localStorage.setItem(PRACTICE_ATTACKER_KEY, address)
  return address
}
