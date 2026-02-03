export const registerAgentUtil = async (
  systemPrompt: string,
  feePerMessage: number,
  creatorAddress: string,
  modelProvider: string,
  modelName: string,
  privatePrompt: string,
  attackGoal: string,
  juryPrompt: string,
) => {
  const response = await fetch('/api/register-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_prompt: systemPrompt,
      cost_per_message: feePerMessage,
      creator: creatorAddress,
      model_provider: modelProvider,
      model_name: modelName,
      private_prompt: privatePrompt,
      attack_goal: attackGoal,
      jury_prompt: juryPrompt,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to register agent: ${response.status}`)
  }
  return response.json()
}
