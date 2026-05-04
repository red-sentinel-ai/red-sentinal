'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Check, Mail, X } from 'lucide-react'
import posthog from 'posthog-js'
import { Button, Badge, Card } from '@/components/ui'
import { toast } from 'sonner'
import { useSocialStatus } from '@/hooks/profile/useSocialStatus'
import { useSendEmailVerification } from '@/hooks/profile/useSendEmailVerification'
import { useDisconnectProvider } from '@/hooks/rewards/useDisconnectProvider'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'

export function SocialConnectionsSection() {
  const { address } = useConnectedAddress()
  const { data: socialStatus, isLoading, refetch } = useSocialStatus(address || undefined)
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectProvider()
  const searchParams = useSearchParams()

  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null)
  const { emailInput, setEmailInput, isSending, linkSent, sentToEmail, sendVerificationLink, reset } =
    useSendEmailVerification(address)

  const telegramContainerRef = useRef<HTMLDivElement>(null)
  const [telegramContainerReady, setTelegramContainerReady] = useState(false)

  const setTelegramRef = useCallback((node: HTMLDivElement | null) => {
    telegramContainerRef.current = node
    setTelegramContainerReady(!!node)
  }, [])

  const hasEmail = socialStatus?.isEmailConnected || false
  const hasTelegram = socialStatus?.isTelegramConnected || false
  const hasAnyConnection = hasEmail || hasTelegram

  const telegramBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')

    if (connected === 'email') {
      toast.success('Email connected successfully!')
      refetch()
      posthog.capture('social_account_connected', { platform: 'email', wallet_address: address })

      const url = new URL(window.location.href)
      url.searchParams.delete('connected')
      window.history.replaceState({}, '', url.toString())
    }

    if (error) {
      toast.error('Failed to connect email')
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, refetch, address])

  useEffect(() => {
    if (!isDisconnecting && disconnectingPlatform) {
      setDisconnectingPlatform(null)
    }
  }, [isDisconnecting, disconnectingPlatform])

  useEffect(() => {
    if (hasTelegram || !telegramBotName || !address || !telegramContainerRef.current) return

    telegramContainerRef.current.innerHTML = ''

    const authUrl = `${window.location.origin}/api/auth/connect-telegram?wallet=${encodeURIComponent(address)}`

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?23'
    script.setAttribute('data-telegram-login', telegramBotName)
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-auth-url', authUrl)
    script.setAttribute('data-request-access', 'write')
    script.async = true
    telegramContainerRef.current.appendChild(script)
  }, [hasTelegram, telegramBotName, address, telegramContainerReady])

  if (isLoading) {
    return (
      <Card className="border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-pulse rounded bg-[var(--color-border-subtle)]"></div>
            <div className="h-5 w-40 animate-pulse rounded bg-[var(--color-border-subtle)]"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-28 animate-pulse rounded-lg bg-[var(--color-border-subtle)]"></div>
            <div className="h-9 w-36 animate-pulse rounded-lg bg-[var(--color-border-subtle)]"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="px-4 md:px-8">
      <Card className="border-[var(--color-border-subtle)] bg-gradient-to-r from-[var(--color-bg-surface)]/60 to-[var(--color-bg-subtle)]/60 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] sm:text-xl">
              Connect your socials to unlock rewards
            </h3>
            {hasAnyConnection && (
              <Badge
                variant="secondary"
                className="border-[var(--color-success-muted)] bg-[var(--color-success-muted)] px-2 py-0.5 text-xs text-[var(--color-success)]"
              >
                <Check className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Connect Email */}
            <div className="rounded-lg border border-[var(--color-border-subtle)] bg-gradient-to-r from-[var(--color-bg-surface)]/60 to-[var(--color-bg-subtle)]/60 p-3">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] sm:h-10 sm:w-10">
                    <Mail className="h-4 w-4 text-[var(--color-text-muted)] sm:h-5 sm:w-5" />
                    {hasEmail && (
                      <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-bg-surface)] bg-[var(--color-success)]"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] sm:text-base">Connect Email</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {hasEmail && 'Email connected'}
                    </p>
                  </div>
                </div>

                {hasEmail ? (
                  <Button
                    onClick={() => {
                      if (!address) return
                      setDisconnectingPlatform('email')
                      disconnect({ provider: 'email', walletAddress: address })
                    }}
                    size="sm"
                    variant="outline"
                    disabled={disconnectingPlatform === 'email'}
                    className="flex h-8 min-w-[90px] items-center gap-1 border-[var(--color-danger-muted)] px-2 text-xs text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)] disabled:opacity-50 sm:h-9 sm:text-sm"
                  >
                    {disconnectingPlatform === 'email' ? (
                      <>
                        <div className="mr-1 h-3 w-3 flex-shrink-0 animate-spin rounded-full border border-[var(--color-text-primary)] border-t-transparent"></div>
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <X className="mr-1 h-4 w-4" />
                        Disconnect
                      </>
                    )}
                  </Button>
                ) : null}
              </div>

              {/* Email input — shown only when not connected */}
              {!hasEmail && (
                <div className="mt-3">
                  {linkSent ? (
                    <div className="rounded-lg border border-[var(--color-success-muted)] bg-[var(--color-success-muted)] px-3 py-2.5 text-sm text-[var(--color-success)]">
                      <p className="font-medium">Check your inbox!</p>
                      <p className="mt-0.5 text-xs text-[var(--color-success)]">
                        Verification link sent to <span className="font-medium">{sentToEmail}</span>. It expires in 15 minutes.
                      </p>
                      <button
                        onClick={reset}
                        className="mt-1.5 text-xs text-[var(--color-success)] underline hover:text-[var(--color-gold-primary)]"
                      >
                        Use a different email
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') sendVerificationLink() }}
                        className="h-9 w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] sm:flex-1"
                      />
                      <Button
                        onClick={sendVerificationLink}
                        size="sm"
                        disabled={isSending || !emailInput.trim()}
                        className="btn btn-outline h-9 w-full text-sm sm:w-auto sm:min-w-[100px]"
                      >
                        {isSending ? (
                          <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          'Send Link'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connect Telegram - temporarily hidden, pending debug */}
            {false && <div className="flex flex-col items-start justify-between gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-gradient-to-r from-[var(--color-bg-surface)]/60 to-[var(--color-bg-subtle)]/60 p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] sm:h-10 sm:w-10">
                  <Image
                    src="/icons/telegram_black.png"
                    width={24}
                    height={24}
                    alt="Telegram"
                    className="rounded"
                  />
                  {hasTelegram && (
                    <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-bg-surface)] bg-[var(--color-success)]"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] sm:text-base">Connect Telegram</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
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
                  className="flex h-8 min-w-[90px] items-center gap-1 border-[var(--color-danger-muted)] px-2 text-xs text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)] disabled:opacity-50 sm:h-9 sm:text-sm"
                >
                  {disconnectingPlatform === 'telegram' ? (
                    <>
                      <div className="mr-1 h-3 w-3 flex-shrink-0 animate-spin rounded-full border border-[var(--color-text-primary)] border-t-transparent"></div>
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
            </div>}
          </div>
        </div>
      </Card>
    </div>
  )
}
