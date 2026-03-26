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
        chain: `sui:${APP_NETWORK}`,
      })
    } else {
      posthog.reset()
    }
  }, [account?.address])

  if (!account) {
    return (
      <SuiConnectButton 
        className="min-w-[180px] !bg-gradient-to-r !from-primary !to-primary-container !text-on-primary !border-0 !rounded-full !font-display !font-semibold hover:!shadow-glow-primary transition-all" 
      />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-4 py-2 text-on-surface transition-all hover:border-outline hover:bg-surface-container-high">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/>
            </svg>
          </div>
          <span className="font-display text-sm font-medium">
            <span className="hidden sm:inline">{formatAddress(account.address)}</span>
            <span className="sm:hidden">{formatAddress(account.address)}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-on-surface-variant transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-2xl border border-outline-variant bg-surface-container-high/95 p-2 text-on-surface shadow-ambient backdrop-blur-glass sm:w-72"
        align="end"
      >
        <DropdownMenuLabel className="font-display px-2 pt-2 text-lg font-bold text-on-surface">
          My Wallet
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-outline-variant" />

        <div className="flex items-center justify-between px-4 py-3">
          <div className="font-display text-sm font-medium text-on-surface-variant">Balance</div>
          <span className="flex items-center gap-2 font-display text-base font-bold text-primary">
            {isLoadingBalance ? (
              <Skeleton className="h-5 w-24 bg-surface-container" />
            ) : (
              <>{suiBalance.toFixed(4)} SUI</>
            )}
          </span>
        </div>

        <DropdownMenuSeparator className="bg-outline-variant" />

        <Link href="/profile">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-surface-container focus:bg-surface-container">
            <User className="h-4 w-4 text-primary" />
            <span className="text-on-surface">Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link href={`${SUI_SENTINEL_DOCS_URL}guides/bridging-funds`} target="_blank">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-surface-container focus:bg-surface-container">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            <span className="text-on-surface">Bridge Funds</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={handleCopy}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-surface-container focus:bg-surface-container"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4 text-primary" />
          )}
          <span className="text-on-surface">Copy Address</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => disconnect()}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-tertiary transition-colors hover:bg-tertiary/10 hover:text-tertiary focus:bg-tertiary/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
