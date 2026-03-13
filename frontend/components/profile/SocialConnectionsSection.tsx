'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Check, X } from 'lucide-react'
import posthog from 'posthog-js'
import { Button, Badge, Card } from '@/components/ui'
import { toast } from 'sonner'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useSocialStatus } from '@/hooks/profile/useSocialStatus'
import { handleConnectGoogle } from '@/utils/socialConnection'
import { useDisconnectProvider } from '@/hooks/rewards/useDisconnectProvider'

type TelegramAuthData = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function SocialConnectionsSection() {
  const account = useCurrentAccount()
  const address = account?.address
  const { data: socialStatus, isLoading, refetch } = useSocialStatus(address || undefined)
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectProvider()
  const searchParams = useSearchParams()

  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null)
  const telegramContainerRef = useRef<HTMLDivElement>(null)
  const [telegramContainerReady, setTelegramContainerReady] = useState(false)

  // Callback ref so we know exactly when the container div mounts/unmounts
  const setTelegramRef = useCallback((node: HTMLDivElement | null) => {
    telegramContainerRef.current = node
    setTelegramContainerReady(!!node)
  }, [])

  const hasGoogle = socialStatus?.isGoogleConnected || false
  const hasTelegram = socialStatus?.isTelegramConnected || false
  const hasAnyConnection = hasGoogle || hasTelegram

  const telegramBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME

  // Handle Google OAuth callback
  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')

    if (connected) {
      const provider = connected.toLowerCase()

      if (address && provider === 'google') {
        fetch('/api/auth/save-social-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address, provider }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              toast.success(`${connected} connected successfully!`)
              refetch()
              posthog.capture('social_account_connected', {
                platform: provider,
                wallet_address: address,
              })
            } else {
              toast.error(`Connected but failed to save: ${data.error}`)
            }
          })
          .catch(() => toast.error('Failed to save connection'))
      }

      setConnectingPlatform(null)
      const url = new URL(window.location.href)
      url.searchParams.delete('connected')
      window.history.replaceState({}, '', url.toString())
    }

    if (error) {
      toast.error('Failed to connect social account')
      setConnectingPlatform(null)
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, refetch, address])

  // Reset disconnecting state when mutation finishes
  useEffect(() => {
    if (!isDisconnecting && disconnectingPlatform) {
      setDisconnectingPlatform(null)
    }
  }, [isDisconnecting, disconnectingPlatform])

  // Inject hidden Telegram Login Widget — reruns when the container div actually mounts
  useEffect(() => {
    if (hasTelegram || !telegramBotName || !telegramContainerRef.current) return

    telegramContainerRef.current.innerHTML = ''

    ;(window as any).onTelegramAuth = async (telegramData: TelegramAuthData) => {
      if (!address) {
        toast.error('Please connect your wallet first')
        return
      }
      setConnectingPlatform('telegram')
      try {
        const res = await fetch('/api/auth/connect-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramData, walletAddress: address }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to connect')
        }
        toast.success('Telegram connected successfully!')
        posthog.capture('social_account_connected', { platform: 'telegram', wallet_address: address })
        refetch()
      } catch (err: any) {
        toast.error(`Failed to connect Telegram: ${err.message}`)
      } finally {
        setConnectingPlatform(null)
      }
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', telegramBotName)
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    telegramContainerRef.current.appendChild(script)

    return () => {
      delete (window as any).onTelegramAuth
    }
  }, [hasTelegram, telegramBotName, address, refetch, telegramContainerReady])


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

  return (
    <div className="px-4 md:px-8">
      <Card className="border-[#5E5E5E] bg-transparent bg-gradient-to-r from-white/45 to-[rgba(249,241,248,0.45)] p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-black sm:text-xl">
              Connect your socials to unlock rewards
            </h3>
            {hasAnyConnection && (
              <Badge
                variant="secondary"
                className="border-green-200 bg-green-100 px-2 py-0.5 text-xs text-green-800"
              >
                <Check className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Connect Email (Google) */}
            <div className="flex flex-col items-start justify-between gap-2 rounded-lg border border-[#5E5E5E] bg-gradient-to-r from-white/45 to-[rgba(249,240,249,0.46)] p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#5E5E5E] sm:h-10 sm:w-10">
                  <GoogleIcon />
                  {hasGoogle && (
                    <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium sm:text-base">Connect Email</p>
                  <p className="text-xs text-[#5E5E5E]">
                    {hasGoogle ? 'Connected via Google' : 'Connect via Google'}
                  </p>
                </div>
              </div>

              {hasGoogle ? (
                <Button
                  onClick={() => {
                    if (!address) return
                    setDisconnectingPlatform('google')
                    disconnect({ provider: 'google', walletAddress: address })
                  }}
                  size="sm"
                  variant="outline"
                  disabled={disconnectingPlatform === 'google'}
                  className="flex h-8 min-w-[90px] items-center gap-1 border-red-200 px-2 text-xs text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 sm:h-9 sm:text-sm"
                >
                  {disconnectingPlatform === 'google' ? (
                    <>
                      <div className="mr-1 h-3 w-3 flex-shrink-0 animate-spin rounded-full border border-black border-t-transparent"></div>
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setConnectingPlatform('google')
                    handleConnectGoogle(address || undefined)
                  }}
                  size="sm"
                  disabled={connectingPlatform === 'google'}
                  className="btn btn-outline flex h-8 min-w-[85px] items-center gap-1 text-xs sm:h-9 sm:text-sm"
                >
                  {connectingPlatform === 'google' ? (
                    <>
                      <div className="mr-1 h-3 w-3 flex-shrink-0 animate-spin rounded-full border border-black border-t-transparent"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              )}
            </div>

            {/* Connect Telegram */}
            <div className="flex flex-col items-start justify-between gap-2 rounded-lg border border-[#5E5E5E] bg-gradient-to-r from-white/45 to-[rgba(249,240,249,0.46)] p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#5E5E5E] sm:h-10 sm:w-10">
                  <Image
                    src="/icons/telegram_black.png"
                    width={24}
                    height={24}
                    alt="Telegram"
                    className="rounded"
                  />
                  {hasTelegram && (
                    <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium sm:text-base">Connect Telegram</p>
                  <p className="text-xs text-[#5E5E5E]">
                    {hasTelegram ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              {hasTelegram ? (
                <Button
                  onClick={() => {
                    if (!address) return
                    setDisconnectingPlatform('telegram')
                    disconnect({ provider: 'telegram', walletAddress: address })
                  }}
                  size="sm"
                  variant="outline"
                  disabled={disconnectingPlatform === 'telegram'}
                  className="flex h-8 min-w-[90px] items-center gap-1 border-red-200 px-2 text-xs text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 sm:h-9 sm:text-sm"
                >
                  {disconnectingPlatform === 'telegram' ? (
                    <>
                      <div className="mr-1 h-3 w-3 flex-shrink-0 animate-spin rounded-full border border-black border-t-transparent"></div>
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              ) : connectingPlatform === 'telegram' ? (
                <div className="flex h-8 min-w-[85px] items-center justify-center gap-1 text-xs sm:h-9 sm:text-sm">
                  <div className="h-3 w-3 animate-spin rounded-full border border-black border-t-transparent"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="relative">
                  <Button
                    size="sm"
                    className="btn btn-outline flex h-8 min-w-[85px] items-center gap-1 text-xs sm:h-9 sm:text-sm pointer-events-none select-none"
                  >
                    Connect
                  </Button>
                  <div
                    ref={setTelegramRef}
                    className="absolute inset-0 overflow-hidden [&_button]:absolute [&_button]:inset-0 [&_button]:w-full [&_button]:h-full [&_button]:opacity-[0.001] [&_button]:cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
