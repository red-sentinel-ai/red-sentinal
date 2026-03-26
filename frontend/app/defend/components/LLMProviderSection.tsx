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
    <div className="rounded-xl border border-outline-variant bg-surface-container p-6">
      <h3 className="font-display mb-6 text-[20px] font-medium text-on-surface">LLM provider</h3>
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
              <label className="font-display block text-[18px] font-medium text-on-surface">Endpoint URL</label>
              <p className="mb-2 text-[14px] text-on-surface-variant">OpenAI-compatible API endpoint URL</p>
              <input
                name="customEndpointUrl"
                type="url"
                value={formData.customEndpointUrl}
                onChange={onChange}
                className="h-[56px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-[16px] text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container/20 sm:h-[55px] sm:text-base"
                placeholder="https://api.example.com/v1"
                autoComplete="off"
                spellCheck="false"
              />
              {errors.customEndpointUrl && (
                <p className="mt-1 text-sm text-tertiary">{errors.customEndpointUrl}</p>
              )}
            </div>

            <div>
              <label className="font-display block text-[18px] font-medium text-on-surface">API Key</label>
              <p className="mb-2 text-[14px] text-on-surface-variant">Your API key for authentication</p>
              <div className="relative">
                <input
                  name="customApiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.customApiKey}
                  onChange={onChange}
                  className="h-[56px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 pr-12 text-[16px] text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container/20 sm:h-[55px] sm:text-base"
                  placeholder="sk-..."
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={onToggleApiKey}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.customApiKey && (
                <p className="mt-1 text-sm text-tertiary">{errors.customApiKey}</p>
              )}
            </div>

            <div>
              <label className="font-display block text-[18px] font-medium text-on-surface">Model Name</label>
              <p className="mb-2 text-[14px] text-on-surface-variant">
                The model identifier to use (e.g., gpt-4o, claude-3-opus)
              </p>
              <input
                name="customModelName"
                type="text"
                value={formData.customModelName}
                onChange={onChange}
                className="h-[56px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-[16px] text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container/20 sm:h-[55px] sm:text-base"
                placeholder="e.g., kimi-k2-turbo-preview"
                autoComplete="off"
                spellCheck="false"
              />
              {errors.customModelName && (
                <p className="mt-1 text-sm text-tertiary">{errors.customModelName}</p>
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
              className="btn-primary flex h-[48px] items-center justify-center gap-2 rounded-xl px-6 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : isValidated ? (
                <>
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Validated
                </>
              ) : (
                'Validate Connection'
              )}
            </button>

            {isValidated && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary border border-primary/20">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Connection verified successfully</span>
              </div>
            )}

            {validationError && (
              <div className="flex items-center gap-2 rounded-lg bg-tertiary/10 px-4 py-3 text-sm text-tertiary border border-tertiary/20">
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
