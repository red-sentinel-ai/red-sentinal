'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ExternalLink, Check, X, Users } from 'lucide-react'
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
      <Card className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-pulse bg-gray-700 h-5 w-5 rounded"></div>
            <div className="animate-pulse bg-gray-700 h-5 w-40 rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="animate-pulse bg-gray-700 h-9 w-28 rounded-lg"></div>
            <div className="animate-pulse bg-gray-700 h-9 w-36 rounded-lg"></div>
          </div>
        </div>
      </Card>
    )
  }

  const hasAnyConnection = hasTwitter || hasDiscord
  const connectionCount = (hasTwitter ? 1 : 0) + (hasDiscord ? 1 : 0)

  return (
    <Card className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Social Connections</h3>
              <p className="text-sm text-gray-400">
                {hasAnyConnection
                  ? `${connectionCount} of 2 platforms connected`
                  : 'Connect your social accounts'}
              </p>
            </div>
          </div>

          {hasAnyConnection && (
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/icons/x.png"
                  width={20}
                  height={20}
                  alt="X (Twitter)"
                  className="rounded"
                />
                {hasTwitter && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>
              <div>
                <p className="font-medium text-white text-sm">X (Twitter)</p>
                <p className="text-xs text-gray-400">
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
                className="h-8 px-3 text-xs border-red-500/30 text-red-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-50"
              >
                {disconnectingPlatform === 'twitter' ? (
                  <>
                    <div className="animate-spin h-3 w-3 mr-1 border border-red-400 border-t-transparent rounded-full"></div>
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
                className="h-8 px-3 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50"
              >
                {connectingPlatform === 'twitter' ? (
                  <>
                    <div className="animate-spin h-3 w-3 mr-1 border border-blue-400 border-t-transparent rounded-full"></div>
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/icons/discord.svg"
                  width={20}
                  height={20}
                  alt="Discord"
                  className="rounded"
                />
                {hasDiscord && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>
              <div>
                <p className="font-medium text-white text-sm">Discord</p>
                <p className="text-xs text-gray-400">
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
                className="h-8 px-3 text-xs border-red-500/30 text-red-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-50"
              >
                {disconnectingPlatform === 'discord' ? (
                  <>
                    <div className="animate-spin h-3 w-3 mr-1 border border-red-400 border-t-transparent rounded-full"></div>
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
                className="h-8 px-3 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/50 disabled:opacity-50"
              >
                {connectingPlatform === 'discord' ? (
                  <>
                    <div className="animate-spin h-3 w-3 mr-1 border border-indigo-400 border-t-transparent rounded-full"></div>
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </div>
        </div>

        {!hasAnyConnection && (
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-400 font-medium">Connect to unlock rewards</p>
                <p className="text-xs text-blue-300/70 mt-1">
                  Connect at least one social account to access the rewards program and exclusive
                  benefits.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
