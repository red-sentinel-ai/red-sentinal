'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wallet, Copy, CheckCircle, LogOut, ChevronDown, User, Loader2 } from 'lucide-react'
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
    return <SuiConnectButton />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1A1B1F] rounded-full border border-[#383838] hover:border-[#4c4c4c] transition-colors group">
          <Wallet className="h-4 w-4 text-[#558EB4] group-hover:text-[#1388D5] transition-colors" />
          <span className="text-white text-sm font-medium">
            <span className="hidden sm:inline">{formatAddress(account.address)}</span>
            <span className="sm:hidden">{formatAddress(account.address)}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 sm:w-72 bg-[#12121266] backdrop-blur-xl border border-[#383838] rounded-2xl p-2 text-white"
        align="end"
      >
        <DropdownMenuLabel className="text-lg font-bold text-white px-2 pt-2">
          My Wallet
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#383838]" />

        <div className="px-4 py-3 flex justify-between items-center">
          <div className="text-sm font-medium text-gray-400">Balance</div>
          <span className="text-base font-bold text-white flex items-center gap-2">
            {isLoadingBalance ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <>{suiBalance?.toFixed(4)} SUI</>
            )}
          </span>
        </div>

        <DropdownMenuSeparator className="bg-[#383838]" />

        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-[#558EB4] focus:text-[#558EB4] hover:bg-[#1a1b1f] focus:bg-[#1a1b1f] rounded-lg px-4 py-2 transition-colors">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={handleCopy}
          className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-[#558EB4] focus:text-[#558EB4] hover:bg-[#1a1b1f] focus:bg-[#1a1b1f] rounded-lg px-4 py-2 transition-colors"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>Copy Address</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer flex items-center gap-2 text-red-500 hover:text-red-400 focus:text-red-400 hover:bg-[#1a1b1f] focus:bg-[#1a1b1f] rounded-lg px-4 py-2 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#383838]" />

        <DropdownMenuItem asChild>
          <a
            href={SUI_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1B1F] rounded-full border border-[#383838] hover:border-[#4c4c4c] transition-colors group"
          >
            Get SUI from Faucet
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
