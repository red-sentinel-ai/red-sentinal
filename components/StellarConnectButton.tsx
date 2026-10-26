'use client'

import { useEffect, useState, type RefObject } from 'react'
import posthog from 'posthog-js'
import { toast } from '@/lib/toast'
import { STELLAR_NETWORK } from '@/constants/stellar'
import { cn, truncateAddress } from '@/lib/utils'
import { useStellarWallet } from '@/hooks/useStellarWallet'
import { useStellarBalance } from '@/hooks/useStellarBalance'
import { ConnectWalletLabel } from '@/components/ConnectWalletLabel'
import { WalletDropdown } from '@/components/WalletDropdown'

/**
 * Stellar connect button — Freighter is the only supported Stellar wallet, so
 * clicking connects straight to the extension popup instead of a wallet picker.
 */
export function StellarConnectButton({
  compact,
  anchorRef,
  className,
}: {
  compact?: boolean
  anchorRef?: RefObject<HTMLElement | null>
  className?: string
}) {
  const { address, connect, disconnect } = useStellarWallet()
  const { balance, isLoading: isLoadingBalance } = useStellarBalance()
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (address) {
      posthog.identify(address)
      posthog.capture('wallet_connected', {
        address,
        chain: `stellar:${STELLAR_NETWORK}`,
      })
    } else {
      posthog.reset()
    }
  }, [address])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect Freighter wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  if (!address) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        aria-label="Connect Wallet"
        className={cn(
          'rs-connect-button group py-2',
          compact ? 'px-3 md:min-w-[180px] md:px-6' : 'min-w-[180px] px-6',
          isConnecting && 'opacity-50',
          className
        )}
      >
        <ConnectWalletLabel compact={compact} />
      </button>
    )
  }

  return (
    <WalletDropdown
      address={truncateAddress(address)}
      rawAddress={address}
      balanceLabel={`${balance?.toFixed(4) ?? '0.0000'} XLM`}
      isLoadingBalance={isLoadingBalance}
      onDisconnect={disconnect}
      compact={compact}
      anchorRef={anchorRef}
    />
  )
}
