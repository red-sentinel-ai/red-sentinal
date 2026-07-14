'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useChainId, useSwitchChain } from 'wagmi'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { useEVMBalance } from '@/hooks/useEVMBalance'
import { ConnectWalletLabel } from '@/components/ConnectWalletLabel'
import { WalletDropdown } from '@/components/WalletDropdown'
import { cn, truncateAddress } from '@/lib/utils'
import { getEvmChainKey, getEvmChainIdForActive } from '@/constants/chains'
import { getNativeToken } from '@/constants/tokens'
import { APP_NETWORK } from '@/constants/shared'
import { useActiveChain } from '@/context/ActiveChainContext'

export function EVMConnectButton({ compact }: { compact?: boolean }) {
  const { address, isConnected, disconnect } = useEVMWallet()
  const { openConnectModal } = useConnectModal()
  const { balance, isLoading: isLoadingBalance } = useEVMBalance()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { activeChain } = useActiveChain()
  const intendedChainId = getEvmChainIdForActive(activeChain, APP_NETWORK as 'testnet' | 'mainnet')

  // When the user picks a different EVM chain in the header selector while a
  // wallet is connected, push wagmi to switch to the matching chainId so all
  // hooks resolve against the right contract.
  useEffect(() => {
    if (!isConnected || !intendedChainId) return
    if (chainId !== intendedChainId) {
      switchChain({ chainId: intendedChainId })
    }
  }, [isConnected, chainId, intendedChainId, switchChain])

  useEffect(() => {
    if (address) {
      posthog.identify(address)
      posthog.capture('wallet_connected', {
        address,
        chain: `evm:${getEvmChainKey(chainId) ?? 'unknown'}:${chainId}`,
      })
    } else {
      posthog.reset()
    }
  }, [address, chainId])

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
