'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import {
  useCurrentAccount,
  useDisconnectWallet,
  ConnectButton as DappKitConnectButton,
} from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { APP_NETWORK } from '@/constants'
import { SUI_TOKEN } from '@/constants/tokens'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { WalletDropdown } from '@/components/WalletDropdown'

export function SuiConnectButton() {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const { balance, isLoading: isLoadingBalance } = useTokenBalance(
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
    return <DappKitConnectButton className="rs-connect-button min-w-[180px]" />
  }

  return (
    <WalletDropdown
      address={formatAddress(account.address)}
      rawAddress={account.address}
      balanceLabel={`${balance.toFixed(4)} SUI`}
      isLoadingBalance={isLoadingBalance}
      onDisconnect={disconnect}
    />
  )
}
