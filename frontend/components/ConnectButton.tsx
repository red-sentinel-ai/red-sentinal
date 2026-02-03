'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, CheckCircle, LogOut, ChevronDown, User, Loader2, Wallet, Mail } from 'lucide-react'
import posthog from 'posthog-js'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { formatAddress } from '@mysten/sui/utils'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { SUI_FAUCET_URL } from '@/constants'
import Image from 'next/image'
import { useWalletContext } from '@/lib/wallet/context'
import { WalletSelector } from './WalletSelector'

export const client = new SuiClient({ url: getFullnodeUrl('testnet') })

export const ConnectButton = () => {
  const { wallet, disconnect } = useWalletContext()
  const [copied, setCopied] = useState(false)
  const [suiBalance, setSuiBalance] = useState<number | undefined>()
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false)

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (wallet.address) {
      posthog.identify(wallet.address)

      posthog.capture('wallet_connected', {
        address: wallet.address,
        wallet_type: wallet.type,
        //TODO: make this testnet dynamic when integrate mainnet
        chain: 'sui:testnet',
      })
    } else {
      posthog.reset()
    }
  }, [wallet.address, wallet.type])

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet.address) return
      setIsLoadingBalance(true)
      try {
        const coins = await client.getCoins({
          owner: wallet.address,
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
  }, [wallet.address])

  if (!wallet.isConnected) {
    return (
      <>
        <button
          onClick={() => setWalletSelectorOpen(true)}
          className="flex min-w-[180px] items-center justify-center gap-2 rounded-full border border-black bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </button>
        <WalletSelector open={walletSelectorOpen} onOpenChange={setWalletSelectorOpen} />
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group flex items-center gap-2 rounded-full border border-black px-4 py-2 text-black transition-colors hover:bg-gray-100">
            {wallet.type === 'privy' ? (
              <Mail className="h-5 w-5 text-purple-600" />
            ) : (
              <Image width={31} height={31} src="/icons/wallet.png" alt="wallet icon" />
            )}
            <span className="text-sm font-medium">
              <span className="hidden sm:inline">{formatAddress(wallet.address!)}</span>
              <span className="sm:hidden">{formatAddress(wallet.address!)}</span>
            </span>
            <ChevronDown className="h-4 w-4 transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 rounded-2xl border border-gray-200 bg-white/80 p-2 text-black backdrop-blur-xl sm:w-72"
          align="end"
        >
          <DropdownMenuLabel className="flex items-center gap-2 px-2 pt-2 text-lg font-bold text-black">
            My Wallet
            {wallet.type === 'privy' && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600">
                Privy
              </span>
            )}
            {wallet.type === 'slush' && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                External
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-200" />

          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm font-medium text-gray-600">Balance</div>
            <span className="flex items-center gap-2 text-base font-bold text-black">
              {isLoadingBalance ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <>{suiBalance?.toFixed(4)} SUI</>
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

          <DropdownMenuSeparator className="bg-gray-200" />

          <DropdownMenuItem asChild>
            <a
              href={SUI_FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50"
            >
              Get SUI from Faucet
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <WalletSelector open={walletSelectorOpen} onOpenChange={setWalletSelectorOpen} />
    </>
  )
}
