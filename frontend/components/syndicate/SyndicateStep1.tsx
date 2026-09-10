'use client'

import { useRef, useState } from 'react'
import { Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { usePrivyConnect } from '@/hooks/usePrivyConnect'
import { getEvmSupportedTokens } from '@/constants/evm'
import { SUI_SENTINEL_API_URL } from '@/constants'
import { APP_NETWORK } from '@/constants/shared'
import { TokenSelectDropdown } from '@/components/defend/TokenSelectDropdown'
import { useDeploySyndicate } from '@/hooks/syndicate/useDeploySyndicate'
import { useEvmChain } from '@/hooks/evm/useEvmChain'
import type { SupportedToken } from '@/constants/shared'

interface SyndicateStep1Props {
  onComplete: (result: {
    contractAddress: `0x${string}`
    tokenAddress: `0x${string}`
    tokenSymbol: string
    tokenDecimals: number
    syndicateName: string
  }) => void
}

export function SyndicateStep1({ onComplete }: SyndicateStep1Props) {
  const { address: evmAddress } = useAccount()
  const { activeEvmChainKey } = useEvmChain()
  const evmTokens = getEvmSupportedTokens(activeEvmChainKey ?? 'bnb')
  const { openConnectModal } = usePrivyConnect()
  const { deploy, isDeploying } = useDeploySyndicate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [socialLink, setSocialLink] = useState('')
  const [isPermissioned, setIsPermissioned] = useState(false)
  const [selectedToken, setSelectedToken] = useState<SupportedToken>(evmTokens[0])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const nameInputRef = useRef<HTMLInputElement>(null)

  const focusNameField = () => {
    const el = nameInputRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => el.focus({ preventScroll: true }), 400)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (name.length > 60) e.name = 'Name must be 60 characters or fewer'
    if (description.length > 280) e.description = 'Description must be 280 characters or fewer'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      // Reject duplicates before any wallet prompt — saves the user gas.
      const checkRes = await fetch(
        `${SUI_SENTINEL_API_URL}/syndicates/check-name?name=${encodeURIComponent(name.trim())}&network=${APP_NETWORK}`,
        { credentials: 'include' }
      )
      if (checkRes.ok) {
        const { exists } = (await checkRes.json()) as { exists: boolean }
        if (exists) {
          const message = 'A syndicate with this name already exists'
          setErrors({ name: message })
          toast.error(message)
          focusNameField()
          return
        }
      }

      const result = await deploy({
        name: name.trim(),
        description: description.trim(),
        socialLink: socialLink.trim(),
        tokenAddress: selectedToken.coinType as `0x${string}`,
        tokenSymbol: selectedToken.symbol,
        whitelistEnabled: isPermissioned,
      })
      onComplete({
        contractAddress: result.contractAddress,
        tokenAddress: selectedToken.coinType as `0x${string}`,
        tokenSymbol: selectedToken.symbol,
        tokenDecimals: selectedToken.decimals,
        syndicateName: name.trim(),
      })
    } catch (err: any) {
      toast.error(err.message || 'Failed to create syndicate')
    }
  }

  if (!evmAddress) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Users className="h-12 w-12 text-[var(--color-text-muted)]" />
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Connect your BNB wallet to create a syndicate
        </p>
        <button
          type="button"
          onClick={openConnectModal}
          className="flex h-10 items-center gap-2 rounded-lg bg-[var(--color-gold-primary)] px-6 text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)]"
        >
          Connect BNB Wallet
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
          Syndicate Name <span className="text-[var(--color-danger)]">*</span>
        </label>
        <input
          ref={nameInputRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={60}
          placeholder="e.g. Alpha Defenders"
          className="font-body rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
        />
        <div className="flex justify-between">
          {errors.name && <p className="text-xs text-[var(--color-danger)]">{errors.name}</p>}
          <p className="ml-auto text-xs text-[var(--color-text-muted)]">{name.length}/60</p>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="What is your syndicate about? (optional)"
          className="font-body resize-none rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
        />
        <div className="flex justify-between">
          {errors.description && (
            <p className="text-xs text-[var(--color-danger)]">{errors.description}</p>
          )}
          <p className="ml-auto text-xs text-[var(--color-text-muted)]">{description.length}/280</p>
        </div>
      </div>

      {/* Social Link */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
          Social Link
        </label>
        <input
          type="url"
          value={socialLink}
          onChange={e => setSocialLink(e.target.value)}
          placeholder="https://x.com/yourhandle (optional)"
          className="font-body rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
        />
      </div>

      {/* Access Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
          Membership Access
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: false, label: 'Public', desc: 'Anyone can deposit' },
            { value: true, label: 'Permissioned', desc: 'Only approved members' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setIsPermissioned(opt.value)}
              className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                isPermissioned === opt.value
                  ? 'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)]/10'
                  : 'border-[var(--color-border-default)] hover:border-[var(--color-border-subtle)]'
              }`}
            >
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {opt.label}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Token */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
          Sentinel Currency
        </label>
        <div className="flex h-10 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <div className="flex flex-1 items-center px-3 text-sm text-[var(--color-text-muted)]">
            Token used for deposits and bounty pool
          </div>
          <div className="flex shrink-0 items-center border-l border-[var(--color-border-subtle)]">
            <TokenSelectDropdown
              tokens={evmTokens}
              selected={selectedToken}
              onSelect={setSelectedToken}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isDeploying}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] shadow-[var(--shadow-card)] transition-all hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeploying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Deploying Syndicate...
          </>
        ) : (
          'Create Syndicate'
        )}
      </button>
    </form>
  )
}
