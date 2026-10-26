import { useState } from 'react'
import { toast } from '@/lib/toast'
import { PROVIDER_MODELS } from '@/constants'
import { DEFAULT_MODEL } from './useDefendForm'
import type { DefendFormData } from './useDefendForm'
export function useCustomProvider(
  setFormData: React.Dispatch<React.SetStateAction<DefendFormData>>
) {
  const [isValidating, setIsValidating] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  const resetValidation = () => {
    setIsValidated(false)
    setValidationError(null)
  }

  const handleProviderChange = (
    provider: string,
    providerModels: Record<string, string[]> = PROVIDER_MODELS
  ) => {
    const isCustom = provider === 'custom'
    const defaultModel = isCustom ? '' : providerModels[provider]?.[0] || DEFAULT_MODEL

    setFormData(prev => ({
      ...prev,
      llmProvider: provider,
      llmModel: defaultModel,
      providerApiKey: '',
      ...(isCustom ? {} : { customEndpointUrl: '', customApiKey: '', customModelName: '' }),
    }))

    if (!isCustom) resetValidation()
  }

  const handleValidate = async (formData: DefendFormData) => {
    if (!formData.customEndpointUrl || !formData.customApiKey || !formData.customModelName) {
      toast.error('Please fill in all custom provider fields')
      return
    }

    setIsValidating(true)
    setValidationError(null)
    setIsValidated(false)

    try {
      const response = await fetch('/api/test-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_provider: 'custom',
          api_base_url: formData.customEndpointUrl,
          api_key: formData.customApiKey,
          model_name: formData.customModelName,
          test_prompt: 'Say OK if you can hear me',
        }),
      })

      const data = await response.json()

      if (data.success && data.connected) {
        setIsValidated(true)
        setValidationError(null)
        setFormData(prev => ({ ...prev, llmModel: prev.customModelName }))
        toast.success('Custom provider connection validated!')
      } else {
        setIsValidated(false)
        setValidationError(data.error_details || data.message || 'Connection failed')
      }
    } catch (error) {
      console.error('Error validating custom provider:', error)
      setIsValidated(false)
      setValidationError('Failed to validate connection. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  return {
    isValidating,
    isValidated,
    validationError,
    showApiKey,
    setShowApiKey,
    resetValidation,
    handleProviderChange,
    handleValidate,
  }
}
