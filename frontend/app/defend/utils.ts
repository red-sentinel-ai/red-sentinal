export const registerAgentUtil = async (
  systemPrompt: string,
  feePerMessage: number,
  creatorAddress: string,
  modelProvider: string,
  modelName: string,
  privatePrompt: string,
  attackGoal: string,
  juryPrompt: string,
  customProviderDetails?: {
    apiBaseUrl: string
    apiKey: string
  }
) => {
  const body: Record<string, any> = {
    system_prompt: systemPrompt,
    cost_per_message: feePerMessage,
    creator: creatorAddress,
    model_provider: modelProvider,
    model_name: modelName,
    private_prompt: privatePrompt || "NA",
    attack_goal: attackGoal,
    jury_prompt: juryPrompt,
  }

  if (modelProvider === 'custom' && customProviderDetails) {
    body.api_base_url = customProviderDetails.apiBaseUrl
    body.api_key = customProviderDetails.apiKey
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
