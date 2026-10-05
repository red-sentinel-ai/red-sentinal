import { getChainFamily, type ChainFamily, type SupportedChain } from '@/constants/chains'
import { detectChainFromAddress } from '@/lib/utils'
import type { ConnectedWallet } from '@/types/Profile'

export function resolveWalletForChain(
  wallets: ConnectedWallet[],
  activeChain: SupportedChain,
  connectedAddress?: string
): string | undefined {
  const family = getChainFamily(activeChain)
  if (!family) return undefined

  // Prefer the wallet the viewer is actually connected with, so a newly linked
  // wallet's data is shown instead of the account's older wallet on the same chain.
  if (connectedAddress) {
    const connected = connectedAddress.toLowerCase()
    const connectedWallet = wallets.find(wallet => wallet.address.toLowerCase() === connected)
    if (connectedWallet && connectedWallet.chainType === family) {
      return connectedWallet.address
    }
  }

  const byChainType = wallets.find(wallet => wallet.chainType === family)
  if (byChainType) return byChainType.address

  return wallets.find(wallet => familyFromAddress(wallet.address) === family)?.address
}

function familyFromAddress(address: string): ChainFamily | undefined {
  return getChainFamily(detectChainFromAddress(address))
}
