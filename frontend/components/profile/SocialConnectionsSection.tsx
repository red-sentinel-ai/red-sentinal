'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Check, X } from 'lucide-react'
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
      <Card className="bg-gray-50 border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-pulse bg-gray-200 h-5 w-5 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-5 w-40 rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="animate-pulse bg-gray-200 h-9 w-28 rounded-lg"></div>
            <div className="animate-pulse bg-gray-200 h-9 w-36 rounded-lg"></div>
          </div>
        </div>
      </Card>
    )
  }

  const hasAnyConnection = hasTwitter || hasDiscord
  const connectionCount = (hasTwitter ? 1 : 0) + (hasDiscord ? 1 : 0)

  return (
    <div className="px-6">
      {!hasAnyConnection && (
        <div className="p-4 rounded-lg mb-10 bg-gradient-to-r from-white/45 to-[rgba(255,158,244,0.46)] border border-[#5E5E5E]">
          <div className="flex items-start gap-3">
            <Image
              src="/icons/star-badge-black.png"
              width={35}
              height={35}
              alt="star badge"
            />
            <div>
              <p className="text-2xl font-medium">Connect your socials to unlock rewards</p>
              <p className="text-base mt-1 text-[#5E5E5E]">
                Connect at least one social account to access the rewards program and exclusive
                benefits.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-transparent border-[#5E5E5E] p-6 bg-gradient-to-r from-white/45 to-[rgba(249,241,248,0.45)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-medium text-black tex-lg md:text-[32px]">Social Connections</h3>
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
                className="bg-green-100 text-green-800 border-green-200 px-3 py-1"
              >
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/45 to-[rgba(249,240,249,0.46)] rounded-lg border border-[#5E5E5E]">
              <div className="flex items-center gap-3">
                <div className="relative border border-[#5E5E5E] w-10 h-10 md:w-[70px] md:h-[70px] flex items-center justify-center rounded-lg">
                  <Image
                    src="/icons/x_black.png"
                    width={42}
                    height={42}
                    alt="X (Twitter)"
                    className="rounded"
                  />
                  {hasTwitter && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-black text-2xl">X (Twitter)</p>
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
                  className="h-8 px-3 text-xs border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                >
                  {disconnectingPlatform === 'twitter' ? (
                    <>
                      <div className="animate-spin h-3 w-3 mr-1 border border-red-500 border-t-transparent rounded-full"></div>
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 mr-1" />
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
                  className="h-8 px-3 text-xs bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 hover:border-blue-300 disabled:opacity-50"
                >
                  {connectingPlatform === 'twitter' ? (
                    <>
                      <div className="animate-spin h-3 w-3 mr-1 border border-blue-600 border-t-transparent rounded-full"></div>
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/45 to-[rgba(249,240,249,0.46)] rounded-lg border border-[#5E5E5E]">
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
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-black text-sm">Discord</p>
                  <p className="text-xs text-gray-500">
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
                  className="h-8 px-3 text-xs border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                >
                  {disconnectingPlatform === 'discord' ? (
                    <>
                      <div className="animate-spin h-3 w-3 mr-1 border border-red-500 border-t-transparent rounded-full"></div>
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 mr-1" />
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
                  className="h-8 px-3 text-xs bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 hover:border-indigo-300 disabled:opacity-50"
                >
                  {connectingPlatform === 'discord' ? (
                    <>
                      <div className="animate-spin h-3 w-3 mr-1 border border-indigo-600 border-t-transparent rounded-full"></div>
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
