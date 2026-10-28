import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'

// ── Backend session verification ─────────────────────────────────────────────
// The authoritative session is the `ss_session` cookie issued by the backend
// (api.redsentinel.xyz). The backend stores the raw user id, HMAC-signed with
// SESSION_SECRET via the Fastify `cookie-signature` format (`s:<value>.<sig>`,
// base64 with trailing '=' stripped) when SESSION_SECRET is configured — the
// same scheme backend-service/api/shared/session.ts verifies. This module
// mirrors that verification so Next.js route handlers can derive identity
// server-side instead of trusting client-supplied user/wallet fields.
//
// ROLLOUT: the backend now sets the cookie with domain=.redsentinel.xyz in
// production, so it reaches this app on app.redsentinel.xyz once the backend
// change is deployed AND users re-login (the cookie is written at login).
// Until then requests from existing sessions carry no verifiable cookie here.
// Mutating routes use requireSession(), which tolerates a missing cookie and
// returns userId=null until ENFORCE_SERVER_SESSION=true is set in this app's
// environment — flip it after the backend deploy has been live long enough
// for active users to have re-authenticated. SESSION_SECRET must match the
// backend's value in every environment.

export const SESSION_COOKIE_NAME = 'ss_session'

function verifySignedValue(cookieValue: string, secret: string): string | null {
  // Replicates cookie-signature.unsign: strip the `s:` prefix, split at the
  // last '.', recompute the HMAC and compare in constant time.
  if (!cookieValue.startsWith('s:')) return null
  const signed = cookieValue.slice(2)
  const dotIndex = signed.lastIndexOf('.')
  if (dotIndex <= 0) return null

  const value = signed.slice(0, dotIndex)
  const signature = signed.slice(dotIndex + 1)

  const expected = createHmac('sha256', secret).update(value).digest('base64').replace(/=+$/, '')
  const expectedBuf = Buffer.from(expected)
  const actualBuf = Buffer.from(signature)
  if (expectedBuf.length !== actualBuf.length) return null
  if (!timingSafeEqual(expectedBuf, actualBuf)) return null

  return value
}

/**
 * Extract the user id from the incoming request's `ss_session` cookie,
 * verifying the Fastify cookie signature when SESSION_SECRET is configured.
 * Returns null for unauthenticated requests. Never trust client-supplied
 * identity fields when this returns a value — prefer the returned id.
 */
export function getSessionUserId(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map(c => c.trim())
  const sessionCookie = cookies.find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`))
  if (!sessionCookie) return null

  const rawValue = decodeURIComponent(sessionCookie.slice(SESSION_COOKIE_NAME.length + 1))
  if (!rawValue) return null

  const secret = process.env.SESSION_SECRET
  if (secret) {
    return verifySignedValue(rawValue, secret)
  }

  // No shared secret configured — accept the raw value, exactly like the
  // backend does when SESSION_SECRET is unset (local/dev parity).
  return rawValue
}

export type SessionGuardResult = {
  /** Non-null 401/403 response — return it early from the handler. */
  denied: NextResponse | null
  /**
   * The verified session user id, or null when the request carried no
   * verifiable session (only possible while enforcement is off — see
   * SessionGuardOptions.enforce).
   */
  userId: string | null
}

export type SessionGuardOptions = {
  /**
   * When false (default), a missing/invalid session is tolerated: the route
   * keeps working for callers the cookie can't reach yet, and userId is null.
   * Set ENFORCE_SERVER_SESSION=true in the environment (or pass true) once
   * session cookies reach this app in production to turn 401s on.
   */
  enforce?: boolean
  /**
   * Also accept this shared admin token as a bearer credential — for
   * ops/migration endpoints that must work without a browser session.
   */
  adminToken?: string
}

/**
 * Guard a mutating route with server-side identity.
 * - On failure returns `{ denied: NextResponse }` (401/403) — return it early.
 * - On success returns `{ denied: null, userId }` — userId is the verified
 *   session user, or null when not yet enforceable (see the enforce option).
 *   Routes must treat userId === null as "unverified" and fall back to the
 *   legacy client-provided identity until enforcement is switched on.
 */
export function requireSession(request: Request, options: SessionGuardOptions = {}): SessionGuardResult {
  const { enforce = process.env.ENFORCE_SERVER_SESSION === 'true', adminToken } = options

  // Ops override: a valid admin bearer token authorizes the call without a
  // browser session (constant-time comparison).
  if (adminToken) {
    const authHeader = request.headers.get('authorization')
    if (authHeader === `Bearer ${adminToken}`) {
      return { denied: null, userId: null }
    }
  }

  const userId = getSessionUserId(request)

  if (userId) return { denied: null, userId }

  if (enforce) {
    return {
      denied: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      userId: null,
    }
  }

  // Cookie not visible yet (host-only on the API domain) — allow the request
  // through with no verified identity so existing flows keep working.
  console.warn(
    '[session] No verifiable ss_session cookie on a mutating request. ' +
      'Set ENFORCE_SERVER_SESSION=true once session cookies reach the app.'
  )
  return { denied: null, userId: null }
}
