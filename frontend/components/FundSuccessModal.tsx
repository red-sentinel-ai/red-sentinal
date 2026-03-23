'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Copy, Twitter, X } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog } from '@/components/Dialog'
import { getDefenderBoosterTier } from '@/lib/earn-utils'
import { BoosterPassBadge } from '@/components/BoosterPassBadge'

export interface FundSuccessModalProps {
  open: boolean
  onClose: () => void
  agentName: string
  prizePoolAmount: string
  sentinelId: string | null
}

export const FundSuccessModal = ({
  open,
  onClose,
  agentName,
  prizePoolAmount,
  sentinelId,
}: FundSuccessModalProps) => {
  const sentinelUrl = sentinelId ? `${window.location.origin}/attack/${sentinelId}` : ''
  const boosterTier = getDefenderBoosterTier(parseFloat(prizePoolAmount) || 0)

  const handleCopyLink = () => {
    if (!sentinelUrl) return
    navigator.clipboard.writeText(sentinelUrl)
    toast.success('Link copied! Share it now.')
  }

  const handleShareOnX = () => {
    const text = `I just deployed ${agentName} on @SuiSentinal with ${prizePoolAmount} SUI! Think you can outsmart it? Try now: ${sentinelUrl}`
    const encodedText = encodeURIComponent(text)
    const hashtags = 'SuiSentinel,Web3,AI'
    const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}&hashtags=${hashtags}`
    window.open(xUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="max-w-[600px] border-gray-200 bg-white text-black"
    >
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-between">
          <span className="w-6" />
          <h2 className="flex-grow text-center text-2xl font-bold">
            Your Sentinel is Live and Ready for Battle!
          </h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-black">
            <X className="h-6 w-6" />
          </button>
        </div>

        <p className="text-gray-600">
          <span className="font-bold text-black">{agentName}</span> is now guarding{' '}
          <span className="font-bold text-black">{prizePoolAmount} SUI</span>. Share your Sentinel
          to attract attackers and start earning attack fees!
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={handleCopyLink}
            disabled={!sentinelUrl}
            className="btn btn-outline flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
          <button
            onClick={handleShareOnX}
            disabled={!sentinelUrl}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1DA1F2] py-3 font-medium text-white transition-colors hover:bg-[#1a91da] disabled:opacity-50"
          >
            <Twitter className="h-4 w-4" />
            Share on X
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="mb-3 text-sm text-gray-500">
            You can manage <span className="font-bold text-black">{agentName}</span> from your
            Profile, including adding more funds or updating instructions.
          </p>
          <Link href="/profile" passHref>
            <button onClick={onClose} className="btn btn-black w-full px-6 sm:w-auto">
              Go to Profile
            </button>
          </Link>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-3">
            <Image
              src="/img/slot_machine_1x.png"
              alt="Slot machine"
              width={32}
              height={42}
              className="h-8 w-8"
            />
            <BoosterPassBadge tierKey={boosterTier} mode="received" />
          </div>
          <Link
            href="/profile?tab=rewards"
            onClick={onClose}
            className="text-xs font-medium text-black underline underline-offset-2 hover:opacity-70"
          >
            Go to Profile → Spin Now
          </Link>
        </div>
      </div>
    </Dialog>
  )
}
