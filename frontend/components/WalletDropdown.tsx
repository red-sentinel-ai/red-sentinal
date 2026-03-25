'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Copy, CheckCircle, LogOut, ChevronDown, User, ArrowLeftRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { SUI_SENTINEL_DOCS_URL } from '@/constants'

type Props = {
  address: string
  rawAddress: string
  balanceLabel: string
  isLoadingBalance: boolean
  onDisconnect: () => void
}

export function WalletDropdown({ address, rawAddress, balanceLabel, isLoadingBalance, onDisconnect }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(rawAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 rounded-full border border-black px-4 py-2 text-black transition-colors hover:bg-gray-100">
          <Image width={31} height={31} src="/icons/wallet.png" alt="wallet icon" />
          <span className="text-sm font-medium">{address}</span>
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
          <span className="text-base font-bold text-black">
            {isLoadingBalance ? <Skeleton className="h-5 w-24" /> : balanceLabel}
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
          onClick={onDisconnect}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
