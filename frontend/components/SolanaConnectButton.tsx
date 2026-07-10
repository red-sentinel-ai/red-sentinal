'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { SOLANA_CLUSTER } from '@/constants/solana'
import { cn, truncateAddress } from '@/lib/utils'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import { useSolanaBalance } from '@/hooks/useSolanaBalance'
import { ConnectWalletLabel } from '@/components/ConnectWalletLabel'
import { WalletDropdown } from '@/components/WalletDropdown'

export function SolanaConnectButton({ compact }: { compact?: boolean }) {
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
        aria-label="Connect Wallet"
        className={cn(
          'rs-connect-button group py-2',
          compact ? 'px-3 md:min-w-[180px] md:px-6' : 'min-w-[180px] px-6'
        )}
      >
        <ConnectWalletLabel compact={compact} />
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
      compact={compact}
    />
  )
}
