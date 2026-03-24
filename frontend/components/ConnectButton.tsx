'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, CheckCircle, LogOut, ChevronDown, User, ArrowLeftRight } from 'lucide-react'
import posthog from 'posthog-js'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  useCurrentAccount,
  useDisconnectWallet,
  ConnectButton as SuiConnectButton,
} from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { APP_NETWORK, SUI_SENTINEL_DOCS_URL, SUI_TOKEN } from '@/constants'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useTokenBalance } from '@/hooks/useTokenBalance'

export const client = new SuiClient({ url: getFullnodeUrl(APP_NETWORK) })

export const ConnectButton = () => {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const [copied, setCopied] = useState(false)
  const { balance: suiBalance, isLoading: isLoadingBalance } = useTokenBalance(
    SUI_TOKEN.coinType,
    SUI_TOKEN.decimals
  )

  const handleCopy = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (account?.address) {
      posthog.identify(account.address)

      posthog.capture('wallet_connected', {
        address: account.address,
        //TODO: make this testnet dynamic when integrate mainnet
        chain: `sui:${APP_NETWORK}`,
      })
    } else {
      posthog.reset()
    }
  }, [account?.address])

  if (!account) {
    return <SuiConnectButton className="min-w-[180px]" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 rounded-full border border-black px-4 py-2 text-black transition-colors hover:bg-gray-100">
          <Image width={31} height={31} src="/icons/wallet.png" alt="wallet icon" />
          <span className="text-sm font-medium">
            <span className="hidden sm:inline">{formatAddress(account.address)}</span>
            <span className="sm:hidden">{formatAddress(account.address)}</span>
          </span>
          <ChevronDown className="h-4 w-4 transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-2xl border border-gray-200 bg-white/80 p-2 text-black backdrop-blur-xl sm:w-72"
        align="end"
      >
        <DropdownMenuLabel className="px-2 pt-2 text-lg font-bold text-black">
          My Wallet
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />

        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-medium text-gray-600">Balance</div>
          <span className="flex items-center gap-2 text-base font-bold text-black">
            {isLoadingBalance ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <>{suiBalance.toFixed(4)} SUI</>
            )}
          </span>
        </div>

        <DropdownMenuSeparator className="bg-gray-200" />

        <Link href="/profile">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-gray-100">
            <User className="h-4 w-4 text-gray-700" />
            <span className="text-gray-800">Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link href={`${SUI_SENTINEL_DOCS_URL}guides/bridging-funds`} target="_blank">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-gray-100">
            <ArrowLeftRight className="h-4 w-4 text-gray-700" />
            <span className="text-gray-800">Bridge Funds</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={handleCopy}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-gray-100"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-gray-700" />
          )}
          <span className="text-gray-800">Copy Address</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => disconnect()}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
