import { SUI_SENTINEL_API_URL } from '@/constants'

export type ChainType = 'sui' | 'evm' | 'solana'

export type WalletConnection = {
  id: string
  chain_type: ChainType
  chain_id: string | null
  wallet_address: string
  is_primary: boolean
  connected_at: string
}

export type SocialConnection = {
  id: string
  platform: string
  platform_user_id: string
  platform_username: string | null
  platform_avatar_url: string | null
  connected_at: string
}

export type UserProfile = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  total_points: number
  lifetime_points: number
  rewards_tier: string
  email_notifications: boolean
  created_at: string
  wallets: WalletConnection[]
  social_connections: SocialConnection[]
}

export type GetNonceRequest = {
  chain_type: ChainType
  chain_id?: string | null
  wallet_address: string
}

export type GetNonceResponse = {
  nonce: string
  message: string
  expires_at: number
}

export type WalletConnectRequest = {
  chain_type: ChainType
  chain_id?: string | null
  wallet_address: string
  message: string
  signature: string
}

export type WalletConnectResponse = {
  status: 'logged_in' | 'created' | 'wallet_added' | 'wallet_linked'
  is_new_user: boolean
  user: UserProfile
}

export type AddWalletResponse = {
  status: 'wallet_added' | 'already_connected'
  wallet: WalletConnection
}

export type LookupResponse = {
  exists: boolean
  user_id: string | null
}

// Email verification types
export type SendEmailCodeRequest = {
  email: string
}

export type SendEmailCodeResponse = {
  success: boolean
  expires_in: number
}

export type EmailVerifyRequest = {
  email: string
  code: string
}

export type EmailVerifyResponse = {
  status: 'email_connected'
  user: UserProfile
}

// Telegram verification types
export type TelegramVerifyRequest = {
  code: string
}

export type TelegramVerifyResponse = {
  status: 'telegram_connected'
  user: UserProfile
}

// Remove wallet/social types
export type RemoveWalletResponse = {
  status: 'wallet_removed'
}

export type RemoveSocialResponse = {
  status: 'social_removed'
}

// Followers / following types
export type FollowCounts = {
  followers: number
  following: number
  viewer_is_following: boolean
}

export type FollowListUser = {
  user_id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  wallet_addresses: string[]
  twitter_username: string | null
  twitter_avatar: string | null
  is_following: boolean
}

export type FollowListResponse = {
  users: FollowListUser[]
  total: number
  limit: number
  offset: number
}

const AUTH_BASE_URL = `${SUI_SENTINEL_API_URL}/auth`
const SOCIAL_BASE_URL = `${SUI_SENTINEL_API_URL}/social`

class AuthApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AuthApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new AuthApiError(response.status, data.message || 'Request failed', data.code)
  }

  return data as T
}

/**
 * Get a nonce and message to sign for wallet verification
 */
export async function getNonce(request: GetNonceRequest): Promise<GetNonceResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/nonce`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  return handleResponse<GetNonceResponse>(response)
}

/**
 * Connect wallet with signature verification
 * Creates user if new, logs in if existing
 */
export async function walletConnect(request: WalletConnectRequest): Promise<WalletConnectResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/wallet-connect`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  return handleResponse<WalletConnectResponse>(response)
}

/**
 * Add a new wallet to the logged-in user
 */
export async function addWallet(
  userId: string,
  request: WalletConnectRequest
): Promise<AddWalletResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/wallet`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(request),
  })

  return handleResponse<AddWalletResponse>(response)
}

/**
 * Remove a wallet from the user's account
 */
export async function removeWallet(userId: string, walletId: string): Promise<RemoveWalletResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/wallet/${walletId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'x-user-id': userId,
    },
  })

  return handleResponse<RemoveWalletResponse>(response)
}

/**
 * Get user profile with all wallets and social connections
 */
export async function getProfile(userId: string): Promise<{ user: UserProfile }> {
  const response = await fetch(`${AUTH_BASE_URL}/profile`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'x-user-id': userId,
    },
  })

  return handleResponse<{ user: UserProfile }>(response)
}

/**
 * Check if a wallet is already registered
 */
export async function lookupWallet(
  chainType: ChainType,
  walletAddress: string,
  chainId?: string
): Promise<LookupResponse> {
  const params = new URLSearchParams({
    chain_type: chainType,
    wallet_address: walletAddress,
  })

  if (chainId) {
    params.set('chain_id', chainId)
  }

  const response = await fetch(`${AUTH_BASE_URL}/lookup?${params}`, {
    method: 'GET',
    credentials: 'include',
  })

  return handleResponse<LookupResponse>(response)
}

/**
 * Send a 4-digit verification code to email
 */
export async function sendEmailCode(
  userId: string,
  request: SendEmailCodeRequest
): Promise<SendEmailCodeResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/email/send-code`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(request),
  })

  return handleResponse<SendEmailCodeResponse>(response)
}

/**
 * Verify email code and connect email to user account
 */
export async function verifyEmail(
  userId: string,
  request: EmailVerifyRequest
): Promise<EmailVerifyResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/email/verify`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(request),
  })

  return handleResponse<EmailVerifyResponse>(response)
}

/**
 * Verify telegram code and connect telegram to user account
 */
export async function verifyTelegram(
  userId: string,
  request: TelegramVerifyRequest
): Promise<TelegramVerifyResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/telegram/verify`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(request),
  })

  return handleResponse<TelegramVerifyResponse>(response)
}

/**
 * Remove a social connection from user account
 */
export async function removeSocial(
  userId: string,
  connectionId: string
): Promise<RemoveSocialResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/social/${connectionId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'x-user-id': userId,
    },
  })

  return handleResponse<RemoveSocialResponse>(response)
}

/**
 * Check if user has an active session via cookie
 */
export type SessionResponse = {
  authenticated: boolean
  user: UserProfile | null
}

export async function checkSession(): Promise<SessionResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/session`, {
    method: 'GET',
    credentials: 'include',
  })

  return handleResponse<SessionResponse>(response)
}

/**
 * Logout and clear session cookie
 */
export async function logout(): Promise<void> {
  await fetch(`${AUTH_BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

/**
 * Follow another user. `userId` is the authenticated actor (sent as x-user-id).
 */
export async function followUser(userId: string, followingId: string): Promise<void> {
  const response = await fetch(`${SOCIAL_BASE_URL}/follow`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ following_id: followingId }),
  })

  await handleResponse<{ status: string }>(response)
}

/**
 * Unfollow a user.
 */
export async function unfollowUser(userId: string, followingId: string): Promise<void> {
  const response = await fetch(`${SOCIAL_BASE_URL}/follow/${followingId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'x-user-id': userId,
    },
  })

  await handleResponse<{ status: string }>(response)
}

/**
 * Follower / following counts for a user, plus whether the viewer follows them.
 * `identifier` is a user id (uuid) or username.
 */
export async function getFollowCounts(
  identifier: string,
  viewerId?: string
): Promise<FollowCounts> {
  const url = new URL(`${SOCIAL_BASE_URL}/${identifier}/counts`)
  if (viewerId) url.searchParams.set('viewerId', viewerId)

  const response = await fetch(url.toString(), { credentials: 'include' })
  return handleResponse<FollowCounts>(response)
}

type FollowListParams = {
  limit?: number
  offset?: number
  viewerId?: string
}

async function fetchFollowList(
  identifier: string,
  direction: 'followers' | 'following',
  { limit = 20, offset = 0, viewerId }: FollowListParams
): Promise<FollowListResponse> {
  const url = new URL(`${SOCIAL_BASE_URL}/${identifier}/${direction}`)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('offset', String(offset))
  if (viewerId) url.searchParams.set('viewerId', viewerId)

  const response = await fetch(url.toString(), { credentials: 'include' })
  return handleResponse<FollowListResponse>(response)
}

/**
 * List the users who follow `identifier`.
 */
export async function getFollowers(
  identifier: string,
  params: FollowListParams = {}
): Promise<FollowListResponse> {
  return fetchFollowList(identifier, 'followers', params)
}

/**
 * List the users `identifier` is following.
 */
export async function getFollowing(
  identifier: string,
  params: FollowListParams = {}
): Promise<FollowListResponse> {
  return fetchFollowList(identifier, 'following', params)
}

export { AuthApiError }
