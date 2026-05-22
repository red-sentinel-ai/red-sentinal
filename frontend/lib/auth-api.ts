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
  email: string | null
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
  status: 'logged_in' | 'created' | 'wallet_added'
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

const AUTH_BASE_URL = `${SUI_SENTINEL_API_URL}/auth`

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
export async function removeWallet(userId: string, walletId: string): Promise<{ status: string }> {
  const response = await fetch(`${AUTH_BASE_URL}/wallet/${walletId}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': userId,
    },
  })

  return handleResponse<{ status: string }>(response)
}

/**
 * Get user profile with all wallets and social connections
 */
export async function getProfile(userId: string): Promise<{ user: UserProfile }> {
  const response = await fetch(`${AUTH_BASE_URL}/profile`, {
    method: 'GET',
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
  })

  return handleResponse<LookupResponse>(response)
}

export { AuthApiError }
