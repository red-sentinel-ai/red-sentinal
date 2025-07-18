'use client'

import type React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ExternalLink, Shield, Sparkles } from 'lucide-react'
import { useSocialStatus } from '@/hooks/profile/useSocialStatus'
import { handleConnectDiscord, handleConnectTwitter } from '@/utils/socialConnection'
import Image from 'next/image'
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
      <div className="min-h-body bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/30 border-gray-800">
          <CardContent className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
    <div className="min-h-body bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 pb-4 pt-20">
      <div className="relative w-full max-w-2xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-xl -z-10 rounded-xl"></div>
        <Card className="bg-black/30 border-gray-800">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Shield className="h-10 w-10 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Social Authentication Required
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Connect your social accounts to unlock the full Raven House rewards experience
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="bg-black/20 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-white">What you&apos;ll unlock:</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white text-center">
                Choose your connection method:
              </h3>

              <div className="grid gap-4">
                {/* Twitter */}
                <button
                  onClick={() =>
                    handleConnectTwitter(address || undefined, '/rewards?connected=twitter')
                  }
                  className="group relative overflow-hidden h-auto p-0 bg-black/20 hover:bg-black/30 border-gray-800 hover:border-blue-500/50"
                  disabled={!address}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center justify-between p-6 w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                        <Image
                          src="/icons/x.png"
                          width={20}
                          height={20}
                          alt="twitter"
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white">Connect X</div>
                        <div className="text-sm text-gray-400">Verify your identity with X</div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleConnectDiscord(address || undefined, '/rewards?connected=discord')
                  }
                  className="group relative overflow-hidden h-auto p-0 bg-black/20 hover:bg-black/30 border-gray-800 hover:border-indigo-500/50"
                  disabled={!address}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center justify-between p-6 w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center">
                        <Image
                          src="/icons/discord.svg"
                          width={20}
                          height={20}
                          alt="discord"
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white">Connect Discord</div>
                        <div className="text-sm text-gray-400">
                          Join our community and verify identity
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </button>
              </div>

              {!address && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <p className="text-sm text-orange-400">
                      Please connect your wallet first to link social accounts
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <strong className="text-gray-300">Privacy:</strong> We only use your social
                    accounts for identity verification. Your personal information remains private
                    and is not shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
