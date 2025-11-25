'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, CheckCircle, LogOut, ChevronDown, User, Loader2 } from 'lucide-react'
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
import { SUI_FAUCET_URL } from '@/constants'
import Image from 'next/image'

export const client = new SuiClient({ url: getFullnodeUrl('testnet') })

export const ConnectButton = () => {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const [copied, setCopied] = useState(false)
  const [suiBalance, setSuiBalance] = useState<number | undefined>()
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

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
        chain: 'sui:testnet',
      })
    } else {
      posthog.reset()
    }
  }, [account?.address])

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) return
      setIsLoadingBalance(true)
      try {
        const coins = await client.getCoins({
          owner: account.address,
          coinType: '0x2::sui::SUI',
        })
        const totalBalance = coins.data.reduce((sum, coin) => sum + Number(coin.balance), 0)
        setSuiBalance(totalBalance / 10 ** 9)
      } catch (error) {
        console.error('Error fetching SUI balance:', error)
      } finally {
        setIsLoadingBalance(false)
      }
    }
    fetchBalance()
  }, [account?.address])

  if (!account) {
    return <SuiConnectButton className="min-w-[180px]" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-black text-black hover:bg-gray-100 transition-colors group">
          <Image
            width={31}
            height={31}
            src="/icons/wallet.png"
            alt="wallet icon"
          />
          <span className="text-sm font-medium">
            <span className="hidden sm:inline">{formatAddress(account.address)}</span>
            <span className="sm:hidden">{formatAddress(account.address)}</span>
          </span>
          <ChevronDown className="h-4 w-4 transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 sm:w-72 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-2 text-black"
        align="end"
      >
        <DropdownMenuLabel className="text-lg font-bold text-black px-2 pt-2">
          My Wallet
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />

        <div className="px-4 py-3 flex justify-between items-center">
          <div className="text-sm font-medium text-gray-600">Balance</div>
          <span className="text-base font-bold text-black flex items-center gap-2">
            {isLoadingBalance ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <>{suiBalance?.toFixed(4)} SUI</>
            )}
          </span>
        </div>

        <DropdownMenuSeparator className="bg-gray-200" />

        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors">
            <User className="h-4 w-4 text-gray-700" />
            <span className="text-gray-800">Profile</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={handleCopy}
          className="cursor-pointer flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors"
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
          className="cursor-pointer flex items-center gap-2 text-red-600 hover:text-red-700 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 rounded-lg px-4 py-2 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200" />

        <DropdownMenuItem asChild>
          <a
            href={SUI_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm text-blue-600 hover:bg-blue-50 transition-colors group"
          >
            Get SUI from Faucet
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
