import 'server-only'

import { NextResponse } from 'next/server'

// ── In-memory fixed-window rate limiter ─────────────────────────────────────
// Best-effort per-instance throttling for the open proxy routes (TEE forwards,
// admin-bearer proxies, uploads). State lives in the server process: on
// serverless it is per-lambda-instance, so treat this as abuse mitigation, not
// a hard quota — for strict limits use a shared store (e.g. Upstash Ratelimit).

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Opportunistic sweep so the map doesn't grow without bound; runs at most
// once per sweep interval.
const SWEEP_INTERVAL_MS = 60_000
let lastSweep = 0

function sweep(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

export type RateLimitOptions = {
  /** Logical name for the route — namespaces the counter. */
  name: string
  /** Max requests allowed per window per IP. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

/**
 * Consume one request from the IP's window for this route. Returns a 429
 * response when the limit is breached — return it early from the handler —
 * or null when the request is allowed.
 */
export function rateLimit(request: Request, options: RateLimitOptions): NextResponse | null {
  const now = Date.now()
  sweep(now)

  const key = `${options.name}:${getClientIp(request)}`
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return null
  }

  bucket.count += 1
  if (bucket.count > options.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
    )
  }

  return null
}
