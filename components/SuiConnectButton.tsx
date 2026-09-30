'use client'

import { useEffect, type RefObject } from 'react'
import posthog from 'posthog-js'
import {
  useCurrentAccount,
  useDisconnectWallet,
  ConnectButton as DappKitConnectButton,
} from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { APP_NETWORK } from '@/constants'
import { SUI_TOKEN } from '@/constants/tokens'
import { cn } from '@/lib/utils'
import { useSuiTokenBalance } from '@/hooks/useSuiTokenBalance'
import { ConnectWalletLabel } from '@/components/ConnectWalletLabel'
import { WalletDropdown } from '@/components/WalletDropdown'

export function SuiConnectButton({
  compact,
  anchorRef,
}: {
  compact?: boolean
  anchorRef?: RefObject<HTMLElement | null>
}) {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const { balance, isLoading: isLoadingBalance } = useSuiTokenBalance(
    SUI_TOKEN.coinType,
    SUI_TOKEN.decimals
  )

  useEffect(() => {
    if (account?.address) {
      posthog.identify(account.address)
      posthog.capture('wallet_connected', {
        address: account.address,
        chain: `sui:${APP_NETWORK}`,
      })
    } else {
      posthog.reset()
    }
  }, [account?.address])

  if (!account) {
    return (
      <DappKitConnectButton
        className={cn('rs-connect-button group', compact ? 'md:min-w-[180px]' : 'min-w-[180px]')}
        aria-label="Connect Wallet"
        connectText={<ConnectWalletLabel compact={compact} />}
      />
    )
  }

  return (
    <WalletDropdown
      address={formatAddress(account.address)}
      rawAddress={account.address}
      balanceLabel={`${balance.toFixed(4)} SUI`}
      isLoadingBalance={isLoadingBalance}
      onDisconnect={disconnect}
      compact={compact}
      anchorRef={anchorRef}
    />
  )
}
