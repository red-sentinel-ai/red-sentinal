'use client'

import type React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { AlertCircle, ExternalLink, Shield, Sparkles } from 'lucide-react'
import { useSocialStatus } from '@/hooks/profile/useSocialStatus'
import { handleConnectDiscord, handleConnectTwitter } from '@/utils/socialConnection'
import { useCurrentAccount } from '@mysten/dapp-kit'

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
      <div className="min-h-body bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center">
        <Card className="w-full max-w-md bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl">
          <CardContent className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="font-medium">Checking social connections...</span>
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
    <div className="min-h-body bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center px-4 pb-4 pt-20">
      <motion.div
        className="relative w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Shield className="h-12 w-12 text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-3xl text-white uppercase font-bold">
              Social Authentication Required
            </CardTitle>
            <p className="text-gray-300 mt-3 text-lg">
              Connect your social accounts to unlock the full Sui Sentinel rewards experience
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="bg-[#1a1a1a] backdrop-blur-lg rounded-xl p-6 border border-[#444]">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-cyan-400" />
                <h3 className="font-bold text-white text-lg">What you&apos;ll unlock:</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Earn points for on-chain activities',
                  'Unlock exclusive rewards and tiers',
                  'Participate in community challenges',
                  'Access to special Discord channels',
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <div className="w-3 h-3 bg-cyan-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="font-bold text-white text-center uppercase text-xl">
                Choose your connection method:
              </h3>
              <div className="grid gap-6">
                {/* Twitter */}
                <button
                  onClick={() =>
                    handleConnectTwitter(address || undefined, '/rewards?connected=twitter')
                  }
                  className="group relative overflow-hidden h-auto p-0 bg-[#12121266] backdrop-blur-lg hover:bg-[#1a1a1a] border border-[#444] hover:border-blue-500/50 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/10"
                  disabled={!address}
                >
                  <div className="relative flex items-center justify-between p-8 w-full">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Image
                          src="/icons/x.png"
                          width={24}
                          height={24}
                          alt="twitter"
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white text-xl">Connect X</div>
                        <div className="text-gray-300 font-medium">Verify your identity with X</div>
                      </div>
                    </div>
                    <ExternalLink className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleConnectDiscord(address || undefined, '/rewards?connected=discord')
                  }
                  className="group relative overflow-hidden h-auto p-0 bg-[#12121266] backdrop-blur-lg hover:bg-[#1a1a1a] border border-[#444] hover:border-purple-500/50 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/10"
                  disabled={!address}
                >
                  <div className="relative flex items-center justify-between p-8 w-full">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Image
                          src="/icons/discord.svg"
                          width={24}
                          height={24}
                          alt="discord"
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white text-xl">Connect Discord</div>
                        <div className="text-gray-300 font-medium">
                          Join our community and verify identity
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-6 w-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                </button>
              </div>
              {!address && (
                <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/50 rounded-xl p-6 shadow-lg shadow-orange-500/10">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                    <p className="text-orange-300 font-medium">
                      Please connect your wallet first to link social accounts
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-[#333]/50 rounded-xl p-6 border border-[#444]">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-white">Privacy:</strong> We only use your social
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
