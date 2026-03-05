'use client'

import { useState } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui'
import { generateReferralLink } from '@/lib/earn-utils'

interface ReferralLinkGeneratorProps {
  walletAddress: string | null
  referredCount: number
  convertedCount: number
  totalEarned: number
}

export function ReferralLinkGenerator({
  walletAddress,
  referredCount,
  convertedCount,
  totalEarned,
}: ReferralLinkGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const referralLink = walletAddress ? generateReferralLink(walletAddress) : ''

  const handleCopy = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: 'twitter' | 'telegram' | 'discord') => {
    if (!referralLink) return

    const text = 'Check out Sui Sentinel - earn SENTINEL tokens by attacking and defending AI agents!'
    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(referralLink)

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      discord: referralLink, // Discord doesn't have direct share URL
    }

    if (platform === 'discord') {
      handleCopy()
      toast.info('Link copied! Share it in Discord.')
    } else {
      window.open(urls[platform], '_blank', 'width=550,height=420')
    }
  }

  const getTierInfo = () => {
    if (referredCount >= 500) return { tier: '500+', bonus: '+200% (3x)', color: 'text-yellow-600' }
    if (referredCount >= 100) return { tier: '100+', bonus: '+100% (2x)', color: 'text-orange-600' }
    if (referredCount >= 50) return { tier: '50+', bonus: '+50%', color: 'text-purple-600' }
    if (referredCount >= 10) return { tier: '10+', bonus: '+25%', color: 'text-blue-600' }
    return { tier: '0-9', bonus: 'Base', color: 'text-gray-600' }
  }

  const tierInfo = getTierInfo()

  if (!walletAddress) {
    return (
      <Card className="rounded-2xl border-gray-200 bg-white">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Share2 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-black">Connect Wallet</h3>
          <p className="text-sm text-gray-600">
            Connect your wallet to generate your unique referral link
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-gray-200 bg-white">
      <CardContent className="p-6 md:p-8">
        <h3 className="mb-4 text-xl font-bold text-black">Your Referral Link</h3>

        {/* Link Input */}
        <div className="mb-4 flex gap-2">
          <input
            value={referralLink}
            readOnly
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-black"
          />
          <button
            onClick={handleCopy}
            className="btn btn-black flex items-center gap-2 px-4"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium text-gray-500">Share:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50"
            >
              <Image src="/icons/x_black.png" width={16} height={16} alt="Twitter" />
              Twitter
            </button>
            <button
              onClick={() => handleShare('telegram')}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50"
            >
              <Image src="/icons/telegram_black.png" width={16} height={16} alt="Telegram" />
              Telegram
            </button>
            <button
              onClick={() => handleShare('discord')}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50"
            >
              Discord
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Referred</p>
            <p className="text-xl font-bold text-black">{referredCount}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Converted</p>
            <p className="text-xl font-bold text-black">{convertedCount}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Total Earned</p>
            <p className="text-xl font-bold text-black">{totalEarned.toLocaleString()}</p>
          </div>
        </div>

        {/* Tier Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-1 text-xs font-medium text-gray-500">Your Tier</p>
          <p className="text-base font-semibold">
            <span className={tierInfo.color}>{tierInfo.tier} referrals</span>
            <span className="mx-2 text-gray-400">→</span>
            <span className="text-black">All referral Spin Passes {tierInfo.bonus}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
