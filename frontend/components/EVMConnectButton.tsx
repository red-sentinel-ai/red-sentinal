'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { useEVMBalance } from '@/hooks/useEVMBalance'
import { WalletDropdown } from '@/components/WalletDropdown'
import { truncateAddress } from '@/lib/utils'
import { BNB_CONFIG } from '@/constants/evm'

export function EVMConnectButton() {
  const { address, isConnected, disconnect } = useEVMWallet()
  const { openConnectModal } = useConnectModal()
  const { balance, isLoading: isLoadingBalance } = useEVMBalance()

  useEffect(() => {
    if (address) {
      posthog.identify(address)
      posthog.capture('wallet_connected', {
        address,
        chain: `evm:bnb:${BNB_CONFIG.chainId}`,
      })
    } else {
      posthog.reset()
    }
  }, [address])

  if (!isConnected || !address) {
    return (
      <button
        onClick={openConnectModal}
        className="min-w-[180px] rounded-full bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <WalletDropdown
      address={truncateAddress(address)}
      rawAddress={address}
      balanceLabel={`${balance?.toFixed(4) ?? '0.0000'} BNB`}
      isLoadingBalance={isLoadingBalance}
      onDisconnect={disconnect}
    />
  )
}
