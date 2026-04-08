'use client'

import { CheckCircle, Eye, EyeOff, Loader2, XCircle } from 'lucide-react'
import { PROVIDER_MODELS } from '@/constants'
import { CustomDropdown } from '@/components/ui/common/CustomDropdown'
import type { DefendFormData } from '../hooks/useDefendForm'

interface LLMProviderSectionProps {
  formData: DefendFormData
  errors: Partial<DefendFormData>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onProviderChange: (provider: string) => void
  onModelChange: (model: string) => void
  // custom provider state
  isValidating: boolean
  isValidated: boolean
  validationError: string | null
  showApiKey: boolean
  onToggleApiKey: () => void
  onValidate: () => void
}

export function LLMProviderSection({
  formData,
  errors,
  onChange,
  onProviderChange,
  onModelChange,
  isValidating,
  isValidated,
  validationError,
  showApiKey,
  onToggleApiKey,
  onValidate,
}: LLMProviderSectionProps) {
  return (
    <div className="rounded-xl border bg-transparent p-6" style={{ borderColor: 'var(--jp-dark-pink)' }}>
      <h3 className="mb-6 text-[20px] font-medium text-black">LLM provider</h3>
      <div className="flex flex-col gap-6 md:flex-row">
        <CustomDropdown
          label="Select service"
          subLabel="Select the service that hosts and serves the LLM."
          options={Object.keys(PROVIDER_MODELS)}
          selected={formData.llmProvider}
          onSelect={onProviderChange}
        />

        {formData.llmProvider !== 'custom' ? (
          <CustomDropdown
            label="Select Model"
            subLabel="Select the model version for the chosen LLM."
            options={PROVIDER_MODELS[formData.llmProvider] || []}
            selected={formData.llmModel}
            onSelect={onModelChange}
          />
        ) : (
          <div className="flex min-w-[200px] flex-1 flex-col gap-4">
            <div>
              <label className="block text-[18px] font-medium text-black">Endpoint URL</label>
              <p className="mb-2 text-[14px] text-[#5E5E5E]">OpenAI-compatible API endpoint URL</p>
              <input
                name="customEndpointUrl"
                type="url"
                value={formData.customEndpointUrl}
                onChange={onChange}
                className="h-[56px] w-full rounded-xl border bg-transparent px-4 text-[16px] text-black placeholder-gray-400 transition-all focus:border-[var(--jp-red-color)] focus:outline-none focus:ring-1 focus:ring-[var(--jp-red-color)] sm:h-[55px] sm:text-base"
                style={{ borderColor: 'var(--jp-dark-pink)' }}
                placeholder="https://api.example.com/v1"
                autoComplete="off"
                spellCheck="false"
              />
              {errors.customEndpointUrl && (
                <p className="mt-1 text-sm text-red-500">{errors.customEndpointUrl}</p>
              )}
            </div>

            <div>
              <label className="block text-[18px] font-medium text-black">API Key</label>
              <p className="mb-2 text-[14px] text-[#5E5E5E]">Your API key for authentication</p>
              <div className="relative">
                <input
                  name="customApiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.customApiKey}
                  onChange={onChange}
                  className="h-[56px] w-full rounded-xl border bg-transparent px-4 pr-12 text-[16px] text-black placeholder-gray-400 transition-all focus:border-[var(--jp-red-color)] focus:outline-none focus:ring-1 focus:ring-[var(--jp-red-color)] sm:h-[55px] sm:text-base"
                  style={{ borderColor: 'var(--jp-dark-pink)' }}
                  placeholder="sk-..."
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={onToggleApiKey}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.customApiKey && (
                <p className="mt-1 text-sm text-red-500">{errors.customApiKey}</p>
              )}
            </div>

            <div>
              <label className="block text-[18px] font-medium text-black">Model Name</label>
              <p className="mb-2 text-[14px] text-[#5E5E5E]">
                The model identifier to use (e.g., gpt-4o, claude-3-opus)
              </p>
              <input
                name="customModelName"
                type="text"
                value={formData.customModelName}
                onChange={onChange}
                className="h-[56px] w-full rounded-xl border bg-transparent px-4 text-[16px] text-black placeholder-gray-400 transition-all focus:border-[var(--jp-red-color)] focus:outline-none focus:ring-1 focus:ring-[var(--jp-red-color)] sm:h-[55px] sm:text-base"
                style={{ borderColor: 'var(--jp-dark-pink)' }}
                placeholder="e.g., kimi-k2-turbo-preview"
                autoComplete="off"
                spellCheck="false"
              />
              {errors.customModelName && (
                <p className="mt-1 text-sm text-red-500">{errors.customModelName}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onValidate}
              disabled={
                isValidating ||
                !formData.customEndpointUrl ||
                !formData.customApiKey ||
                !formData.customModelName
              }
              className="flex h-[48px] items-center justify-center gap-2 rounded-xl border border-black bg-black px-6 font-medium text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : isValidated ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Validated
                </>
              ) : (
                'Validate Connection'
              )}
            </button>

            {isValidated && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Connection verified successfully</span>
              </div>
            )}

            {validationError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
