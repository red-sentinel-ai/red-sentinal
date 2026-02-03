import { useWalletContext } from '@/lib/wallet/context'

export function useUnifiedWallet() {
  const { wallet, isReady } = useWalletContext()

  return {
    address: wallet.address,
    isConnected: wallet.isConnected,
    walletType: wallet.type,
    isReady,
  }
}
