import { useState } from 'react'
import { PROVIDER_MODELS, SYSTEM_PROMPT_MAX_TOKENS, type SupportedToken } from '@/constants'

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

/** Credential fields that must never leave component state (AC-TUSD-002.5). */
export const CREDENTIAL_FORM_FIELDS: Array<keyof DefendFormData> = [
  'providerApiKey',
  'customApiKey',
]

/**
 * Copy of the form safe to hand to browser storage or a URL: entered
 * credentials are blanked, not merely hidden.
 */
export const toPersistableFormData = (formData: DefendFormData): DefendFormData => {
  const persistable = { ...formData }
  for (const field of CREDENTIAL_FORM_FIELDS) {
    persistable[field] = ''
  }
  return persistable
}

interface UseDefendFormOptions {
  selectedToken: SupportedToken
  tokenCount: number
  countTokens: (text: string) => void
  countPrivateTokens: (text: string) => void
  countAttackGoalTokens: (text: string) => void
  /** Called when any custom-provider field (url/key/model) changes */
  onCustomProviderFieldChange?: () => void
  /** Override token symbol for validation messages (used for chain-specific tokens) */
  activeTokenSymbol?: string
}

export function useDefendForm({
  selectedToken,
  tokenCount,
  countTokens,
  countPrivateTokens,
  countAttackGoalTokens,
  onCustomProviderFieldChange,
  activeTokenSymbol,
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

  const validateForm = (
    customProviderValidated: boolean,
    options?: { skipModelSettings?: boolean }
  ): boolean => {
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

    const fee = parseFloat(formData.feePerMessage)
    if (isNaN(fee)) {
      newErrors.feePerMessage = `Enter a valid fee in ${tokenSymbol}`
    }

    const balance = parseFloat(formData.initialBalance)
    if (isNaN(balance)) {
      newErrors.initialBalance = `Enter a valid bounty pool amount in ${tokenSymbol}`
    }

    if (!formData.attackGoal.trim()) newErrors.attackGoal = 'Attack goal is required'

    // An Existing Agent Connection keeps model settings on the defender's side —
    // the provider section is hidden, so its fields are not required (AC-TUSD-001.5).
    if (!options?.skipModelSettings) {
      if (formData.llmProvider === 'custom') {
        if (!formData.customEndpointUrl.trim())
          newErrors.customEndpointUrl = 'Endpoint URL is required'
        if (!formData.customApiKey.trim()) newErrors.customApiKey = 'API Key is required'
        if (!formData.customModelName.trim()) newErrors.customModelName = 'Model name is required'
        if (!customProviderValidated) {
          // toast is called at the call-site to avoid importing toast here
          return false
        }
      } else if (providerNeedsApiKey(formData.llmProvider) && !formData.providerApiKey.trim()) {
        newErrors.providerApiKey = 'API Key is required'
      }
    }

    setErrors(newErrors)

    const firstErrorField = Object.keys(newErrors)[0]
    if (firstErrorField) {
      document
        .querySelector(`[name="${firstErrorField}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA)
    setErrors({})
  }

  return { formData, setFormData, errors, setErrors, handleChange, validateForm, resetForm }
}
