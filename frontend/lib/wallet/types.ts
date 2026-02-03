import { Transaction } from '@mysten/sui/transactions'
import { SuiTransactionBlockResponse } from '@mysten/sui/client'

export type WalletType = 'slush' | 'privy' | null

export interface UnifiedWallet {
  address: string | null
  type: WalletType
  isConnected: boolean
}

export interface WalletContextValue {
  wallet: UnifiedWallet
  connect: (type: WalletType) => Promise<void>
  disconnect: () => Promise<void>
  signAndExecuteTransaction: (
    tx: Transaction,
    options?: {
      showRawEffects?: boolean
      showObjectChanges?: boolean
    }
  ) => Promise<SuiTransactionBlockResponse>
  isReady: boolean
}
