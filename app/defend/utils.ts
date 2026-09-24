import type { SupportedChain } from '@/constants/chains'
import type { AgenticConfig } from './agentic-types'
import { providerNeedsApiKey, type DefendFormData } from './hooks/useDefendForm'

export interface ProviderCredentials {
  apiKey?: string
  apiBaseUrl?: string
}

export const resolveProviderCredentials = (
  formData: DefendFormData
): ProviderCredentials | undefined => {
  if (formData.llmProvider === 'custom') {
    return { apiBaseUrl: formData.customEndpointUrl, apiKey: formData.customApiKey }
  }
  if (providerNeedsApiKey(formData.llmProvider)) {
    return { apiKey: formData.providerApiKey }
  }
  return undefined
}

export const registerAgentUtil = async (
  systemPrompt: string,
  feePerMessage: number | string,
  creatorAddress: string,
  modelProvider: string,
  modelName: string,
  privatePrompt: string,
  attackGoal: string,
  chain: SupportedChain = 'sui',
  credentials?: ProviderCredentials,
  chainId?: number,
  agenticConfig?: AgenticConfig | null
) => {
  const body: Record<string, any> = {
    chain,
    chainId,
    system_prompt: systemPrompt,
    cost_per_message: feePerMessage,
    creator: creatorAddress,
    model_provider: modelProvider,
    model_name: modelName,
    private_prompt: privatePrompt || 'NA',
    attack_goal: attackGoal,
    jury_prompt: '',
  }

  if (credentials?.apiKey) body.api_key = credentials.apiKey
  if (credentials?.apiBaseUrl) body.api_base_url = credentials.apiBaseUrl

  if (agenticConfig) {
    body.sentinel_type = 'agentic'
    body.scenario = agenticConfig.scenario
    body.enabled_tools = agenticConfig.enabledTools
    body.user_task = agenticConfig.userTask
    body.attack_success_checks = agenticConfig.attackSuccessChecks
    body.utility_checks = agenticConfig.utilityChecks
    body.evaluation_mode = agenticConfig.evaluationMode
  }

  const response = await fetch('/api/register-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Failed to register agent: ${response.status}`)
  }
  return response.json()
}
