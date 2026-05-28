'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useChainId, useSwitchChain } from 'wagmi'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { useEVMBalance } from '@/hooks/useEVMBalance'
import { WalletDropdown } from '@/components/WalletDropdown'
import { truncateAddress } from '@/lib/utils'
import { getEvmChainKey, getEvmNativeSymbol } from '@/constants/evm'
import { getEvmChainIdForActive } from '@/constants/chains'
import { APP_NETWORK } from '@/constants/shared'
import { useActiveChain } from '@/context/ActiveChainContext'

export function EVMConnectButton() {
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
        chain: `evm:${getEvmChainKey(chainId)}:${chainId}`,
      })
    } else {
      posthog.reset()
    }
  }, [address, chainId])

  if (!isConnected || !address) {
    return (
      <button onClick={openConnectModal} className="rs-connect-button min-w-[180px] px-6 py-2">
        Connect Wallet
      </button>
    )
  }

  const nativeSymbol = getEvmNativeSymbol(chainId)

  return (
    <WalletDropdown
      address={truncateAddress(address)}
      rawAddress={address}
      balanceLabel={`${balance?.toFixed(4) ?? '0.0000'} ${nativeSymbol}`}
      isLoadingBalance={isLoadingBalance}
      onDisconnect={disconnect}
    />
  )
}
