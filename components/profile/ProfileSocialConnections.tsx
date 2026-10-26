'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Mail, Check, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'
import { useEmailOtpVerification } from '@/hooks/profile/useEmailOtpVerification'
import { useTelegramVerification } from '@/hooks/profile/useTelegramVerification'
import { useRemoveSocialConnection } from '@/hooks/profile/useRemoveSocialConnection'
import { useAuth } from '@/context/AuthContext'
import { SUI_SENTINEL_API_URL } from '@/constants'

// Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

// X (Twitter) icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25H11.05L7.063 9.965l-4.574 5.285H0L5.695 8.748.04.75h5.1l3.628 4.78L12.601.75Zm-.86 13.045h1.358L4.192 2.9H2.74l9 10.895Z" />
    </svg>
  )
}

const TELEGRAM_BOT_USERNAME = 'suisentinel_bot'

const X_CONNECT_ERRORS: Record<string, string> = {
  denied: 'X connection was cancelled',
  expired: 'X connection expired — please try again',
  state_mismatch: 'Invalid X connection state — please try again',
  token_exchange: 'Could not verify your X account — please try again',
  users_me: 'Could not load your X profile — please try again',
  already_linked: 'This X account is already linked to another user',
  auth_required: 'Sign in with your wallet first',
  not_configured: 'X connection is not available yet',
  failed: 'Failed to connect X — please try again',
}

export function ProfileSocialConnections() {
  const { user, refreshProfile } = useAuth()
  const { mutate: disconnect } = useRemoveSocialConnection()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null)
  const [isConnectingX, setIsConnectingX] = useState(false)
  const {
    email: emailValue,
    setEmail: setEmailValue,
    code: emailCode,
    setCode: setEmailCode,
    state: emailState,
    errorMessage: emailError,
    start: startEmailVerification,
    sendCode: sendEmailCode,
    verifyCode: verifyEmailCode,
    changeEmail: changeEmailAddress,
    cancel: cancelEmailVerification,
  } = useEmailOtpVerification(user?.id)

  const {
    code: telegramCode,
    setCode: setTelegramCode,
    state: telegramState,
    showCodeInput: showTelegramCodeInput,
    verifyCode: verifyTelegramCode,
    cancel: cancelTelegramVerification,
  } = useTelegramVerification(user?.id)

  // Get email from social connections (email is no longer a top-level user field)
  const emailConnection = user?.social_connections?.find(
    conn => conn.platform.toLowerCase() === 'email'
  )
  const hasEmail = !!emailConnection
  const connectedEmail = emailConnection?.platform_username

  // Get telegram username from social connections
  const telegramConnection = user?.social_connections?.find(
    conn => conn.platform.toLowerCase() === 'telegram'
  )
  const hasTelegram = !!telegramConnection
  const telegramUsername = telegramConnection?.platform_username

  // Get the connected X handle ('x' for new rows, 'twitter' is the legacy
  // platform value still read across the backend)
  const xConnection = user?.social_connections?.find(
    conn => ['x', 'twitter'].includes(conn.platform.toLowerCase())
  )
  const hasX = !!xConnection
  const xUsername = xConnection?.platform_username

  const handleConnectX = () => {
    // Full-page navigation to the backend so the session cookie rides along
    // with the OAuth start request; X sends the user back to /profile.
    setIsConnectingX(true)
    window.location.href = `${SUI_SENTINEL_API_URL}/auth/x/start`
  }

  // The backend OAuth callback lands back on /profile with x_connected=1 or
  // x_error=<reason> (plus an optional x_error_detail excerpt from the X API);
  // surface the result and clear the params.
  useEffect(() => {
    const xConnected = searchParams.get('x_connected')
    const xError = searchParams.get('x_error')
    if (!xConnected && !xError) return

    if (xConnected) {
      toast.success('X account connected')
      void refreshProfile()
    } else if (xError) {
      const detail = searchParams.get('x_error_detail')
      toast.error(X_CONNECT_ERRORS[xError] ?? 'Failed to connect X', {
        description: detail || undefined,
      })
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete('x_connected')
    params.delete('x_error')
    params.delete('x_error_detail')
    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [searchParams, router, pathname, refreshProfile])

  const handleTelegramVerify = async () => {
    const success = await verifyTelegramCode()
    if (success) {
      await refreshProfile()
    }
  }

  const handleEmailVerify = async () => {
    const success = await verifyEmailCode()
    if (success) {
      await refreshProfile()
    }
  }

  const handleDisconnect = (platform: string, connectionId?: string) => {
    if (!user?.id || !connectionId) return
    setDisconnectingPlatform(platform)
    disconnect(
      { connectionId, platform },
      {
        onSettled: async () => {
          setDisconnectingPlatform(null)
          await refreshProfile()
        },
      }
    )
  }

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
          Connected Accounts
        </h2>
        <span className="text-[11px] tracking-normal text-[var(--color-text-muted)]">
          For recovery & notifications
        </span>
      </div>

      <div className="grid grid-cols-1 gap-0 divide-y divide-[var(--color-border-strong)] border border-[var(--color-border-strong)] md:grid-cols-4 md:divide-x md:divide-y-0">
        {/* Email */}
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
              <span className="industrial-label">Email</span>
            </div>
            {hasEmail && (
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-success)]">
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
                onClick={() => handleDisconnect('email', emailConnection?.id)}
                disabled={disconnectingPlatform === 'email'}
                className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)] disabled:opacity-50"
              >
                {disconnectingPlatform === 'email' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>
          ) : emailState === 'code_input' || emailState === 'verifying' ? (
            <div className="space-y-3">
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Enter the 4-digit code sent to{' '}
                <span className="font-medium text-[var(--color-text-primary)]">{emailValue}</span>
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 4-digit code"
                value={emailCode}
                onChange={e => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleEmailVerify()
                }}
                maxLength={4}
                className="h-9 w-full border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 text-center text-sm tracking-[0.5em] text-[var(--color-text-primary)] placeholder:tracking-normal placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-text-primary)] focus:outline-none"
              />
              {emailError && <p className="text-[11px] text-[var(--color-danger)]">{emailError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleEmailVerify}
                  disabled={emailState === 'verifying' || emailCode.length !== 4}
                  className="button-ghost-terminal flex-1 px-3 py-2 text-[11px] disabled:opacity-50"
                >
                  {emailState === 'verifying' ? (
                    <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                  ) : (
                    'Verify'
                  )}
                </button>
                <button
                  onClick={changeEmailAddress}
                  disabled={emailState === 'verifying'}
                  className="px-3 py-2 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                >
                  Change
                </button>
              </div>
            </div>
          ) : emailState === 'email_input' || emailState === 'sending' ? (
            <div className="space-y-2">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={emailValue}
                onChange={e => setEmailValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') sendEmailCode()
                }}
                className="h-9 w-full border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-text-primary)] focus:outline-none"
              />
              {emailError && <p className="text-[11px] text-[var(--color-danger)]">{emailError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => sendEmailCode()}
                  disabled={emailState === 'sending' || !emailValue.trim()}
                  className="button-ghost-terminal flex-1 px-3 py-2 text-[11px] disabled:opacity-50"
                >
                  {emailState === 'sending' ? (
                    <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                  ) : (
                    'Send Code'
                  )}
                </button>
                <button
                  onClick={cancelEmailVerification}
                  className="px-3 py-2 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startEmailVerification}
              className="button-ghost-terminal w-full py-2 text-[11px]"
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
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-success)]">
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
                onClick={() => handleDisconnect('telegram', telegramConnection?.id)}
                disabled={disconnectingPlatform === 'telegram'}
                className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)] disabled:opacity-50"
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
                <p className="mb-1 text-[11px] text-[var(--color-text-muted)]">
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
                <p className="text-[11px] text-[var(--color-text-muted)]">
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
                  className="button-ghost-terminal flex-1 px-3 py-2 text-[11px] disabled:opacity-50"
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
                  className="px-3 py-2 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={showTelegramCodeInput}
              className="button-ghost-terminal w-full py-2 text-[11px]"
            >
              Connect Telegram
            </button>
          )}

          <p className="text-[11px] text-[var(--color-text-muted)]">
            Get notified when someone attacks your Sentinel
          </p>
        </div>

        {/* X (Twitter) */}
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
              <span className="industrial-label">X (Twitter)</span>
            </div>
            {hasX && (
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-success)]">
                <Check className="h-3 w-3" />
                Connected
              </span>
            )}
          </div>

          {hasX ? (
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {xUsername ? `@${xUsername}` : 'X Connected'}
              </span>
              <button
                onClick={() => handleDisconnect('X', xConnection?.id)}
                disabled={disconnectingPlatform === 'X'}
                className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)] disabled:opacity-50"
              >
                {disconnectingPlatform === 'X' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectX}
              disabled={isConnectingX}
              className="button-ghost-terminal w-full py-2 text-[11px] disabled:opacity-50"
            >
              {isConnectingX ? (
                <Loader2 className="mx-auto h-3 w-3 animate-spin" />
              ) : (
                'Connect X'
              )}
            </button>
          )}

          <p className="text-[11px] text-[var(--color-text-muted)]">
            Link your X handle to your profile
          </p>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/icons/discord.svg"
                alt="Discord"
                width={16}
                height={16}
                className="h-4 w-4 opacity-50"
              />
              <span className="industrial-label">Discord</span>
            </div>
          </div>

          <button
            disabled
            className="button-ghost-terminal w-full cursor-not-allowed py-2 text-[11px] opacity-50"
          >
            Coming Soon
          </button>

          <p className="text-[11px] text-[var(--color-text-muted)]">
            Link your Discord for community perks
          </p>
        </div>
      </div>
    </section>
  )
}
