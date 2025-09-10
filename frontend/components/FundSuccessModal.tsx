'use client'
import React from 'react'
import Link from 'next/link'
import { Copy, Twitter, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { Dialog } from '@/components/Dialog'

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
  console.log('sentinelId', sentinelId)
  const sentinelUrl = sentinelId ? `${window.location.origin}/sentinel/${sentinelId}` : ''

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
      className="max-w-[600px]"
    >
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-between">
          <span className="w-6" /> {/* Spacer to center the title */}
          <h2 className="text-2xl font-bold text-center flex-grow">
            Your Sentinel is Live and Ready for Battle!
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-300">
          <span className="font-bold">{agentName}</span> is now guarding{' '}
          <span className="font-bold">{prizePoolAmount} SUI</span>. Share your Sentinel to attract
          attackers and start earning attack fees!
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCopyLink}
            disabled={!sentinelUrl}
            className="w-full bg-gray-700/50 text-white rounded-full py-3 font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </button>
          <button
            onClick={handleShareOnX}
            disabled={!sentinelUrl}
            className="w-full bg-[#1DA1F2] text-white rounded-full py-3 font-medium hover:bg-[#1a91da] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Twitter className="w-4 h-4" />
            Share on X
          </button>
        </div>

        <div className="text-center p-4 bg-[#12121266] rounded-lg">
          <p className="text-sm text-gray-400 mb-3">
            You can manage <span className="font-bold">{agentName}</span> from your Profile,
            including adding more funds or updating instructions.
          </p>
          <Link
            href="/profile"
            passHref
          >
            <button
              onClick={onClose} // Close modal on navigation
              className="w-full sm:w-auto px-6 bg-white text-black rounded-full py-2 font-medium hover:bg-white/90"
            >
              Go to Profile
            </button>
          </Link>
        </div>

        <div className="space-y-2 text-xs text-gray-500">
          <p>
            Earn 30% of every attack fee when challengers test your Sentinel. The more attacks, the
            more you earn!
          </p>
          <p>
            Coming soon: Add NFTs or USDC to your prize pool and earn $SNTL rewards for active
            Sentinels!
          </p>
        </div>
      </div>
    </Dialog>
  )
}
