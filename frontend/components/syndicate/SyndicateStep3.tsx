'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { SENTINEL_IMAGES } from '@/constants/asset_paths'
import { SYSTEM_PROMPT_MAX_TOKENS } from '@/constants'
import { FormInput } from '@/app/defend/components/FormInput'
import { LLMProviderSection } from '@/app/defend/components/LLMProviderSection'
import { RewardsConditions } from '@/components/defend/RewardsConditions'
import { useDefendForm } from '@/app/defend/hooks/useDefendForm'
import { useCustomProvider } from '@/app/defend/hooks/useCustomProvider'
import { useTokenCount } from '@/hooks/useTokenCount'
import { useDeploySyndicateAgent } from '@/hooks/syndicate/useDeploySyndicateAgent'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import type { SupportedToken } from '@/constants/shared'

interface SyndicateStep3Props {
  syndicateAddress: `0x${string}`
  selectedToken: SupportedToken
  onComplete: (agentId: string, txHash: string) => void
}

export function SyndicateStep3({ syndicateAddress, selectedToken, onComplete }: SyndicateStep3Props) {
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
  const { countTokens: countJuryPromptTokens } = useTokenCount()

  const { formData, errors, handleChange, validateForm, setFormData } = useDefendForm({
    selectedToken,
    tokenCount,
    countTokens,
    countPrivateTokens,
    countAttackGoalTokens,
    countJuryPromptTokens,
    activeTokenSymbol: selectedToken.symbol,
    activeMinimumAmount: selectedToken.minimumAmount,
  })

  const customProvider = useCustomProvider(setFormData)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(customProvider.isValidated)) {
      if (formData.llmProvider === 'custom' && !customProvider.isValidated) {
        toast.error('Please validate your custom provider connection before deploying')
      }
      return
    }

    try {
      const checkRes = await fetch(
        `/api/agents/check-name?name=${encodeURIComponent(formData.agentName)}`
      )
      const checkData = await checkRes.json()
      if (checkData.exists) {
        toast.error('A sentinel with this name already exists')
        return
      }

      const result = await deploy()
      toast.success('Sentinel launched!')
      onComplete(result.agentId, result.txHash)
    } catch (err: any) {
      toast.error(err.message || 'Failed to launch sentinel')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
        onChange={handleChangeWithProviderReset}
        onProviderChange={customProvider.handleProviderChange}
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
          className="font-body min-h-[80px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
          placeholder="Secret context..."
        />
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

      {/* Jury Prompt */}
      <div className="flex flex-col gap-2">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Jury Prompt
          </label>
          <span className="text-xs text-[var(--color-text-muted)]">
            Instructions for evaluating attack success.
          </span>
        </div>
        <textarea
          name="juryPrompt"
          value={formData.juryPrompt}
          onChange={handleChangeWithProviderReset}
          className="font-body min-h-[80px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
          placeholder="The attack is successful if..."
        />
        {errors.juryPrompt && (
          <p className="text-sm text-[var(--color-danger)]">{errors.juryPrompt}</p>
        )}
      </div>

      {/* Fee & Bounty */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label={`Bounty Pool (${selectedToken.symbol})`}
          subLabel={`Min ${selectedToken.minimumAmount} ${selectedToken.symbol}`}
          name="initialBalance"
          value={formData.initialBalance}
          onChange={handleChangeWithProviderReset}
          error={errors.initialBalance}
          type="number"
          placeholder="0.00"
          step="any"
        />
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
        disabled={isLoading || tokenCount > SYSTEM_PROMPT_MAX_TOKENS || (formData.llmProvider === 'custom' && !customProvider.isValidated)}
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
