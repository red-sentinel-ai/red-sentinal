'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { parseUnits } from 'viem'
import { SENTINEL_IMAGES } from '@/constants/asset_paths'
import { SYSTEM_PROMPT_MAX_TOKENS } from '@/constants'
import { FormInput } from '@/app/defend/components/FormInput'
import { LLMProviderSection } from '@/app/defend/components/LLMProviderSection'
import { RewardsConditions } from '@/components/defend/RewardsConditions'
import { useDefendForm } from '@/app/defend/hooks/useDefendForm'
import { useCustomProvider } from '@/app/defend/hooks/useCustomProvider'
import { useProviderModels } from '@/app/defend/hooks/useProviderModels'
import { useTokenCount } from '@/hooks/useTokenCount'
import { useDeploySyndicateAgent } from '@/hooks/syndicate/useDeploySyndicateAgent'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import type { SupportedToken } from '@/constants/shared'

interface SyndicateStep3Props {
  syndicateAddress: `0x${string}`
  selectedToken: SupportedToken
  availableBalance: string
  onComplete: (agentId: string, txHash: string, agentName: string) => void
}

export function SyndicateStep3({
  syndicateAddress,
  selectedToken,
  availableBalance,
  onComplete,
}: SyndicateStep3Props) {
  const [agentImage, setAgentImage] = useState<File | null>(null)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    isCustom: boolean
    file?: File | null
  } | null>({ url: SENTINEL_IMAGES[0], isCustom: false })

  const {
    tokenCount,
    countTokens,
    isDebouncing: isTokenCountDebouncing,
  } = useTokenCount()
  const { countTokens: countPrivateTokens } = useTokenCount()
  const { countTokens: countAttackGoalTokens } = useTokenCount()

  const { formData, errors, handleChange, validateForm, setFormData, setErrors } = useDefendForm({
    selectedToken,
    tokenCount,
    countTokens,
    countPrivateTokens,
    countAttackGoalTokens,
    activeTokenSymbol: selectedToken.symbol,
  })

  const customProvider = useCustomProvider(setFormData)
  const { providerModels } = useProviderModels()

  const handleChangeWithProviderReset = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleChange(e)
  }

  const { deploy, isLoading } = useDeploySyndicateAgent({
    syndicateAddress,
    formData,
    selectedToken,
    selectedImage,
    agentImage,
  })

  // The initial bounty pool is drawn from the syndicate's idle balance (the
  // capital deposited in step 2) — NOT from the launcher's wallet. registerAgent
  // reverts with InsufficientLiquidity if initialFund > idlePrincipal(). The
  // syndicate was just funded with exactly `availableBalance` and holds no agent
  // or fees yet, so that deposit IS the idle balance — no on-chain read needed.
  const decimals = selectedToken.decimals
  const availableWei = (() => {
    try {
      return availableBalance ? parseUnits(availableBalance, decimals) : 0n
    } catch {
      return 0n
    }
  })()

  let bountyWei = 0n
  try {
    bountyWei = formData.initialBalance ? parseUnits(formData.initialBalance, decimals) : 0n
  } catch {
    bountyWei = 0n
  }
  const insufficientBounty = bountyWei > availableWei
  const bountyError = insufficientBounty
    ? `Exceeds available syndicate balance (${availableBalance || '0.00'} ${selectedToken.symbol})`
    : undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(customProvider.isValidated)) {
      if (formData.llmProvider === 'custom' && !customProvider.isValidated) {
        toast.error('Please validate your custom provider connection before deploying')
      }
      return
    }

    if (insufficientBounty) {
      toast.error('Bounty pool exceeds the available syndicate balance')
      return
    }

    try {
      const checkRes = await fetch(
        `/api/agents/check-name?name=${encodeURIComponent(formData.agentName)}`
      )
      const checkData = await checkRes.json()
      if (checkData.exists) {
        const message = 'This Sentinel name is already taken. Please choose another.'
        setErrors(prev => ({ ...prev, agentName: message }))
        toast.error(message)
        const nameInput = document.querySelector<HTMLInputElement>('input[name="agentName"]')
        if (nameInput) {
          nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setTimeout(() => nameInput.focus({ preventScroll: true }), 400)
        }
        return
      }

      const result = await deploy()
      toast.success('Sentinel launched!')
      onComplete(result.agentId, result.txHash, formData.agentName)
    } catch (err: any) {
      toast.error(err.message || 'Failed to launch sentinel')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Syndicate context */}
      <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs">
        <span className="uppercase tracking-wider text-[var(--color-text-muted)]">
          Launching for
        </span>
        <Link
          href={`/syndicate/${syndicateAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-mono text-[var(--color-gold-primary)] hover:underline"
        >
          {syndicateAddress.slice(0, 10)}…{syndicateAddress.slice(-8)}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Agent Image */}
      <div className="flex items-center gap-4">
        <div
          className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-[var(--color-border-default)] hover:border-[var(--color-gold-primary)]"
          onClick={() => setImagePickerOpen(true)}
        >
          {selectedImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedImage.url} alt="Sentinel" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--color-text-faint)]">
              +
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Sentinel Image</p>
          <p className="text-xs text-[var(--color-text-muted)]">Click to change</p>
        </div>
        <ImagePickerSheet
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelectImage={img => {
            setSelectedImage(img)
            if (img.isCustom && img.file) setAgentImage(img.file)
            else setAgentImage(null)
          }}
          imageArray={SENTINEL_IMAGES}
          gifArray={[]}
          disableGifs
        />
      </div>

      {/* Name */}
      <FormInput
        label="Sentinel Name"
        name="agentName"
        value={formData.agentName}
        onChange={handleChangeWithProviderReset}
        error={errors.agentName}
        placeholder="My Sentinel"
      />

      {/* LLM Provider */}
      <LLMProviderSection
        formData={formData}
        errors={errors}
        providerModels={providerModels}
        onChange={handleChangeWithProviderReset}
        onProviderChange={provider =>
          customProvider.handleProviderChange(provider, providerModels)
        }
        onModelChange={model => setFormData(prev => ({ ...prev, llmModel: model }))}
        isValidating={customProvider.isValidating}
        isValidated={customProvider.isValidated}
        validationError={customProvider.validationError}
        showApiKey={customProvider.showApiKey}
        onToggleApiKey={() => customProvider.setShowApiKey(v => !v)}
        onValidate={() => customProvider.handleValidate(formData)}
      />

      {/* System Prompt */}
      <div className="flex flex-col gap-2">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Public Instructions
          </label>
          <span className="text-xs text-[var(--color-text-muted)]">
            System prompt visible to attackers.
          </span>
        </div>
        <textarea
          name="systemPrompt"
          value={formData.systemPrompt}
          onChange={handleChangeWithProviderReset}
          className="font-body min-h-[120px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
          placeholder="You are a secure AI assistant..."
        />
        <div className="flex justify-between">
          {errors.systemPrompt && (
            <p className="text-sm text-[var(--color-danger)]">{errors.systemPrompt}</p>
          )}
          <p
            className={`ml-auto text-xs ${tokenCount > SYSTEM_PROMPT_MAX_TOKENS ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'} ${isTokenCountDebouncing ? 'animate-pulse' : ''}`}
          >
            Tokens: {tokenCount} / {SYSTEM_PROMPT_MAX_TOKENS}
          </p>
        </div>
      </div>

      {/* Private Prompt */}
      <div className="flex flex-col gap-2">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Private Instructions
          </label>
          <span className="text-xs text-[var(--color-text-muted)]">Hidden from attackers.</span>
        </div>
        <textarea
          name="privatePrompt"
          value={formData.privatePrompt}
          onChange={handleChangeWithProviderReset}
          className="font-body min-h-[80px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
          placeholder="Secret context..."
        />
        {errors.privatePrompt && (
          <p className="text-sm text-[var(--color-danger)]">{errors.privatePrompt}</p>
        )}
      </div>

      {/* Attack Goal */}
      <div className="flex flex-col gap-2">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Attack Objective
          </label>
          <span className="text-xs text-[var(--color-text-muted)]">
            What attackers are trying to get the sentinel to do.
          </span>
        </div>
        <textarea
          name="attackGoal"
          value={formData.attackGoal}
          onChange={handleChangeWithProviderReset}
          className="font-body min-h-[80px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
          placeholder="Say the secret phrase..."
        />
        {errors.attackGoal && (
          <p className="text-sm text-[var(--color-danger)]">{errors.attackGoal}</p>
        )}
      </div>

      {/* Fee & Bounty */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <FormInput
            label={`Bounty Pool (${selectedToken.symbol})`}
            subLabel="Drawn from syndicate balance"
            name="initialBalance"
            value={formData.initialBalance}
            onChange={handleChangeWithProviderReset}
            error={errors.initialBalance || bountyError}
            type="number"
            placeholder="0.00"
            step="any"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-muted)]">
              Available:{' '}
              <span className="font-medium text-[var(--color-text-primary)]">
                {availableBalance || '0.00'} {selectedToken.symbol}
              </span>
            </span>
            {availableWei > 0n && (
              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, initialBalance: availableBalance }))
                }
                className="font-medium text-[var(--color-gold-primary)] hover:text-[var(--color-gold-light)]"
              >
                MAX
              </button>
            )}
          </div>
        </div>
        <FormInput
          label={`Fee Per Message (${selectedToken.symbol})`}
          subLabel="Earned per interaction"
          name="feePerMessage"
          value={formData.feePerMessage}
          onChange={handleChangeWithProviderReset}
          error={errors.feePerMessage}
          type="number"
          placeholder="0.00"
          step="any"
        />
      </div>

      <RewardsConditions />

      <button
        type="submit"
        disabled={isLoading || insufficientBounty || tokenCount > SYSTEM_PROMPT_MAX_TOKENS || (formData.llmProvider === 'custom' && !customProvider.isValidated)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] shadow-[var(--shadow-card)] transition-all hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Launching Sentinel...
          </>
        ) : (
          'Launch Sentinel'
        )}
      </button>
    </form>
  )
}
