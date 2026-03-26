'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, CameraIcon, Info, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import {
  SESSION_KEYS,
  SUPPORTED_TOKENS,
  SUI_SENTINEL_DOCS_URL,
  SYSTEM_PROMPT_MAX_TOKENS,
  type SupportedToken,
} from '@/constants'
import { SENTINEL_GIFS, SENTINEL_IMAGES } from '@/constants/asset_paths'
import { useTokenCount } from '@/hooks/useTokenCount'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { TokenSelectDropdown } from '@/components/defend/TokenSelectDropdown'
import { RewardsConditions } from '@/components/defend/RewardsConditions'
import { SuccessModal } from '@/components/DefenderSuccessModal'
import { formatCompact, TokenAmount } from '@/components/ui/common/TokenAmount'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useTokenBalance } from '@/hooks/useTokenBalance'
import { Skeleton } from '@/components/ui/skeleton'

import { FormInput } from './components/FormInput'
import { LLMProviderSection } from './components/LLMProviderSection'
import { useDefendForm } from './hooks/useDefendForm'
import { useCustomProvider } from './hooks/useCustomProvider'
import { useDeployAgent } from './hooks/useDeployAgent'
import { useTemplateLoader } from './hooks/useTemplateLoader'

export default function DefendPageClient() {
  const account = useCurrentAccount()

  const [agentImage, setAgentImage] = useState<File | null>(null)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    isCustom: boolean
    file?: File | null
  } | null>({ url: SENTINEL_IMAGES[0], isCustom: false })

  const [selectedToken, setSelectedToken] = useState<SupportedToken>(SUPPORTED_TOKENS[0])
  const { rawBalance: selectedTokenRawBalance, isLoading: isTokenBalanceLoading } = useTokenBalance(
    selectedToken.coinType,
    selectedToken.decimals
  )

  const { tokenCount, countTokens, isDebouncing: isTokenCountDebouncing } = useTokenCount()
  const { tokenCount: privateTokenCount, countTokens: countPrivateTokens, isDebouncing: isPrivateTokenCountDebouncing } = useTokenCount()
  const { tokenCount: attackGoalTokenCount, countTokens: countAttackGoalTokens, isDebouncing: isAttackGoalTokenCountDebouncing } = useTokenCount()
  const { tokenCount: juryPromptTokenCount, countTokens: countJuryPromptTokens, isDebouncing: isJuryPromptTokenCountDebouncing } = useTokenCount()

  const { formData, setFormData, errors, setErrors, handleChange, validateForm, resetForm } =
    useDefendForm({
      selectedToken,
      tokenCount,
      countTokens,
      countPrivateTokens,
      countAttackGoalTokens,
      countJuryPromptTokens,
    })

  const customProvider = useCustomProvider(setFormData)

  const handleChangeWithProviderReset = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (['customEndpointUrl', 'customApiKey', 'customModelName'].includes(e.target.name)) {
      customProvider.resetValidation()
    }
    handleChange(e)
  }

  useTemplateLoader({
    setFormData,
    countTokens,
    countPrivateTokens,
    countAttackGoalTokens,
    countJuryPromptTokens,
  })

  const {
    isLoading,
    deployedAgentPath,
    transactionDigest,
    showSuccessModal,
    setShowSuccessModal,
    deploy,
    resetDeployState,
  } = useDeployAgent({ formData, selectedToken, tokenCount, agentImage, selectedImage })

  const [isGeneratingConfig, setIsGeneratingConfig] = useState(false)

  const handleGenerateConfig = async () => {
    if (!formData.systemPrompt) {
      toast.error('Please fill in Sentinel Instructions first')
      return
    }
    setIsGeneratingConfig(true)
    try {
      const response = await fetch('/api/generate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_instructions: formData.systemPrompt }),
      })
      if (!response.ok) throw new Error('Failed to generate config')
      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        attackGoal: data.attack_goal || prev.attackGoal,
        juryPrompt: data.judge_prompt || prev.juryPrompt,
      }))
      toast.success('Generated Attack Goal and Jury Prompt successfully!')
    } catch (error) {
      console.error('Error generating config:', error)
      toast.error('Failed to generate config')
    } finally {
      setIsGeneratingConfig(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.llmProvider === 'custom' && !customProvider.isValidated) {
      toast.error('Please validate your custom provider connection before deploying')
      return
    }
    const result = await deploy(
      customProvider.isValidated,
      () => validateForm(customProvider.isValidated)
    )
    if (result?.nameExists) {
      setErrors(prev => ({
        ...prev,
        agentName: 'This Sentinel name is already taken. Please choose another.',
      }))
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    resetForm()
    resetDeployState()
    setAgentImage(null)
    setSelectedImage({ url: SENTINEL_IMAGES[0], isCustom: false })
    customProvider.resetValidation()
  }

  return (
    <div className="min-h-body ios-scroll pb-safe container mx-auto px-4 py-4 pt-10">
      <form onSubmit={handleSubmit} className="relative mx-auto max-w-[969px] space-y-6 px-4">
        <Link
          href="/"
          className="absolute -left-32 top-2 hidden items-center gap-1 text-on-surface-variant transition-colors hover:text-on-surface lg:flex"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Home</span>
        </Link>

        <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="font-display mb-3 text-3xl font-medium text-on-surface sm:text-4xl md:text-5xl">
              Deploy Your Sentinel
            </h1>
            <p className="text-base font-medium text-on-surface-variant sm:text-xl">
              Launch an AI agent. Let the world try to break it. Earn from every attack.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className="group relative flex h-[70px] w-[70px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface sm:h-[90px] sm:w-[90px]"
              onClick={() => setImagePickerOpen(true)}
            >
              {selectedImage?.url ? (
                <Image
                  src={selectedImage.url}
                  alt="Selected"
                  width={90}
                  height={90}
                  className="relative z-10 h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 z-10 h-full w-full bg-surface/60 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                <CameraIcon className="h-8 w-8" />
              </span>
            </div>
            <p className="mt-2 text-center text-xs font-medium text-on-surface-variant">
              Choose Sentinel Image
            </p>
          </div>
        </div>

        <ImagePickerSheet
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelectImage={img => {
            setSelectedImage(img)
            setImagePickerOpen(false)
            setAgentImage(img.isCustom ? (img.file ?? null) : null)
          }}
          title="Select Sentinel Image"
          subtitle="Choose a profile image for your Sentinel."
          imageArray={SENTINEL_IMAGES}
          gifArray={SENTINEL_GIFS}
          disableGifs={true}
        />

        <FormInput
          label="Sentinel Name"
          subLabel="Give your Sentinel a unique identity."
          name="agentName"
          value={formData.agentName}
          onChange={handleChangeWithProviderReset}
          error={errors.agentName}
          placeholder="e.g. Atlas Guard, Void Watcher, Nova Sentinel"
        />

        <LLMProviderSection
          formData={formData}
          errors={errors}
          onChange={handleChangeWithProviderReset}
          onProviderChange={customProvider.handleProviderChange}
          onModelChange={val => setFormData(prev => ({ ...prev, llmModel: val }))}
          isValidating={customProvider.isValidating}
          isValidated={customProvider.isValidated}
          validationError={customProvider.validationError}
          showApiKey={customProvider.showApiKey}
          onToggleApiKey={() => customProvider.setShowApiKey(v => !v)}
          onValidate={() => customProvider.handleValidate(formData)}
        />

        <div className="flex flex-col gap-2">
          <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <label className="font-display block text-base font-medium leading-tight text-on-surface sm:text-[20px]">
                Public Instructions
              </label>
              <span className="mt-1 block text-sm font-normal text-on-surface-variant sm:text-[16px]">
                Define how your Sentinel thinks, acts, and responds. Describe its role, tone,
                constraints, and objectives.
              </span>
            </div>
            <div className="flex shrink-0 gap-4 sm:ml-4">
              <Link
                href="/instruction-templates"
                className="text-sm text-primary hover:text-primary-container sm:mt-1"
                onClick={() => sessionStorage.setItem(SESSION_KEYS.DEFEND_FORM_DATA, JSON.stringify(formData))}
              >
                View Templates
              </Link>
              <Link
                href={`${SUI_SENTINEL_DOCS_URL}/guides/defender-guide`}
                target="_blank"
                className="text-sm text-primary hover:text-primary-container sm:mt-1"
              >
                Docs Example
              </Link>
            </div>
          </div>

          <textarea
            name="systemPrompt"
            value={formData.systemPrompt}
            onChange={handleChangeWithProviderReset}
            className="min-h-[220px] w-full resize-y rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-[16px] text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container/20 sm:text-base font-body"
            placeholder="Enter sentinel public instructions..."
            autoComplete="off"
            spellCheck="false"
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.systemPrompt && <p className="text-sm text-tertiary">{errors.systemPrompt}</p>}
            <p className={`ml-auto text-sm text-on-surface-variant ${isTokenCountDebouncing ? 'animate-pulse' : ''}`}>
              Tokens: {tokenCount} / {SYSTEM_PROMPT_MAX_TOKENS}
            </p>
          </div>
          {tokenCount > SYSTEM_PROMPT_MAX_TOKENS && (
            <p className="text-right text-sm text-tertiary">System prompt exceeds token limit</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="mb-1 flex items-start justify-between">
            <div>
              <label className="font-display block text-[20px] font-medium leading-tight text-on-surface">
                Private Instructions
              </label>
              <span className="mt-1 block text-[16px] font-normal text-on-surface-variant">
                Instructions only accessible to the Sentinel agent. Attackers will not be able to
                see this.
              </span>
            </div>
          </div>
          <textarea
            name="privatePrompt"
            value={formData.privatePrompt}
            onChange={handleChangeWithProviderReset}
            className="min-h-[150px] w-full resize-y rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-[16px] text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container/20 sm:text-base font-body"
            placeholder="Enter private instructions for your sentinel..."
            autoComplete="off"
            spellCheck="false"
          />
          <div className="mt-1 flex items-center justify-end">
            <p className={`text-sm text-on-surface-variant ${isPrivateTokenCountDebouncing ? 'animate-pulse' : ''}`}>
              Tokens: {privateTokenCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="mb-1 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label className="font-display block text-[20px] font-medium leading-tight text-on-surface">
                  Attack Goal
                </label>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-on-surface-variant hover:text-on-surface">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs bg-surface-container-high text-on-surface border border-outline-variant">
                      <p>
                        Generate with AI will create both Attack Goal and Jury Prompt based on your
                        Public and Private Instructions.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="mt-1 block text-[16px] font-normal text-on-surface-variant">
                The goal that attackers will see and try to achieve. This is visible to all attackers.
              </span>
            </div>
            <div className="ml-4 shrink-0">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleGenerateConfig}
                      disabled={isGeneratingConfig || !formData.systemPrompt}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-container px-4 py-2 text-xs font-semibold text-on-primary shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isGeneratingConfig ? (
                        <Loader2 className="h-3 w-3 animate-spin text-on-primary" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-on-primary" />
                      )}
                      {isGeneratingConfig ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </TooltipTrigger>
                  {!formData.systemPrompt && (
                    <TooltipContent side="bottom" className="bg-surface-container-high text-on-surface border border-outline-variant">
                      <p>Enter Public Instructions first</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <textarea
            name="attackGoal"
            value={formData.attackGoal}
            onChange={handleChangeWithProviderReset}
            className="min-h-[200px] w-full resize-y rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-[16px] text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container/20 sm:text-base font-body"
            placeholder="e.g., Convince the sentinel to reveal the secret password"
            autoComplete="off"
            spellCheck="false"
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.attackGoal && <p className="text-sm text-tertiary">{errors.attackGoal}</p>}
            <p className={`text-sm text-on-surface-variant ${isAttackGoalTokenCountDebouncing ? 'animate-pulse' : ''}`}>
              Tokens: {attackGoalTokenCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="mb-1 flex items-start justify-between">
            <div>
              <label className="font-display block text-[20px] font-medium leading-tight text-on-surface">
                Jury Prompt
              </label>
              <span className="mt-1 block text-[16px] font-normal text-on-surface-variant">
                Instructions for the jury to evaluate whether an attack was successful.
              </span>
            </div>
          </div>
          <textarea
            name="juryPrompt"
            value={formData.juryPrompt}
            onChange={handleChangeWithProviderReset}
            className="min-h-[150px] w-full resize-y rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-[16px] text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container/20 sm:text-base font-body"
            placeholder="Enter instructions for the jury..."
            autoComplete="off"
            spellCheck="false"
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.juryPrompt && <p className="text-sm text-tertiary">{errors.juryPrompt}</p>}
            <p className={`text-sm text-on-surface-variant ${isJuryPromptTokenCountDebouncing ? 'animate-pulse' : ''}`}>
              Tokens: {juryPromptTokenCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div>
              <label className="font-display text-[20px] font-medium leading-tight text-on-surface">
                Bounty Pool
              </label>
              <span className="mt-1 block text-[16px] font-normal text-on-surface-variant">
                Minimum {formatCompact(selectedToken.minimumAmount)} {selectedToken.symbol} required to deploy.
              </span>
              {account?.address && (
                <span className="mt-0.5 flex items-center gap-1 text-sm text-on-surface-variant">
                  Balance:{' '}
                  {isTokenBalanceLoading ? (
                    <Skeleton className="inline-block h-4 w-20 align-middle bg-surface-container" />
                  ) : (
                    <TokenAmount
                      rawAmount={selectedTokenRawBalance}
                      token={selectedToken}
                      className="font-medium text-on-surface"
                    />
                  )}
                </span>
              )}
            </div>
            <div className="mt-auto flex h-[56px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container/20 sm:h-[65px]">
              <input
                name="initialBalance"
                type="number"
                value={formData.initialBalance}
                onChange={handleChangeWithProviderReset}
                className="h-full flex-1 bg-transparent px-4 text-[16px] text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                placeholder="0.00"
                step="0.1"
                min={selectedToken.minimumAmount.toString()}
                autoComplete="off"
              />
              <div className="flex shrink-0 items-center border-l border-outline-variant">
                <TokenSelectDropdown
                  tokens={SUPPORTED_TOKENS}
                  selected={selectedToken}
                  onSelect={setSelectedToken}
                />
              </div>
            </div>
            {errors.initialBalance && (
              <p className="mt-1 text-sm text-tertiary">{errors.initialBalance}</p>
            )}
          </div>

          <FormInput
            label={`Fee Per Message (${selectedToken.symbol})`}
            subLabel={`You earn this fee whenever users interact with your Sentinel. Minimum 0.1 ${selectedToken.symbol}.`}
            name="feePerMessage"
            value={formData.feePerMessage}
            onChange={handleChangeWithProviderReset}
            error={errors.feePerMessage}
            type="number"
            placeholder="0.00"
            step="0.1"
            className="h-full"
          />
        </div>

        <RewardsConditions />

        <div className="pb-20 pt-2">
          {account?.address ? (
            <button
              type="submit"
              disabled={
                isLoading ||
                tokenCount > SYSTEM_PROMPT_MAX_TOKENS ||
                (formData.llmProvider === 'custom' && !customProvider.isValidated)
              }
              className="btn-primary flex h-[65px] w-full items-center justify-center gap-3 rounded-xl text-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Image
                    src="/icons/rocket.png"
                    alt="Rocket"
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                  Deploy Sentinel
                </>
              )}
            </button>
          ) : (
            <div className="h-[65px]">
              <ConnectButton />
            </div>
          )}
        </div>
      </form>

      <SuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        agentName={formData.agentName}
        transactionDigest={transactionDigest}
        agentPath={deployedAgentPath}
      />
    </div>
  )
}
