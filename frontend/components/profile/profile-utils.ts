import { getChainFamily, type ChainFamily, type SupportedChain } from '@/constants/chains'
import { detectChainFromAddress } from '@/lib/utils'
import type { ConnectedWallet } from '@/types/Profile'

export function resolveWalletForChain(
  wallets: ConnectedWallet[],
  activeChain: SupportedChain
): string | undefined {
  const family = getChainFamily(activeChain)
  if (!family) return undefined

  const byChainType = wallets.find(wallet => wallet.chainType === family)
  if (byChainType) return byChainType.address

  return wallets.find(wallet => familyFromAddress(wallet.address) === family)?.address
}

function familyFromAddress(address: string): ChainFamily | undefined {
  return getChainFamily(detectChainFromAddress(address))
}
