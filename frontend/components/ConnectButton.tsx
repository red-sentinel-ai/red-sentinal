'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wallet, Copy, CheckCircle, LogOut, ChevronDown, User } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)

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
      setIsLoading(true)

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
        setIsLoading(false)
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
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1B1F] rounded-full border border-[#383838] hover:border-[#4c4c4c] transition-colors">
          <Wallet className="h-4 w-4" />
          <span>
            <span className="hidden sm:inline">{formatAddress(account.address)}</span>
            <span className="sm:hidden">{formatAddress(account.address)}</span>
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 sm:w-72">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-3 flex justify-between">
          <div className="text-xs font-medium text-muted">Balance</div>
          <span className="text-xs font-bold">
            {isLoading ? 'loading...' : <>{suiBalance?.toFixed(4)} SUI</>}
          </span>
        </div>

        <DropdownMenuSeparator />

        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={handleCopy}
          className="cursor-pointer"
        >
          {copied ? (
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>Copy Address</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a
            href={SUI_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <span className="text-xs">Get SUI from Faucet</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
