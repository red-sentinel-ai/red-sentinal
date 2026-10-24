'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CameraIcon, Info, Loader2, Sparkles, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { SESSION_KEYS, SUI_SENTINEL_DOCS_URL, SYSTEM_PROMPT_MAX_TOKENS } from '@/constants'
import type { SupportedToken } from '@/constants/shared'
import type { SentinelTemplate } from '@/types'
import { isEvmChain } from '@/constants/chains'
import { SUPPORTED_TOKENS, SOLANA_SUPPORTED_TOKENS, getSupportedTokens } from '@/constants/tokens'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { useEVMBalance } from '@/hooks/useEVMBalance'
import { usePrivyConnect } from '@/hooks/usePrivyConnect'
import { SENTINEL_GIFS, SENTINEL_IMAGES } from '@/constants/asset_paths'
import { useActiveChain } from '@/context/ActiveChainContext'
import { useTokenCount } from '@/hooks/useTokenCount'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import { useSolanaTokenBalance } from '@/hooks/useSolanaTokenBalance'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { TokenSelectDropdown } from '@/components/defend/TokenSelectDropdown'
import { TagSelectDropdown } from '@/components/defend/TagSelectDropdown'
import { RewardsConditions } from '@/components/defend/RewardsConditions'
import { SuccessModal } from '@/components/DefenderSuccessModal'
import { TokenAmount } from '@/components/ui/common/TokenAmount'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useSuiTokenBalance } from '@/hooks/useSuiTokenBalance'
import { Skeleton } from '@/components/ui/skeleton'

import { SentinelTypeToggle } from '@/components/defend/agentic/SentinelTypeToggle'
import { QuickLaunchTemplates } from '@/components/defend/QuickLaunchTemplates'
import { EnvironmentTemplatePicker } from '@/components/defend/agentic/EnvironmentTemplatePicker'
import { EnvironmentConfigPanel } from '@/components/defend/agentic/EnvironmentConfigPanel'
import { LiveToolsChecklist } from '@/components/defend/agentic/LiveToolsChecklist'
import { DeploymentMethodSelector } from '@/components/defend/agentic/connected/DeploymentMethodSelector'
import { ExternalConnectionWarning } from '@/components/defend/agentic/connected/ExternalConnectionWarning'
import { McpConnectionCard } from '@/components/defend/agentic/connected/McpConnectionCard'
import { ExistingAgentConnectionPanel } from '@/components/defend/agentic/connected/ExistingAgentConnectionPanel'
import { ExecutionLimitsFields } from '@/components/defend/agentic/connected/ExecutionLimitsFields'
import { BreachConditionsEditor } from '@/components/defend/agentic/connected/BreachConditionsEditor'
import { PreflightFixturesFields } from '@/components/defend/agentic/connected/PreflightFixturesFields'
import { PreflightPanel } from '@/components/defend/agentic/connected/PreflightPanel'
import { DeploymentReviewCard } from '@/components/defend/agentic/connected/DeploymentReviewCard'
import { useEnvironmentTemplateDetails } from './hooks/useEnvironmentTemplates'
import { buildSeedEnvironmentForTemplate } from './agentic-sample-environments'
import type { AgenticConfig, SentinelType } from './agentic-types'
import { isConnectedDeploymentMethod } from './agentic-types'
import { buildAgenticConfig, validateAgenticSelection } from './agentic-utils'
import {
  findMissingCapabilities,
  getEvidenceSource,
  validateConnectedDeployment,
} from './deployment-utils'
import { SHOPFAST_DEMO_EXAMPLE } from './shopfast-demo-example'
import { FormInput } from './components/FormInput'
import { LLMProviderSection } from './components/LLMProviderSection'
import { useDefendForm } from './hooks/useDefendForm'
import { toPersistableFormData } from './hooks/useDefendForm'
import { useConnectedDeployment } from './hooks/useConnectedDeployment'
import { useCustomProvider } from './hooks/useCustomProvider'
import { useProviderModels } from './hooks/useProviderModels'
import { useDeployAgent } from './hooks/useDeployAgent'
import { useTemplateLoader } from './hooks/useTemplateLoader'
import { SyndicateLaunchFlow } from '@/components/syndicate/SyndicateLaunchFlow'

type DefendMode = 'individual' | 'syndicate'

export default function DefendPageClient() {
  const searchParams = useSearchParams()
  const [defendMode, setDefendMode] = useState<DefendMode>(
    searchParams.get('mode') === 'syndicate' ? 'syndicate' : 'individual'
  )

  const { activeChain } = useActiveChain()
  const isSolana = activeChain === 'solana'
  const isEvm = isEvmChain(activeChain)

  // Sui wallet
  const account = useCurrentAccount()
  const { publicKey: solanaPublicKey } = useSolanaWallet()
  const { openConnectModal: openSolanaConnectModal } = usePrivyConnect()
  const { address: evmAddress } = useEVMWallet()
  const { openConnectModal: openEvmConnectModal } = usePrivyConnect()

  const [sentinelType, setSentinelType] = useState<SentinelType>('basic')
  const connected = useConnectedDeployment()
  const isAgentic = sentinelType === 'agentic'
  // The existing sandbox-template path stays the default until another
  // deployment method is selected (AC-TUSD-001.2).
  const isTemplatePath = isAgentic && connected.method === 'template'
  const isHostedAgent = isAgentic && connected.method === 'hosted_agent'
  const isExistingAgent = isAgentic && connected.method === 'existing_agent'
  const connectedDeploymentActive = isAgentic && isConnectedDeploymentMethod(connected.method)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
  const [agenticEnvironment, setAgenticEnvironment] = useState<Record<string, unknown>>({})
  const [enabledToolIds, setEnabledToolIds] = useState<string[]>([])
  const [enabledLiveToolIds, setEnabledLiveToolIds] = useState<string[]>([])
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const selectedTemplates = useEnvironmentTemplateDetails(selectedTemplateIds)
  const activeTabValue =
    selectedTemplates.find(template => template.template_id === activeTemplateId)?.template_id ??
    selectedTemplates[0]?.template_id

  const toggleTemplate = (templateId: string) => {
    if (selectedTemplateIds.includes(templateId)) {
      const remaining = selectedTemplateIds.filter(id => id !== templateId)
      setSelectedTemplateIds(remaining)
      setActiveTemplateId(current =>
        current === templateId ? (remaining[remaining.length - 1] ?? null) : current
      )
    } else {
      setSelectedTemplateIds([...selectedTemplateIds, templateId])
      setActiveTemplateId(templateId)
    }
  }

  const seededTemplateIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    for (const templateId of Array.from(seededTemplateIdsRef.current)) {
      if (!selectedTemplateIds.includes(templateId)) {
        seededTemplateIdsRef.current.delete(templateId)
      }
    }
  }, [selectedTemplateIds])

  useEffect(() => {
    const templatesToSeed = selectedTemplates.filter(
      template => !seededTemplateIdsRef.current.has(template.template_id)
    )
    if (templatesToSeed.length === 0) return
    templatesToSeed.forEach(template => seededTemplateIdsRef.current.add(template.template_id))

    const defaultToolIds = templatesToSeed.flatMap(template =>
      template.tools.map(tool => tool.tool_id)
    )
    setEnabledToolIds(prev => Array.from(new Set([...prev, ...defaultToolIds])))

    setAgenticEnvironment(prev => {
      const next = { ...prev }
      for (const template of templatesToSeed) {
        if (next[template.namespace] === undefined) {
          next[template.namespace] = buildSeedEnvironmentForTemplate(template)
        }
      }
      return next
    })
  }, [selectedTemplates])

  const [agentImage, setAgentImage] = useState<File | null>(null)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    isCustom: boolean
    file?: File | null
  } | null>({ url: SENTINEL_IMAGES[0], isCustom: false })

  // Sui token selection
  const [selectedToken, setSelectedToken] = useState<SupportedToken>(SUPPORTED_TOKENS[0])
  const { rawBalance: selectedTokenRawBalance, isLoading: isTokenBalanceLoading } =
    useSuiTokenBalance(selectedToken.coinType, selectedToken.decimals)

  // Solana token selection
  const [selectedSolanaToken, setSelectedSolanaToken] = useState<SupportedToken>(
    SOLANA_SUPPORTED_TOKENS[0]
  )
  const { rawBalance: solanaTokenRawBalance, isLoading: isSolanaTokenBalanceLoading } =
    useSolanaTokenBalance(selectedSolanaToken.coinType, selectedSolanaToken.decimals)

  // EVM token selection — choose the right token list for the active EVM chain
  const evmTokenList = getSupportedTokens(activeChain)
  const [selectedEvmToken, setSelectedEvmToken] = useState<SupportedToken>(evmTokenList[0])

  useEffect(() => {
    if (searchParams.get('mode') === 'syndicate') setDefendMode('syndicate')
  }, [searchParams])

  useEffect(() => {
    setSelectedEvmToken(evmTokenList[0])
  }, [activeChain, evmTokenList])
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

  const { formData, setFormData, errors, setErrors, handleChange, validateForm, resetForm } =
    useDefendForm({
      selectedToken,
      tokenCount,
      countTokens,
      countPrivateTokens,
      countAttackGoalTokens,
      activeTokenSymbol: isEvm
        ? selectedEvmToken.symbol
        : isSolana
          ? selectedSolanaToken.symbol
          : undefined,
    })

  const customProvider = useCustomProvider(setFormData)

  // Admin-managed provider/model catalogue with a static fallback; re-point
  // the selected model once it arrives if the fallback default is not in it.
  const { providerModels } = useProviderModels()
  useEffect(() => {
    setFormData(prev => {
      if (prev.llmProvider === 'custom') return prev
      const models = providerModels[prev.llmProvider]
      if (!models?.length || models.includes(prev.llmModel)) return prev
      return { ...prev, llmModel: models[0] }
    })
  }, [providerModels, setFormData])

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
  })

  const agenticConfig = useMemo<AgenticConfig | null>(() => {
    // Only the template path builds the sandbox scenario config — connected
    // methods carry their own Deployment Configuration instead.
    if (sentinelType !== 'agentic' || connected.method !== 'template') return null
    const hasSelection = selectedTemplates.length > 0 || enabledLiveToolIds.length > 0
    if (!hasSelection) return null
    return buildAgenticConfig({
      templates: selectedTemplates,
      enabledToolIds,
      enabledLiveToolIds,
      initialEnvironment: agenticEnvironment,
    })
  }, [
    sentinelType,
    connected.method,
    selectedTemplates,
    enabledToolIds,
    enabledLiveToolIds,
    agenticEnvironment,
  ])

  const connectedDeployment =
    connectedDeploymentActive && connected.method !== 'template' ? connected.payload : null

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
    agenticConfig,
    connectedDeployment,
    selectedTagIds,
  })

  const [isGeneratingConfig, setIsGeneratingConfig] = useState(false)

  const handleQuickLaunch = (template: SentinelTemplate) => {
    setFormData(prev => ({
      ...prev,
      agentName: template.name,
      systemPrompt: template.public_instructions,
      privatePrompt: template.hidden_instructions,
      attackGoal: template.attack_goal,
    }))
    countTokens(template.public_instructions)
    countPrivateTokens(template.hidden_instructions)
    countAttackGoalTokens(template.attack_goal)
    if (template.avatar_url) {
      setSelectedImage({ url: template.avatar_url, isCustom: false })
      setAgentImage(null)
    }
    setSentinelType('basic')
    toast.success('Template loaded — set your bounty and deploy.')
    setTimeout(() => {
      document
        .getElementById('bounty-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

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
      }))
      toast.success('Generated Attack Objective successfully!')
    } catch (error) {
      console.error('Error generating config:', error)
      toast.error('Failed to generate config')
    } finally {
      setIsGeneratingConfig(false)
    }
  }

  // An Existing Agent Connection keeps model settings on the defender's side,
  // so the custom-provider gate only applies when the provider section is shown.
  const providerValidationSatisfied =
    isExistingAgent || formData.llmProvider !== 'custom' || customProvider.isValidated

  const connectedValidationError =
    connectedDeploymentActive && connected.state
      ? validateConnectedDeployment(connected.state)
      : null
  const evidenceSource = getEvidenceSource(connected.method, connected.existingAgent)
  const missingCapabilities = isExistingAgent
    ? findMissingCapabilities(connected.method, connected.existingAgent, connected.breachConditions)
    : []

  // Defender-side model settings sent with the preflight request so a hosted
  // agent's fixtures can run. Per-request only — the backend never stores them.
  const preflightSentinelContext = useMemo(
    () => ({
      public_instructions: formData.systemPrompt,
      hidden_instructions: formData.privatePrompt,
      model_provider: formData.llmProvider,
      model_name: formData.llmProvider === 'custom' ? formData.customModelName : formData.llmModel,
      ...(formData.llmProvider === 'custom' && formData.customEndpointUrl
        ? { api_base_url: formData.customEndpointUrl }
        : {}),
      api_key: formData.llmProvider === 'custom' ? formData.customApiKey : formData.providerApiKey,
    }),
    [
      formData.systemPrompt,
      formData.privatePrompt,
      formData.llmProvider,
      formData.llmModel,
      formData.customModelName,
      formData.customEndpointUrl,
      formData.customApiKey,
      formData.providerApiKey,
    ]
  )

  const scrollToPreflight = () =>
    document
      .getElementById('preflight-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!providerValidationSatisfied) {
      toast.error('Please validate your custom provider connection before deploying')
      return
    }
    if (connectedDeploymentActive) {
      // Connected methods launch only on a validated configuration (AC-TUSD-007.1).
      if (connectedValidationError) {
        toast.error(connectedValidationError)
        scrollToPreflight()
        return
      }
      if (!connected.launchAllowed) {
        toast.error(
          'Run Preflight Validation and resolve every failed check before launching a connected Sentinel.'
        )
        scrollToPreflight()
        return
      }
    } else if (sentinelType === 'agentic') {
      const agenticError = validateAgenticSelection({
        templates: selectedTemplates,
        enabledToolIds,
      })
      if (agenticError) {
        toast.error(agenticError)
        return
      }
    }
    const result = await deploy(providerValidationSatisfied, () =>
      validateForm(providerValidationSatisfied, { skipModelSettings: isExistingAgent })
    )
    if (result?.nameExists) {
      const message = 'This Sentinel name is already taken. Please choose another.'
      setErrors(prev => ({
        ...prev,
        agentName: message,
      }))
      toast.error(message)
      const nameInput = document.querySelector<HTMLInputElement>('input[name="agentName"]')
      if (nameInput) {
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => nameInput.focus({ preventScroll: true }), 400)
      }
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    resetForm()
    resetDeployState()
    setSelectedTagIds([])
    setAgentImage(null)
    setSelectedImage({ url: SENTINEL_IMAGES[0], isCustom: false })
    customProvider.resetValidation()
    // Discarding the form also clears every entered connection credential (AC-TUSD-002.6).
    connected.reset()
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pb-8 pt-10">
      <div className="container mx-auto px-4 py-4">
        {/* Mode tabs */}
        <div className="mx-auto mb-8 max-w-[969px] px-4">
          <div className="flex w-full overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
            {(['individual', 'syndicate'] as DefendMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setDefendMode(mode)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-sm font-medium transition-all ${
                  defendMode === mode
                    ? 'bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                {mode === 'individual' ? 'Individual Mode' : 'Syndicate Mode'}
                <span
                  className={`text-[10px] font-normal ${defendMode === mode ? 'opacity-80' : 'opacity-60'}`}
                >
                  {mode === 'individual' ? 'Solo sentinel deployment' : 'Group-funded sentinel'}
                </span>
              </button>
            ))}
          </div>
        </div>
        {/* Syndicate Mode */}
        {defendMode === 'syndicate' && (
          <div className="mx-auto max-w-[640px] px-4">
            <div className="mb-6">
              <h1 className="page-heading">Launch a Syndicate Sentinel</h1>
              <p className="page-subheading mt-2">
                Pool funds with others and defend together — defender-side attack-fee proceeds are
                shared in proportion to each member&apos;s contribution.
              </p>
            </div>
            <SyndicateLaunchFlow />
          </div>
        )}
        {/* Individual Mode */}
        {defendMode === 'individual' && (
          <>
            <QuickLaunchTemplates
              onSelect={handleQuickLaunch}
              onBrowse={() =>
                sessionStorage.setItem(
                  SESSION_KEYS.DEFEND_FORM_DATA,
                  JSON.stringify(toPersistableFormData(formData))
                )
              }
            />
            <form onSubmit={handleSubmit} className="relative mx-auto max-w-[969px] space-y-8 px-4">
              {/* Header */}
              <div className="flex flex-col-reverse items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="text-center sm:text-left">
                  <h1 className="page-heading">Deploy Your Security Sentinel</h1>
                  <p className="page-subheading mt-2">
                    Launch an AI agent with a Bounty Pool. Let the world try to break it — you earn
                    40% of every failed Attack Fee. Sponsored Campaign Sentinels are configured with
                    our team.
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

              <SentinelTypeToggle value={sentinelType} onChange={setSentinelType} />

              <TagSelectDropdown selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />

              {isAgentic && (
                <DeploymentMethodSelector value={connected.method} onChange={connected.setMethod} />
              )}

              {isTemplatePath && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                    {/* Left: environment list (fixed) */}
                    <div className="lg:w-72 lg:shrink-0">
                      <EnvironmentTemplatePicker
                        selectedTemplateIds={selectedTemplateIds}
                        onToggleTemplate={toggleTemplate}
                      />
                    </div>

                    {/* Right: a tab per selected environment, holding its configuration */}
                    <div className="min-w-0 flex-1">
                      {selectedTemplateIds.length === 0 ? (
                        <div className="flex h-full min-h-[160px] items-center justify-center rounded-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 text-center text-sm text-[var(--color-text-muted)]">
                          Select one or more environments, or enable a live tool below.
                        </div>
                      ) : selectedTemplates.length === 0 ? (
                        <div className="flex h-full min-h-[160px] items-center justify-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 text-sm text-[var(--color-text-muted)]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading environment…
                        </div>
                      ) : (
                        <Tabs value={activeTabValue} onValueChange={setActiveTemplateId}>
                          <TabsList className="h-auto w-full justify-start overflow-x-auto border-b border-[var(--color-border-default)] p-0">
                            {selectedTemplates.map(template => (
                              <TabsTrigger key={template.template_id} value={template.template_id}>
                                {template.name}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {selectedTemplates.map(template => (
                            <TabsContent
                              key={template.template_id}
                              value={template.template_id}
                              className="mt-4"
                            >
                              <EnvironmentConfigPanel
                                template={template}
                                environment={agenticEnvironment}
                                onEnvironmentChange={setAgenticEnvironment}
                                enabledToolIds={enabledToolIds}
                                onEnabledToolIdsChange={setEnabledToolIds}
                              />
                            </TabsContent>
                          ))}
                        </Tabs>
                      )}
                    </div>
                  </div>

                  <LiveToolsChecklist
                    enabledLiveToolIds={enabledLiveToolIds}
                    onChange={setEnabledLiveToolIds}
                  />
                </div>
              )}

              {isHostedAgent && (
                <div className="flex flex-col gap-4">
                  <ExternalConnectionWarning />
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                      MCP Connections
                    </label>
                    <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                      Red Sentinel hosts the agent and gives it only the tools you approve from
                      these servers. Every connection needs a successful connection check.
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        connected.loadShopfastExample()
                        setFormData(prev => ({
                          ...prev,
                          systemPrompt: SHOPFAST_DEMO_EXAMPLE.publicInstructions,
                          privatePrompt: SHOPFAST_DEMO_EXAMPLE.privateInstructions,
                          attackGoal: SHOPFAST_DEMO_EXAMPLE.attackGoal,
                        }))
                        setErrors(prev => ({
                          ...prev,
                          systemPrompt: '',
                          privatePrompt: '',
                          attackGoal: '',
                        }))
                      }}
                      className="font-body hover:bg-[var(--color-gold-primary)]/10 inline-flex items-center gap-2 rounded-lg border border-[var(--color-gold-primary)] px-3 py-2 text-xs font-medium text-[var(--color-gold-primary)] transition-all hover:text-[var(--color-gold-light)]"
                    >
                      Load the ShopFast demo example
                    </button>
                    <span className="max-w-xl text-xs text-[var(--color-text-muted)]">
                      Fills this section plus the Public/Private Instructions, Attack Objective,
                      Breach Conditions, and Preflight Fixtures with the Customer Support demo
                      (mcp.redsentinel.xyz). Paste your bearer token, then run the connection check.
                    </span>
                  </div>
                  {connected.mcpConnections.map((connection, index) => (
                    <McpConnectionCard
                      key={connection.id}
                      connection={connection}
                      index={index}
                      isChecking={connected.checkingConnectionId === connection.id}
                      onEndpointChange={changes =>
                        connected.updateMcpConnection(connection.id, changes)
                      }
                      onPermissionsChange={permissions =>
                        connected.updateMcpPermissions(connection.id, permissions)
                      }
                      onCheckConnection={() => connected.checkMcpConnection(connection.id)}
                      onToggleTool={tool => connected.toggleMcpToolApproval(connection.id, tool)}
                      onRemove={() => connected.removeMcpConnection(connection.id)}
                    />
                  ))}
                  <div>
                    <button
                      type="button"
                      onClick={connected.addMcpConnection}
                      className="font-body inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-gold-primary)] hover:text-[var(--color-text-primary)]"
                    >
                      + Add MCP connection
                    </button>
                  </div>
                  <ExecutionLimitsFields
                    value={connected.executionLimits}
                    onChange={connected.updateExecutionLimits}
                  />
                </div>
              )}

              {isExistingAgent && (
                <div className="flex flex-col gap-4">
                  <ExternalConnectionWarning />
                  <ExistingAgentConnectionPanel
                    value={connected.existingAgent}
                    missingCapabilities={missingCapabilities}
                    onChange={connected.updateExistingAgent}
                    onCapabilityChange={connected.updateExistingAgentCapability}
                  />
                  <ExecutionLimitsFields
                    value={connected.executionLimits}
                    onChange={connected.updateExecutionLimits}
                  />
                </div>
              )}

              {!isExistingAgent && (
                <LLMProviderSection
                  formData={formData}
                  errors={errors}
                  providerModels={providerModels}
                  onChange={handleChangeWithProviderReset}
                  onProviderChange={provider =>
                    customProvider.handleProviderChange(provider, providerModels)
                  }
                  onModelChange={val => setFormData(prev => ({ ...prev, llmModel: val }))}
                  isValidating={customProvider.isValidating}
                  isValidated={customProvider.isValidated}
                  validationError={customProvider.validationError}
                  showApiKey={customProvider.showApiKey}
                  onToggleApiKey={() => customProvider.setShowApiKey(v => !v)}
                  onValidate={() => customProvider.handleValidate(formData)}
                />
              )}

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
                      href="/sentinel-templates"
                      className="text-xs text-[var(--color-gold-primary)] underline hover:text-[var(--color-gold-light)]"
                      onClick={() =>
                        sessionStorage.setItem(
                          SESSION_KEYS.DEFEND_FORM_DATA,
                          JSON.stringify(toPersistableFormData(formData))
                        )
                      }
                    >
                      View Templates
                    </Link>
                    <Link
                      href={`${SUI_SENTINEL_DOCS_URL}/guides/defender-guide`}
                      target="_blank"
                      className="text-xs text-[var(--color-gold-primary)] underline hover:text-[var(--color-gold-light)]"
                    >
                      Docs Example
                    </Link>
                  </div>
                </div>

                <textarea
                  name="systemPrompt"
                  value={formData.systemPrompt}
                  onChange={handleChangeWithProviderReset}
                  className="font-body min-h-[120px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
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
                    className={`font-body ml-auto text-xs text-[var(--color-text-muted)] ${isTokenCountDebouncing ? 'animate-pulse' : ''}`}
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

              {/* Private Instructions — an Existing Agent Connection keeps these on the defender's side */}
              {!isExistingAgent && (
                <div className="flex flex-col gap-2">
                  <div className="mb-1 flex items-start justify-between">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        Private Instructions
                      </label>
                      <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                        Instructions only accessible to the Sentinel agent. Attackers will not be
                        able to see this.
                      </span>
                    </div>
                  </div>
                  <textarea
                    name="privatePrompt"
                    value={formData.privatePrompt}
                    onChange={handleChangeWithProviderReset}
                    className="font-body min-h-[100px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
                    placeholder="Enter private instructions for your sentinel..."
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <div className="mt-1 flex items-center justify-end">
                    <p
                      className={`font-body text-xs text-[var(--color-text-muted)] ${isPrivateTokenCountDebouncing ? 'animate-pulse' : ''}`}
                    >
                      Tokens: {privateTokenCount}
                    </p>
                  </div>
                </div>
              )}

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
                              Generate with AI will create an Attack Objective based on your Public
                              and Private Instructions.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                      Mirror actual attacks such as stealing sensitive data, extracting secret
                      system instructions, or causing the Sentinel to malfunction. The more specific
                      the objective, the better attackers can strategize their attacks.
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
                  className="font-body min-h-[100px] w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
                  placeholder="e.g., Convince the sentinel to reveal the secret password"
                  autoComplete="off"
                  spellCheck="false"
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.attackGoal && (
                    <p className="font-body text-sm text-[var(--color-danger)]">
                      {errors.attackGoal}
                    </p>
                  )}
                  <p
                    className={`font-body text-xs text-[var(--color-text-muted)] ${isAttackGoalTokenCountDebouncing ? 'animate-pulse' : ''}`}
                  >
                    Tokens: {attackGoalTokenCount}
                  </p>
                </div>
              </div>

              {/* Connected deployment: conditions, fixtures, preflight, review */}
              {connectedDeploymentActive && connected.method !== 'template' && (
                <>
                  <BreachConditionsEditor
                    conditions={connected.breachConditions}
                    evidenceSource={evidenceSource}
                    onAdd={connected.addBreachCondition}
                    onUpdate={connected.updateBreachCondition}
                    onRemove={connected.removeBreachCondition}
                  />
                  <PreflightFixturesFields
                    value={connected.fixtures}
                    onChange={connected.updateFixtures}
                  />
                  <PreflightPanel
                    report={connected.preflightReport}
                    hasStaleReport={connected.hasStaleReport}
                    isRunning={connected.isPreflightRunning}
                    launchAllowed={connected.launchAllowed}
                    validationError={connectedValidationError}
                    onRun={() => connected.runPreflight(preflightSentinelContext)}
                  />
                  <DeploymentReviewCard
                    method={connected.method}
                    mcpConnections={connected.mcpConnections}
                    existingAgent={connected.existingAgent}
                    breachConditions={connected.breachConditions}
                    evidenceSource={evidenceSource}
                    executionLimits={connected.executionLimits}
                    bounty={formData.initialBalance}
                    attackFee={formData.feePerMessage}
                    tokenSymbol={activeTokenSymbol}
                    launchAllowed={connected.launchAllowed}
                  />
                </>
              )}

              {/* Bounty Pool & Fee */}
              <div id="bounty-section" className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                      Bounty Pool
                    </label>
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
                  <div className="mt-auto flex h-9 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] transition-all focus-within:border-[var(--color-gold-primary)] focus-within:ring-1 focus-within:ring-[var(--color-gold-primary)]">
                    <input
                      name="initialBalance"
                      type="number"
                      value={formData.initialBalance}
                      onChange={handleChangeWithProviderReset}
                      className="font-body h-full flex-1 bg-transparent px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
                      placeholder="0.00"
                      step="any"
                      autoComplete="off"
                    />
                    <div className="flex shrink-0 items-center border-l border-[var(--color-border-subtle)]">
                      <TokenSelectDropdown
                        tokens={
                          isEvm
                            ? evmTokenList
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
                  subLabel="You earn this fee whenever users interact with your Sentinel."
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
                      !providerValidationSatisfied ||
                      (connectedDeploymentActive && !connected.launchAllowed)
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
                        onClick={() => openSolanaConnectModal()}
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
          </>
        )}{' '}
        {/* end individual mode */}
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
