'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ConnectWalletLabelProps {
  /** Collapse the text below `md` so cramped headers stay icon-only. */
  compact?: boolean
}

/** Contents of a disconnected "Connect Wallet" button: wallet icon + label. */
export const ConnectWalletLabel = ({ compact }: ConnectWalletLabelProps) => (
  <span className="flex items-center justify-center gap-2">
    <Image
      width={18}
      height={18}
      src="/icons/wallet.png"
      alt=""
      aria-hidden
      className="h-[18px] w-[18px] group-hover:invert"
    />
    <span className={cn(compact && 'hidden md:inline')}>Connect Wallet</span>
  </span>
)
