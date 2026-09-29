import { SUI_SENTINEL_API_URL } from '@/constants'

/**
 * Profile Credits API client (WO-8). Talks to the backend credit-claim API
 * (`/credit/*`) with the session cookie plus the `x-user-id` header, the same
 * identity contract as `lib/auth-api.ts`.
 */

const CREDITS_BASE_URL = `${SUI_SENTINEL_API_URL}/credit`

export type CreditEntitlementStatus = 'eligible' | 'processing' | 'claimed' | 'ineligible'

export type CreditClaimStatus = 'processing' | 'claimed' | 'failed'

export type CreditPayoutStatus = 'processing' | 'succeeded' | 'failed'

export type CreditEntitlement = {
  status: CreditEntitlementStatus
  reason: string | null
  claim: {
    claimId: string
    status: CreditClaimStatus
    createdAt: string
  } | null
  payout: {
    payoutId: string
    status: CreditPayoutStatus
    transactionReference: string | null
    completedAt: string | null
  } | null
}

export type CreditAssetView = {
  assetId: string
  token: string
  network: string
  /** Credit amount in the token's smallest unit. */
  amount: number
  purpose: string
  entitlement: CreditEntitlement
}

export type CreditAssetsResponse = {
  assets: CreditAssetView[]
}

export type CreditClaimView = {
  claimId: string
  assetId: string
  walletAddress: string
  status: CreditClaimStatus
  reason: string | null
  createdAt: string
}

export type CreditPayoutView = {
  payoutId: string
  claimId: string
  assetId: string
  amount: number
  recipientWallet: string
  status: CreditPayoutStatus
  transactionReference: string | null
  failureClass: string | null
  failureReason: string | null
  attemptNumber: number
  attemptedAt: string | null
  completedAt: string | null
}

export type ClaimCreditRequest = {
  assetId: string
  walletAddress?: string
}

export type ClaimCreditResponse = {
  claim: CreditClaimView
  payout: CreditPayoutView | null
  duplicate: boolean
}

export type UserClaimsResponse = {
  claims: Array<{
    claim: CreditClaimView
    latestPayout: CreditPayoutView | null
  }>
}

export class CreditsApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public reasonCode?: string
  ) {
    super(message)
    this.name = 'CreditsApiError'
  }
}

async function handleCreditsResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new CreditsApiError(
      response.status,
      data.message || 'Request failed',
      data.reasonCode
    )
  }

  return data as T
}

/** Enabled Credit Assets with the user's entitlement outcome. */
export async function getCreditAssets(userId: string): Promise<CreditAssetsResponse> {
  const response = await fetch(`${CREDITS_BASE_URL}/assets`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'x-user-id': userId },
  })
  return handleCreditsResponse<CreditAssetsResponse>(response)
}

/** The user's own claim history with the latest payout outcome. */
export async function getUserClaims(userId: string): Promise<UserClaimsResponse> {
  const response = await fetch(`${CREDITS_BASE_URL}/claims`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'x-user-id': userId },
  })
  return handleCreditsResponse<UserClaimsResponse>(response)
}

/**
 * Submit a one-time credit claim. Idempotent: submitting again while a claim
 * is processing returns the same claim. Rejections carry a machine-readable
 * `reasonCode` (see `CreditsApiError`).
 */
export async function submitCreditClaim(
  userId: string,
  request: ClaimCreditRequest
): Promise<ClaimCreditResponse> {
  const response = await fetch(`${CREDITS_BASE_URL}/claims`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(request),
  })
  return handleCreditsResponse<ClaimCreditResponse>(response)
}

/** Decimals for human-readable amount formatting, keyed by token symbol. */
const TOKEN_DECIMALS: Record<string, number> = {
  SUI: 9,
  WAL: 9,
  MON: 18,
}

/** Smallest-unit amount → human string (e.g. 1000000000 SUI → "1"). */
export function formatCreditAmount(amount: number, token: string): string {
  const decimals = TOKEN_DECIMALS[token.toUpperCase()] ?? 0
  if (decimals === 0) return amount.toLocaleString('en-US')

  const value = amount / 10 ** decimals
  const formatted = value.toLocaleString('en-US', {
    maximumFractionDigits: 6,
  })
  return value > 0 && value < 0.000001 ? amount.toLocaleString('en-US') : formatted
}

const TX_EXPLORER_BY_NETWORK: Record<string, string> = {
  'sui-mainnet': 'https://suiscan.xyz/mainnet/tx/',
  'sui-testnet': 'https://suiscan.xyz/testnet/tx/',
  'walrus-testnet': 'https://suiscan.xyz/testnet/tx/',
  'monad-testnet': 'https://testnet.monadexplorer.com/tx/',
}

/** Explorer URL for a payout transaction reference, when the network is known. */
export function getTransactionExplorerUrl(
  network: string,
  transactionReference: string | null
): string | null {
  if (!transactionReference) return null
  const base = TX_EXPLORER_BY_NETWORK[network]
  return base ? `${base}${transactionReference}` : null
}
