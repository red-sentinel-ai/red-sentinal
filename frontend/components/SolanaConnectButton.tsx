'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { SOLANA_CLUSTER } from '@/constants/solana'
import { truncateAddress } from '@/lib/utils'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import { useSolanaBalance } from '@/hooks/useSolanaBalance'
import { WalletDropdown } from '@/components/WalletDropdown'

export function SolanaConnectButton() {
  const { publicKey, disconnect } = useSolanaWallet()
  const { setVisible } = useWalletModal()
  const { balance, isLoading: isLoadingBalance } = useSolanaBalance()

  const address = publicKey?.toBase58() ?? null

  useEffect(() => {
    if (address) {
      posthog.identify(address)
      posthog.capture('wallet_connected', {
        address,
        chain: `solana:${SOLANA_CLUSTER}`,
      })
    } else {
      posthog.reset()
    }
  }, [address])

  if (!publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="min-w-[180px] rounded-full bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <WalletDropdown
      address={truncateAddress(address!)}
      rawAddress={address!}
      balanceLabel={`${balance?.toFixed(4) ?? '0.0000'} SOL`}
      isLoadingBalance={isLoadingBalance}
      onDisconnect={disconnect}
    />
  )
}
