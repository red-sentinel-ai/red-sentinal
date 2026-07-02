import type { ChainFamily } from '@/constants/chains'

export interface ConnectedWallet {
  address: string
  chainType: ChainFamily
  chainId: string | null
  isPrimary: boolean
}

export interface ProfileViewData {
  userId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  wallets: ConnectedWallet[]
}
