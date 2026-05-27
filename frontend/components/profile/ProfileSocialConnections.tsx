'use client'

import { useState } from 'react'
import { Mail, Check, Loader2 } from 'lucide-react'
import { useUserProfile } from '@/hooks/profile/useUserProfile'
import { useSocialStatus } from '@/hooks/profile/useSocialStatus'
import { useSendEmailVerification } from '@/hooks/profile/useSendEmailVerification'
import { useTelegramVerification } from '@/hooks/profile/useTelegramVerification'
import { useDisconnectProvider } from '@/hooks/rewards/useDisconnectProvider'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useAuth } from '@/context/AuthContext'

// Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

const TELEGRAM_BOT_USERNAME = 'suisentinel_bot'

export function ProfileSocialConnections() {
  const { address } = useConnectedAddress()
  const { user } = useAuth()
  const { data: profile } = useUserProfile()
  const { data: socialStatus, refetch: refetchSocialStatus } = useSocialStatus(address || undefined)
  const { mutate: disconnect } = useDisconnectProvider()

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null)
  const {
    emailInput,
    setEmailInput,
    isSending,
    linkSent,
    sentToEmail,
    sendVerificationLink,
    reset,
  } = useSendEmailVerification(address)

  const {
    code: telegramCode,
    setCode: setTelegramCode,
    state: telegramState,
    showCodeInput: showTelegramCodeInput,
    verifyCode: verifyTelegramCode,
    cancel: cancelTelegramVerification,
  } = useTelegramVerification(user?.id)

  // Check connections - use socialStatus for boolean checks, profile for actual email value
  const hasEmail = socialStatus?.isEmailConnected || false
  const hasTelegram = socialStatus?.isTelegramConnected || false

  // Get email from social connections or direct user field
  const emailConnection = user?.social_connections?.find(
    conn => conn.platform.toLowerCase() === 'email'
  )
  const connectedEmail = emailConnection?.platform_username || user?.email || profile?.email

  // Get telegram username from social connections
  const telegramConnection = user?.social_connections?.find(
    conn => conn.platform.toLowerCase() === 'telegram'
  )
  const telegramUsername = telegramConnection?.platform_username

  const handleTelegramVerify = async () => {
    const success = await verifyTelegramCode()
    if (success) {
      refetchSocialStatus()
    }
  }

  const handleDisconnect = (platform: string) => {
    if (!address) return
    setDisconnectingPlatform(platform)
    disconnect(
      { provider: platform, walletAddress: address },
      {
        onSettled: () => {
          setDisconnectingPlatform(null)
          refetchSocialStatus()
        },
      }
    )
  }

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--color-text-muted)]">
          Connected Accounts
        </h2>
        <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-faint)]">
          For recovery & notifications
        </span>
      </div>

      <div className="grid grid-cols-1 gap-0 divide-y divide-[var(--color-border-strong)] border border-[var(--color-border-strong)] md:grid-cols-3 md:divide-x md:divide-y-0">
        {/* Email */}
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
              <span className="industrial-label">Email</span>
            </div>
            {hasEmail && (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[var(--color-success)]">
                <Check className="h-3 w-3" />
                Connected
              </span>
            )}
          </div>

          {hasEmail ? (
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {connectedEmail}
              </span>
              <button
                onClick={() => handleDisconnect('email')}
                disabled={disconnectingPlatform === 'email'}
                className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)] disabled:opacity-50"
              >
                {disconnectingPlatform === 'email' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>
          ) : showEmailForm ? (
            <div className="space-y-2">
              {linkSent ? (
                <div className="border border-[var(--color-success-muted)] bg-[var(--color-success-muted)] p-2">
                  <div className="flex items-center gap-1 text-[var(--color-success)]">
                    <Check className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Check inbox
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-[var(--color-success)]">
                    Sent to {sentToEmail}
                  </p>
                  <button
                    onClick={reset}
                    className="mt-1 text-[9px] text-[var(--color-success)] underline hover:no-underline"
                  >
                    Try different email
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') sendVerificationLink()
                    }}
                    className="h-9 w-full border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-text-primary)] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={sendVerificationLink}
                      disabled={isSending || !emailInput.trim()}
                      className="button-ghost-terminal flex-1 px-3 py-2 text-[10px] disabled:opacity-50"
                    >
                      {isSending ? (
                        <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                      ) : (
                        'Send Link'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailForm(false)
                        reset()
                      }}
                      className="px-3 py-2 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowEmailForm(true)}
              className="button-ghost-terminal w-full py-2 text-[10px]"
            >
              Connect Email
            </button>
          )}
        </div>

        {/* Telegram */}
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TelegramIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
              <span className="industrial-label">Telegram</span>
            </div>
            {hasTelegram && (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[var(--color-success)]">
                <Check className="h-3 w-3" />
                Connected
              </span>
            )}
          </div>

          {hasTelegram ? (
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {telegramUsername ? `@${telegramUsername}` : 'Telegram Connected'}
              </span>
              <button
                onClick={() => handleDisconnect('telegram')}
                disabled={disconnectingPlatform === 'telegram'}
                className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)] disabled:opacity-50"
              >
                {disconnectingPlatform === 'telegram' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>
          ) : telegramState === 'input' || telegramState === 'verifying' ? (
            <div className="space-y-3">
              <div className="border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-2">
                <p className="mb-1 text-[10px] text-[var(--color-text-secondary)]">
                  1. Open{' '}
                  <a
                    href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-text-primary)] underline hover:no-underline"
                  >
                    @{TELEGRAM_BOT_USERNAME}
                  </a>
                </p>
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  2. Send{' '}
                  <code className="bg-[var(--color-bg-surface)] px-1 text-[var(--color-text-primary)]">
                    /connect
                  </code>{' '}
                  to get your code
                </p>
              </div>
              <input
                type="text"
                placeholder="Enter 4-digit code"
                value={telegramCode}
                onChange={e => setTelegramCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleTelegramVerify()
                }}
                maxLength={4}
                className="h-9 w-full border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 text-center text-sm tracking-[0.5em] text-[var(--color-text-primary)] placeholder:tracking-normal placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-text-primary)] focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleTelegramVerify}
                  disabled={telegramState === 'verifying' || telegramCode.length !== 4}
                  className="button-ghost-terminal flex-1 px-3 py-2 text-[10px] disabled:opacity-50"
                >
                  {telegramState === 'verifying' ? (
                    <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                  ) : (
                    'Verify'
                  )}
                </button>
                <button
                  onClick={cancelTelegramVerification}
                  disabled={telegramState === 'verifying'}
                  className="px-3 py-2 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={showTelegramCodeInput}
              className="button-ghost-terminal w-full py-2 text-[10px]"
            >
              Connect Telegram
            </button>
          )}

          <p className="text-[9px] text-[var(--color-text-faint)]">
            Get notified when someone attacks your Sentinel
          </p>
        </div>
      </div>
    </section>
  )
}
