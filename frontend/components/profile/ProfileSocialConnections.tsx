'use client'

import { useState } from 'react'
import { Mail, Check, Loader2, ExternalLink } from 'lucide-react'
import { useUserProfile } from '@/hooks/profile/useUserProfile'
import { useSocialStatus } from '@/hooks/profile/useSocialStatus'
import { useSendEmailVerification } from '@/hooks/profile/useSendEmailVerification'
import { useTelegramVerification } from '@/hooks/profile/useTelegramVerification'
import { useDisconnectProvider } from '@/hooks/rewards/useDisconnectProvider'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useAuth } from '@/context/AuthContext'
import { PROJECT_DISCORD_URL } from '@/constants'

// Discord icon component
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

// Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}${'*'.repeat(Math.min(local.length - 2, 5))}` : local
  return `${maskedLocal}@${domain}`
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
  const { emailInput, setEmailInput, isSending, linkSent, sentToEmail, sendVerificationLink, reset } =
    useSendEmailVerification(address)

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
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--color-text-muted)]">
          Connected Accounts
        </h2>
        <span className="text-[9px] text-[var(--color-text-faint)] uppercase tracking-wider">
          For recovery & notifications
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[var(--color-border-strong)] divide-y md:divide-y-0 md:divide-x divide-[var(--color-border-strong)]">
        {/* Email */}
        <div className="p-5 flex flex-col gap-3">
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
              <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {maskEmail(profile?.email || '')}
              </span>
              <button
                onClick={() => handleDisconnect('email')}
                disabled={disconnectingPlatform === 'email'}
                className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-50"
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
                <div className="p-2 border border-[var(--color-success-muted)] bg-[var(--color-success-muted)]">
                  <div className="flex items-center gap-1 text-[var(--color-success)]">
                    <Check className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Check inbox</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-success)] mt-1">
                    Sent to {sentToEmail}
                  </p>
                  <button
                    onClick={reset}
                    className="text-[9px] text-[var(--color-success)] underline hover:no-underline mt-1"
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
                    className="w-full h-9 px-3 text-sm bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-text-primary)] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={sendVerificationLink}
                      disabled={isSending || !emailInput.trim()}
                      className="flex-1 button-ghost-terminal px-3 py-2 text-[10px] disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : 'Send Link'}
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
        <div className="p-5 flex flex-col gap-3">
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
              <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                Telegram Connected
              </span>
              <button
                onClick={() => handleDisconnect('telegram')}
                disabled={disconnectingPlatform === 'telegram'}
                className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-50"
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
              <div className="p-2 border border-[var(--color-border-default)] bg-[var(--color-bg-base)]">
                <p className="text-[10px] text-[var(--color-text-secondary)] mb-1">
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
                  2. Send <code className="px-1 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]">/connect</code> to get your code
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
                className="w-full h-9 px-3 text-sm text-center tracking-[0.5em] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] placeholder:tracking-normal focus:border-[var(--color-text-primary)] focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleTelegramVerify}
                  disabled={telegramState === 'verifying' || telegramCode.length !== 4}
                  className="flex-1 button-ghost-terminal px-3 py-2 text-[10px] disabled:opacity-50"
                >
                  {telegramState === 'verifying' ? (
                    <Loader2 className="h-3 w-3 animate-spin mx-auto" />
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

        {/* Discord */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <DiscordIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
            <span className="industrial-label">Discord</span>
          </div>

          {/* Discord OAuth not yet implemented - show join link for now */}
          <a
            href={PROJECT_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="button-ghost-terminal w-full py-2 text-[10px] flex items-center justify-center gap-2"
          >
            Join Discord
            <ExternalLink className="h-3 w-3" />
          </a>

          <p className="text-[9px] text-[var(--color-text-faint)]">
            Join our community for updates & support
          </p>
        </div>
      </div>
    </section>
  )
}
