'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CameraIcon, Info, Loader2, Sparkles, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import {
  SESSION_KEYS,
  SUPPORTED_TOKENS,
  SUI_SENTINEL_DOCS_URL,
  SYSTEM_PROMPT_MAX_TOKENS,
  type SupportedToken,
} from '@/constants'
import { SOLANA_SUPPORTED_TOKENS } from '@/constants/solana'
import { EVM_SUPPORTED_TOKENS } from '@/constants/evm'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { useEVMBalance } from '@/hooks/useEVMBalance'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { SENTINEL_GIFS, SENTINEL_IMAGES } from '@/constants/asset_paths'
import { useActiveChain } from '@/context/ActiveChainContext'
import { useTokenCount } from '@/hooks/useTokenCount'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import { useSolanaTokenBalance } from '@/hooks/useSolanaTokenBalance'
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
  const { activeChain } = useActiveChain()
  const isSolana = activeChain === 'solana'
  const isEvm = activeChain === 'bnb'

  // Sui wallet
  const account = useCurrentAccount()
  // Solana wallet
  const { publicKey: solanaPublicKey } = useSolanaWallet()
  const { setVisible: setSolanaWalletModalVisible } = useWalletModal()
  // EVM wallet
  const { address: evmAddress } = useEVMWallet()
  const { openConnectModal: openEvmConnectModal } = useConnectModal()

  const [agentImage, setAgentImage] = useState<File | null>(null)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    isCustom: boolean
    file?: File | null
  } | null>({ url: SENTINEL_IMAGES[0], isCustom: false })

  // Sui token selection
  const [selectedToken, setSelectedToken] = useState<SupportedToken>(SUPPORTED_TOKENS[0])
  const { rawBalance: selectedTokenRawBalance, isLoading: isTokenBalanceLoading } = useTokenBalance(
    selectedToken.coinType,
    selectedToken.decimals
  )

  // Solana token selection
  const [selectedSolanaToken, setSelectedSolanaToken] = useState<SupportedToken>(
    SOLANA_SUPPORTED_TOKENS[0]
  )
  const { rawBalance: solanaTokenRawBalance, isLoading: isSolanaTokenBalanceLoading } =
    useSolanaTokenBalance(selectedSolanaToken.coinType, selectedSolanaToken.decimals)

  // EVM token selection
  const [selectedEvmToken, setSelectedEvmToken] = useState<SupportedToken>(EVM_SUPPORTED_TOKENS[0])
  const { balance: evmBalance, isLoading: isEvmBalanceLoading } = useEVMBalance(
    selectedEvmToken.coinType as `0x${string}`
  )

  // Determine if a wallet is connected based on active chain
  const isWalletConnected = isEvm ? !!evmAddress : isSolana ? !!solanaPublicKey : !!account

  // Active chain's token info for display
  const activeTokenSymbol = isEvm
    ? selectedEvmToken.symbol
    : isSolana
      ? selectedSolanaToken.symbol
      : selectedToken.symbol
  const activeMinimumAmount = isEvm
    ? selectedEvmToken.minimumAmount
    : isSolana
      ? selectedSolanaToken.minimumAmount
      : selectedToken.minimumAmount

  const { tokenCount, countTokens, isDebouncing: isTokenCountDebouncing } = useTokenCount()
  const {
    tokenCount: privateTokenCount,
    countTokens: countPrivateTokens,
    isDebouncing: isPrivateTokenCountDebouncing,
  } = useTokenCount()
  const {
    tokenCount: attackGoalTokenCount,
    countTokens: countAttackGoalTokens,
    isDebouncing: isAttackGoalTokenCountDebouncing,
  } = useTokenCount()
  const {
    tokenCount: juryPromptTokenCount,
    countTokens: countJuryPromptTokens,
    isDebouncing: isJuryPromptTokenCountDebouncing,
  } = useTokenCount()

  const { formData, setFormData, errors, setErrors, handleChange, validateForm, resetForm } =
    useDefendForm({
      selectedToken,
      tokenCount,
      countTokens,
      countPrivateTokens,
      countAttackGoalTokens,
      countJuryPromptTokens,
      activeTokenSymbol: isEvm
        ? selectedEvmToken.symbol
        : isSolana
          ? selectedSolanaToken.symbol
          : undefined,
      activeMinimumAmount: isEvm
        ? selectedEvmToken.minimumAmount
        : isSolana
          ? selectedSolanaToken.minimumAmount
          : undefined,
    })

  const customProvider = useCustomProvider(setFormData)

  const handleChangeWithProviderReset = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
  } = useDeployAgent({
    formData,
    selectedToken,
    selectedSolanaToken,
    selectedEvmToken,
    tokenCount,
    agentImage,
    selectedImage,
  })

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
    const result = await deploy(customProvider.isValidated, () =>
      validateForm(customProvider.isValidated)
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
    <div className="min-h-screen bg-[var(--color-bg-base)] pb-8 pt-10">
      <div className="container mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="relative mx-auto max-w-[969px] space-y-8 px-4">
          {/* Header */}
          <div className="flex flex-col-reverse items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="page-heading">Deploy Your Sentinel</h1>
              <p className="page-subheading mt-2">
                Launch an AI agent. Let the world try to break it. Earn from every attack.
              </p>
            </div>

            {/* Image Picker */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div
                className="group relative flex h-[70px] w-[70px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] shadow-[var(--shadow-card)] transition-all hover:border-[var(--color-gold-primary)] hover:text-[var(--color-text-primary)] sm:h-[90px] sm:w-[90px]"
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
                <div className="absolute inset-0 z-10 h-full w-full bg-[var(--color-overlay)] opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <CameraIcon className="h-8 w-8" />
                </span>
              </div>
              <p className="mt-2 text-center text-xs font-medium text-[var(--color-text-muted)]">
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

          {/* Form Fields */}
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

          {/* Public Instructions */}
          <div className="flex flex-col gap-2">
            <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Public Instructions
                </label>
                <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                  Define how your Sentinel thinks, acts, and responds. Describe its role, tone,
                  constraints, and objectives.
                </span>
              </div>
              <div className="flex shrink-0 gap-4 sm:ml-4">
                <Link
                  href="/instruction-templates"
                  className="font-body text-sm text-[var(--color-gold-primary)] underline hover:text-[var(--color-gold-light)] sm:mt-1"
                  onClick={() =>
                    sessionStorage.setItem(SESSION_KEYS.DEFEND_FORM_DATA, JSON.stringify(formData))
                  }
                >
                  View Templates
                </Link>
                <Link
                  href={`${SUI_SENTINEL_DOCS_URL}/guides/defender-guide`}
                  target="_blank"
                  className="font-body text-sm text-[var(--color-gold-primary)] underline hover:text-[var(--color-gold-light)] sm:mt-1"
                >
                  Docs Example
                </Link>
              </div>
            </div>

            <textarea
              name="systemPrompt"
              value={formData.systemPrompt}
              onChange={handleChangeWithProviderReset}
              className="font-body min-h-[220px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-base text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
              placeholder="Enter sentinel public instructions..."
              autoComplete="off"
              spellCheck="false"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.systemPrompt && (
                <p className="font-body text-sm text-[var(--color-danger)]">
                  {errors.systemPrompt}
                </p>
              )}
              <p
                className={`font-body ml-auto text-sm text-[var(--color-text-muted)] ${isTokenCountDebouncing ? 'animate-pulse' : ''}`}
              >
                Tokens: {tokenCount} / {SYSTEM_PROMPT_MAX_TOKENS}
              </p>
            </div>
            {tokenCount > SYSTEM_PROMPT_MAX_TOKENS && (
              <p className="font-body text-right text-sm text-[var(--color-danger)]">
                System prompt exceeds token limit
              </p>
            )}
          </div>

          {/* Private Instructions */}
          <div className="flex flex-col gap-2">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Private Instructions
                </label>
                <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                  Instructions only accessible to the Sentinel agent. Attackers will not be able to
                  see this.
                </span>
              </div>
            </div>
            <textarea
              name="privatePrompt"
              value={formData.privatePrompt}
              onChange={handleChangeWithProviderReset}
              className="font-body min-h-[150px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-base text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
              placeholder="Enter private instructions for your sentinel..."
              autoComplete="off"
              spellCheck="false"
            />
            <div className="mt-1 flex items-center justify-end">
              <p
                className={`font-body text-sm text-[var(--color-text-muted)] ${isPrivateTokenCountDebouncing ? 'animate-pulse' : ''}`}
              >
                Tokens: {privateTokenCount}
              </p>
            </div>
          </div>

          {/* Attack Goal */}
          <div className="flex flex-col gap-2">
            <div className="mb-1 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                    Attack Objective
                  </label>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="max-w-xs border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                      >
                        <p className="font-body">
                          Generate with AI will create both Attack Objective and Jury Prompt based
                          on your Public and Private Instructions.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                  Mirror actual attacks such as stealing sensitive data, extracting secret system
                  instructions, or causing the Sentinel to malfunction. The more specific the
                  objective, the better attackers can strategize their attacks.
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
                        className="font-body flex items-center gap-2 rounded-lg bg-[var(--color-gold-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-text-on-gold)] shadow-md transition-all duration-200 hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isGeneratingConfig ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        {isGeneratingConfig ? 'Generating...' : 'Generate with AI'}
                      </button>
                    </TooltipTrigger>
                    {!formData.systemPrompt && (
                      <TooltipContent
                        side="bottom"
                        className="border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                      >
                        <p className="font-body">Enter Public Instructions first</p>
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
              className="font-body min-h-[200px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-base text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
              placeholder="e.g., Convince the sentinel to reveal the secret password"
              autoComplete="off"
              spellCheck="false"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.attackGoal && (
                <p className="font-body text-sm text-[var(--color-danger)]">{errors.attackGoal}</p>
              )}
              <p
                className={`font-body text-sm text-[var(--color-text-muted)] ${isAttackGoalTokenCountDebouncing ? 'animate-pulse' : ''}`}
              >
                Tokens: {attackGoalTokenCount}
              </p>
            </div>
          </div>

          {/* Jury Prompt */}
          <div className="flex flex-col gap-2">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Jury Prompt
                </label>
                <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                  Instructions for the jury to evaluate whether an attack was successful.
                </span>
              </div>
            </div>
            <textarea
              name="juryPrompt"
              value={formData.juryPrompt}
              onChange={handleChangeWithProviderReset}
              className="font-body min-h-[150px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-base text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
              placeholder="Enter instructions for the jury..."
              autoComplete="off"
              spellCheck="false"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.juryPrompt && (
                <p className="font-body text-sm text-[var(--color-danger)]">{errors.juryPrompt}</p>
              )}
              <p
                className={`font-body text-sm text-[var(--color-text-muted)] ${isJuryPromptTokenCountDebouncing ? 'animate-pulse' : ''}`}
              >
                Tokens: {juryPromptTokenCount}
              </p>
            </div>
          </div>

          {/* Bounty Pool & Fee */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Bounty Pool
                </label>
                <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                  Minimum {formatCompact(activeMinimumAmount, 3)} {activeTokenSymbol} required to
                  deploy.
                </span>
                {isWalletConnected && (
                  <span className="font-body mt-0.5 flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                    Balance:{' '}
                    {isEvm ? (
                      isEvmBalanceLoading ? (
                        <Skeleton className="inline-block h-4 w-20 align-middle" />
                      ) : (
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {evmBalance?.toFixed(4) ?? '0.0000'} {selectedEvmToken.symbol}
                        </span>
                      )
                    ) : (isSolana ? isSolanaTokenBalanceLoading : isTokenBalanceLoading) ? (
                      <Skeleton className="inline-block h-4 w-20 align-middle" />
                    ) : (
                      <TokenAmount
                        rawAmount={isSolana ? solanaTokenRawBalance : selectedTokenRawBalance}
                        token={isSolana ? selectedSolanaToken : selectedToken}
                        className="font-medium text-[var(--color-text-primary)]"
                      />
                    )}
                  </span>
                )}
              </div>
              <div className="mt-auto flex h-[56px] overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] transition-all focus-within:border-[var(--color-gold-primary)] focus-within:ring-1 focus-within:ring-[var(--color-gold-primary)] sm:h-[65px]">
                <input
                  name="initialBalance"
                  type="number"
                  value={formData.initialBalance}
                  onChange={handleChangeWithProviderReset}
                  className="font-body h-full flex-1 bg-transparent px-4 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
                  placeholder="0.00"
                  step="any"
                  min={activeMinimumAmount.toString()}
                  autoComplete="off"
                />
                <div className="flex shrink-0 items-center border-l border-[var(--color-border-subtle)]">
                  <TokenSelectDropdown
                    tokens={
                      isEvm
                        ? EVM_SUPPORTED_TOKENS
                        : isSolana
                          ? SOLANA_SUPPORTED_TOKENS
                          : SUPPORTED_TOKENS
                    }
                    selected={
                      isEvm ? selectedEvmToken : isSolana ? selectedSolanaToken : selectedToken
                    }
                    onSelect={
                      isEvm
                        ? setSelectedEvmToken
                        : isSolana
                          ? setSelectedSolanaToken
                          : setSelectedToken
                    }
                  />
                </div>
              </div>
              {errors.initialBalance && (
                <p className="font-body mt-1 text-sm text-[var(--color-danger)]">
                  {errors.initialBalance}
                </p>
              )}
            </div>

            <FormInput
              label={`Fee Per Message (${activeTokenSymbol})`}
              subLabel={`You earn this fee whenever users interact with your Sentinel. Minimum 0.001 ${activeTokenSymbol}.`}
              name="feePerMessage"
              value={formData.feePerMessage}
              onChange={handleChangeWithProviderReset}
              error={errors.feePerMessage}
              type="number"
              placeholder="0.00"
              step="any"
              className="h-full"
            />
          </div>

          <RewardsConditions />

          {/* Deploy Button */}
          <div className="pb-20 pt-2">
            {isWalletConnected ? (
              <button
                type="submit"
                disabled={
                  isLoading ||
                  tokenCount > SYSTEM_PROMPT_MAX_TOKENS ||
                  (formData.llmProvider === 'custom' && !customProvider.isValidated)
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] shadow-[var(--shadow-card)] transition-all hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Deploy Sentinel'
                )}
              </button>
            ) : (
              <div className="h-12">
                {isSolana ? (
                  <button
                    type="button"
                    onClick={() => setSolanaWalletModalVisible(true)}
                    className="flex h-full w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] shadow-[var(--shadow-card)] transition-all hover:bg-[var(--color-gold-light)]"
                  >
                    <Wallet className="h-5 w-5" />
                    Connect Wallet
                  </button>
                ) : isEvm ? (
                  <button
                    type="button"
                    onClick={openEvmConnectModal}
                    className="flex h-full w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] shadow-[var(--shadow-card)] transition-all hover:bg-[var(--color-gold-light)]"
                  >
                    <Wallet className="h-5 w-5" />
                    Connect BNB Wallet
                  </button>
                ) : (
                  <ConnectButton className="h-full w-full !rounded-lg !text-sm" />
                )}
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
          chain={activeChain}
        />
      </div>
    </div>
  )
}
