import { SuiClient, SuiHTTPTransport } from '@mysten/sui/client'

// Public Sui RPCs throttle on a per-second sliding window, and a single attack
// fires a burst of ~10 calls (build → execute → wait). The SDK's transport has
// no retry at all — it throws on the first non-2xx — so one 429 mid-burst kills
// the whole flow. Retrying with backoff turns that into a short stall instead.
const MAX_RETRIES = 4
const BASE_DELAY_MS = 400
const MAX_DELAY_MS = 4000

// 429 is the documented rate-limit status; 5xx covers the load-shedding that
// public nodes do instead of a clean 429. Everything else is a real error.
const isRetriableStatus = (status: number) => status === 429 || status >= 500

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Full jitter: without it, the parallel calls inside a single tx.build() retry
// in lockstep and re-trigger the same limit they just backed off from.
const backoffDelay = (attempt: number, retryAfterHeader: string | null) => {
  const retryAfterSeconds = Number(retryAfterHeader)
  if (retryAfterHeader && Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, MAX_DELAY_MS)
  }
  const ceiling = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS)
  return Math.random() * ceiling
}

const retryingFetch = (async (input, init) => {
  let lastResponse: Response | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(backoffDelay(attempt - 1, lastResponse?.headers.get('retry-after') ?? null))
    }

    let response: Response
    try {
      response = await fetch(input, init)
    } catch (error) {
      // Network-level failure (DNS, connection reset). Retry unless we're out of
      // attempts or the caller aborted — an aborted request must stay aborted.
      if (attempt === MAX_RETRIES || (init?.signal?.aborted ?? false)) throw error
      lastResponse = null
      continue
    }

    if (!isRetriableStatus(response.status)) return response

    lastResponse = response
    // The body is never read on a retriable status, so release the connection.
    await response.body?.cancel().catch(() => {})
  }

  // Out of retries — hand the last throttled response back so the SDK raises its
  // own SuiHTTPStatusError and the caller sees the real status code.
  return lastResponse!
}) as typeof fetch

export const createSuiClient = (url: string) =>
  new SuiClient({ transport: new SuiHTTPTransport({ url, fetch: retryingFetch }) })
