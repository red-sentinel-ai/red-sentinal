'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Check, X } from 'lucide-react'
import posthog from 'posthog-js'
import { Button, Badge, Card } from '@/components/ui'
import { toast } from 'react-toastify'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useSocialStatus } from '@/hooks/profile/useSocialStatus'
import { handleConnectDiscord, handleConnectTwitter } from '@/utils/socialConnection'
import { useDisconnectProvider } from '@/hooks/rewards/useDisconnectProvider'

export function SocialConnectionsSection() {
  const account = useCurrentAccount()
  const address = account?.address
  const { data: socialStatus, isLoading, refetch } = useSocialStatus(address || undefined)
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectProvider()
  const searchParams = useSearchParams()

  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null)

  const hasTwitter = socialStatus?.isXConnected || false
  const hasDiscord = socialStatus?.isDiscordConnected || false

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')

    if (connected) {
      toast.success(`${connected} connected successfully!`)
      refetch()
      const url = new URL(window.location.href)
      url.searchParams.delete('connected')
      window.history.replaceState({}, '', url.toString())

      posthog.capture('social_account_connected', {
        platform: connected.toLowerCase(),
        wallet_address: address,
      })
    }

    if (error) {
      toast.error('Failed to connect social account')
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, refetch])

  useEffect(() => {
    if (socialStatus && connectingPlatform) {
      const isConnected =
        (connectingPlatform === 'twitter' && socialStatus.isXConnected) ||
        (connectingPlatform === 'discord' && socialStatus.isDiscordConnected)

      if (isConnected) {
        setConnectingPlatform(null)
      }
    }
  }, [socialStatus, connectingPlatform])

  useEffect(() => {
    if (!isDisconnecting && disconnectingPlatform) {
      setDisconnectingPlatform(null)
    }
  }, [isDisconnecting, disconnectingPlatform])

  if (isLoading) {
    return (
      <Card className="border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-9 w-36 animate-pulse rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </Card>
    )
  }

  const hasAnyConnection = hasTwitter || hasDiscord
  const connectionCount = (hasTwitter ? 1 : 0) + (hasDiscord ? 1 : 0)

  return (
    <div className="px-4 md:px-8">
      {!hasAnyConnection && (
        <div className="mb-10 rounded-lg border border-[#5E5E5E] bg-gradient-to-r from-white/45 to-[rgba(255,158,244,0.46)] p-4">
          <div className="flex items-start gap-3">
            <Image src="/icons/star-badge-black.png" width={35} height={35} alt="star badge" />
            <div>
              <p className="text-2xl font-medium">Connect your socials to unlock rewards</p>
              <p className="mt-1 text-base text-[#5E5E5E]">
                Connect at least one social account to access the rewards program and exclusive
                benefits.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="border-[#5E5E5E] bg-transparent bg-gradient-to-r from-white/45 to-[rgba(249,241,248,0.45)] p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="tex-lg font-medium text-black md:text-[32px]">Social Connections</h3>
                <p className="text-2xl text-gray-500">
                  {hasAnyConnection
                    ? `${connectionCount} of 2 platforms connected`
                    : 'Connect your social accounts'}
                </p>
              </div>
            </div>

            {hasAnyConnection && (
              <Badge
                variant="secondary"
                className="border-green-200 bg-green-100 px-3 py-1 text-green-800"
              >
                <Check className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-[#5E5E5E] bg-gradient-to-r from-white/45 to-[rgba(249,240,249,0.46)] p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#5E5E5E] md:h-[70px] md:w-[70px]">
                  <Image
                    src="/icons/x_black.png"
                    width={42}
                    height={42}
                    alt="X (Twitter)"
                    className="rounded"
                  />
                  {hasTwitter && (
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-medium">X (Twitter)</p>
                  <p className="text-base text-[#5E5E5E]">
                    {hasTwitter ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              {hasTwitter ? (
                <Button
                  onClick={() => {
                    setDisconnectingPlatform('twitter')
                    disconnect({ provider: 'twitter', walletAddress: address! })
                  }}
                  size="sm"
                  variant="outline"
                  disabled={disconnectingPlatform === 'twitter'}
                  className="flex h-[50px] min-w-[145px] items-center gap-1 border-red-200 px-3 text-base text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                >
                  {disconnectingPlatform === 'twitter' ? (
                    <>
                      <div className="mr-1 h-4 w-4 flex-shrink-0 animate-spin rounded-full border border-black border-t-transparent"></div>
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-6 w-6" />
                      Disconnect
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setConnectingPlatform('twitter')
                    handleConnectTwitter(address || undefined)
                  }}
                  size="sm"
                  disabled={connectingPlatform === 'twitter'}
                  className="btn btn-outline flex h-[50px] w-[145px] items-center gap-1 text-base"
                >
                  {connectingPlatform === 'twitter' ? (
                    <>
                      <div className="mr-1 h-4 w-4 flex-shrink-0 animate-spin rounded-full border border-black border-t-transparent"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#5E5E5E] bg-gradient-to-r from-white/45 to-[rgba(249,240,249,0.46)] p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src="/icons/discord_black.svg"
                    width={20}
                    height={20}
                    alt="Discord"
                    className="rounded"
                  />
                  {hasDiscord && (
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-medium">Discord</p>
                  <p className="text-base text-[#5E5E5E]">
                    {hasDiscord ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              {hasDiscord ? (
                <Button
                  onClick={() => {
                    setDisconnectingPlatform('discord')
                    disconnect({ provider: 'discord', walletAddress: address! })
                  }}
                  size="sm"
                  variant="outline"
                  disabled={disconnectingPlatform === 'discord'}
                  className="flex h-[50px] min-w-[145px] items-center gap-1 border-red-200 px-3 text-base text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                >
                  {disconnectingPlatform === 'discord' ? (
                    <>
                      <div className="mr-1 h-4 w-4 flex-shrink-0 animate-spin rounded-full border border-black border-t-transparent"></div>
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-6 w-6" />
                      Disconnect
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setConnectingPlatform('discord')
                    handleConnectDiscord(address || undefined)
                  }}
                  size="sm"
                  disabled={connectingPlatform === 'discord'}
                  className="btn btn-outline h-[50px] w-[145px] text-base"
                >
                  {connectingPlatform === 'discord' ? (
                    <>
                      <div className="mr-1 h-4 w-4 flex-shrink-0 animate-spin rounded-full border border-black border-t-transparent"></div>
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
