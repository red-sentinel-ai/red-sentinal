'use client'

import type React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { AlertCircle, ExternalLink, Shield, Sparkles } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useSocialStatus } from '@/hooks/profile/useSocialStatus'
import { handleConnectDiscord, handleConnectTwitter } from '@/utils/socialConnection'

interface RewardsAccessGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RewardsAccessGuard({ children, fallback }: RewardsAccessGuardProps) {
  const account = useCurrentAccount()
  const address = account?.address
  const { data: socialStatus, isLoading } = useSocialStatus(address || undefined)

  const hasTwitter = socialStatus?.isXConnected || false
  const hasDiscord = socialStatus?.isDiscordConnected || false
  const hasAnyConnection = hasTwitter || hasDiscord

  if (isLoading) {
    return (
      <div className="min-h-body flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a]">
        <Card className="w-full max-w-md rounded-2xl border border-[#383838] bg-[#12121266] backdrop-blur-lg">
          <CardContent className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3 text-[#B5B5B5]">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[#558EB4]"></div>
              <span>Checking social connections...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasAnyConnection) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="min-h-body flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] px-4 pb-4 pt-20">
      <motion.div
        className="relative w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="rounded-2xl border border-[#383838] bg-[#12121266] backdrop-blur-lg">
          <CardHeader className="pb-6 text-center">
            <div className="mb-6 flex justify-center">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#8F564E]/20 to-[#E53922]/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Shield className="h-10 w-10 text-[#8F564E]" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl uppercase text-[#B8B8B8]">
              Social Authentication Required
            </CardTitle>
            <p className="mt-2 text-[#B5B5B5]">
              Connect your social accounts to unlock the full Sui Sentinel rewards experience
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="rounded-lg border border-[#383838] bg-[#12121266] p-6 backdrop-blur-lg">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#558EB4]" />
                <h3 className="font-semibold text-white">What you&apos;ll unlock:</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  'Earn points for on-chain activities',
                  'Unlock exclusive rewards and tiers',
                  'Participate in community challenges',
                  'Access to special Discord channels',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-[#558EB4]"></div>
                    <span className="text-sm text-[#B5B5B5]">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-center font-semibold uppercase text-white">
                Choose your connection method:
              </h3>
              <div className="grid gap-4">
                {/* Twitter */}
                <motion.button
                  onClick={() =>
                    handleConnectTwitter(address || undefined, '/rewards?connected=twitter')
                  }
                  className="group relative h-auto overflow-hidden rounded-lg border border-[#383838] bg-[#12121266] p-0 backdrop-blur-lg transition-all duration-300 hover:border-[#558EB4]/50 hover:bg-[#12121280]"
                  disabled={!address}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative flex w-full items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#558EB4]/20 to-[#1388D5]/20">
                        <Image src="/icons/x.png" width={20} height={20} alt="twitter" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white">Connect X</div>
                        <div className="text-sm text-[#B5B5B5]">Verify your identity with X</div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-[#B5B5B5] transition-colors group-hover:text-[#558EB4]" />
                  </div>
                </motion.button>

                <motion.button
                  onClick={() =>
                    handleConnectDiscord(address || undefined, '/rewards?connected=discord')
                  }
                  className="group relative h-auto overflow-hidden rounded-lg border border-[#383838] bg-[#12121266] p-0 backdrop-blur-lg transition-all duration-300 hover:border-[#8F564E]/50 hover:bg-[#12121280]"
                  disabled={!address}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative flex w-full items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#8F564E]/20 to-[#E53922]/20">
                        <Image src="/icons/discord.svg" width={20} height={20} alt="discord" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white">Connect Discord</div>
                        <div className="text-sm text-[#B5B5B5]">
                          Join our community and verify identity
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-[#B5B5B5] transition-colors group-hover:text-[#8F564E]" />
                  </div>
                </motion.button>
              </div>
              {!address && (
                <div className="rounded-lg border border-[#8F564E]/30 bg-[#8F564E]/10 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#8F564E]" />
                    <p className="text-sm text-[#8F564E]">
                      Please connect your wallet first to link social accounts
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-lg border border-[#383838] bg-[#383838]/30 p-4">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B5B5B5]" />
                <div>
                  <p className="text-xs leading-relaxed text-[#B5B5B5]">
                    <strong className="text-[#B8B8B8]">Privacy:</strong> We only use your social
                    accounts for identity verification. Your personal information remains private
                    and is not shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
