export const registerAgentUtil = async (systemPrompt: string, feePerMessage: number, creatorAddress: string) => {
  const response = await fetch('/api/register-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_prompt: systemPrompt,
      cost_per_message: feePerMessage,
      creator: creatorAddress
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to register agent: ${response.status}`)
  }
  return response.json()
}
