'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { useEVMBalance } from '@/hooks/useEVMBalance'
import { useEvmChain } from '@/hooks/evm/useEvmChain'
import { ConnectWalletLabel } from '@/components/ConnectWalletLabel'
import { WalletDropdown } from '@/components/WalletDropdown'
import { cn, truncateAddress } from '@/lib/utils'
import { getNativeToken } from '@/constants/tokens'
import { useActiveChain } from '@/context/ActiveChainContext'

export function EVMConnectButton({ compact }: { compact?: boolean }) {
  const { address, isConnected, disconnect } = useEVMWallet()
  const { openConnectModal } = useConnectModal()
  const { balance, isLoading: isLoadingBalance } = useEVMBalance()
  const { walletChainId, walletChainKey } = useEvmChain()
  const { activeChain } = useActiveChain()


  useEffect(() => {
    if (address) {
      posthog.identify(address)
      posthog.capture('wallet_connected', {
        address,
        chain: `evm:${walletChainKey ?? 'unknown'}:${walletChainId}`,
      })
    } else {
      posthog.reset()
    }
  }, [address, walletChainId, walletChainKey])

  if (!isConnected || !address) {
    return (
      <button
        onClick={openConnectModal}
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

  const nativeSymbol = getNativeToken(activeChain).symbol

  return (
    <WalletDropdown
      address={truncateAddress(address)}
      rawAddress={address}
      balanceLabel={`${balance?.toFixed(4) ?? '0.0000'} ${nativeSymbol}`}
      isLoadingBalance={isLoadingBalance}
      onDisconnect={disconnect}
      compact={compact}
    />
  )
}
