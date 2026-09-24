import { useState } from 'react'
import {
  MINIMUM_FEE_PER_MESSAGE,
  PROVIDER_MODELS,
  SYSTEM_PROMPT_MAX_TOKENS,
  type SupportedToken,
} from '@/constants'

export const BEDROCK_PROVIDER = 'amazon bedrock'
export const DEFAULT_PROVIDER = BEDROCK_PROVIDER
export const DEFAULT_MODEL = PROVIDER_MODELS[DEFAULT_PROVIDER][0]

export const providerNeedsApiKey = (provider: string) =>
  provider !== 'custom' && provider !== BEDROCK_PROVIDER

export interface DefendFormData {
  agentName: string
  systemPrompt: string
  feePerMessage: string
  initialBalance: string
  rewardPool: string
  llmProvider: string
  llmModel: string
  privatePrompt: string
  attackGoal: string
  providerApiKey: string
  customEndpointUrl: string
  customApiKey: string
  customModelName: string
}

export const INITIAL_FORM_DATA: DefendFormData = {
  agentName: '',
  systemPrompt: '',
  feePerMessage: '',
  initialBalance: '',
  rewardPool: '',
  llmProvider: DEFAULT_PROVIDER,
  llmModel: DEFAULT_MODEL,
  privatePrompt: '',
  attackGoal: '',
  providerApiKey: '',
  customEndpointUrl: '',
  customApiKey: '',
  customModelName: '',
}

interface UseDefendFormOptions {
  selectedToken: SupportedToken
  tokenCount: number
  countTokens: (text: string) => void
  countPrivateTokens: (text: string) => void
  countAttackGoalTokens: (text: string) => void
  /** Called when any custom-provider field (url/key/model) changes */
  onCustomProviderFieldChange?: () => void
  /** Override token symbol and minimum for validation (used for chain-specific tokens) */
  activeTokenSymbol?: string
  activeMinimumAmount?: number
}

export function useDefendForm({
  selectedToken,
  tokenCount,
  countTokens,
  countPrivateTokens,
  countAttackGoalTokens,
  onCustomProviderFieldChange,
  activeTokenSymbol,
  activeMinimumAmount,
}: UseDefendFormOptions) {
  const [formData, setFormData] = useState<DefendFormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Partial<DefendFormData>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'feePerMessage' || name === 'initialBalance') {
      if (value === '') {
        setFormData(prev => ({ ...prev, [name]: '' }))
      } else {
        const num = parseFloat(value)
        if (!isNaN(num) && num >= 0) {
          setFormData(prev => ({ ...prev, [name]: value }))
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (['customEndpointUrl', 'customApiKey', 'customModelName'].includes(name)) {
      onCustomProviderFieldChange?.()
    }

    if (name === 'systemPrompt') countTokens(value)
    else if (name === 'privatePrompt') countPrivateTokens(value)
    else if (name === 'attackGoal') countAttackGoalTokens(value)

    if (errors[name as keyof DefendFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (customProviderValidated: boolean): boolean => {
    const newErrors: Partial<DefendFormData> = {}

    if (!formData.agentName.trim()) {
      newErrors.agentName = 'Sentinel name is required'
    } else if (formData.agentName.length > 31) {
      newErrors.agentName = 'Sentinel name must be 31 characters or less'
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required'
    } else if (tokenCount > SYSTEM_PROMPT_MAX_TOKENS) {
      return false
    }

    const tokenSymbol = activeTokenSymbol ?? selectedToken.symbol
    const minimumAmount = activeMinimumAmount ?? selectedToken.minimumAmount

    const fee = parseFloat(formData.feePerMessage)
    if (isNaN(fee) || fee < MINIMUM_FEE_PER_MESSAGE) {
      newErrors.feePerMessage = `Fee must be at least ${MINIMUM_FEE_PER_MESSAGE} ${tokenSymbol}`
    }

    const balance = parseFloat(formData.initialBalance)
    if (isNaN(balance) || balance < minimumAmount) {
      newErrors.initialBalance = `Minimum Bounty Pool is ${minimumAmount} ${tokenSymbol}`
    }

    if (!formData.attackGoal.trim()) newErrors.attackGoal = 'Attack goal is required'

    if (formData.llmProvider === 'custom') {
      if (!formData.customEndpointUrl.trim()) newErrors.customEndpointUrl = 'Endpoint URL is required'
      if (!formData.customApiKey.trim()) newErrors.customApiKey = 'API Key is required'
      if (!formData.customModelName.trim()) newErrors.customModelName = 'Model name is required'
      if (!customProviderValidated) {
        // toast is called at the call-site to avoid importing toast here
        return false
      }
    } else if (providerNeedsApiKey(formData.llmProvider) && !formData.providerApiKey.trim()) {
      newErrors.providerApiKey = 'API Key is required'
    }

    setErrors(newErrors)

    const firstErrorField = Object.keys(newErrors)[0]
    if (firstErrorField) {
      document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA)
    setErrors({})
  }

  return { formData, setFormData, errors, setErrors, handleChange, validateForm, resetForm }
}
