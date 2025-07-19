import { INDEXER_BASE_URL } from '@/constants'
import { useQuery } from '@tanstack/react-query'

export type PromptConsumedEvent = {
  dbId: string
  agent_id: string
  success: boolean
  amount: string
  sender: string
  message: string
  agent_response: string
  timestamp: string
  txDigest: string
}

export const fetchPromptConsumedEvents = async (
  agent_id: string
): Promise<PromptConsumedEvent[]> => {
  const res = await fetch(`${INDEXER_BASE_URL}/events/sentinel/prompt-consumed/${agent_id}`)

  if (!res.ok) {
    throw new Error(`Failed to fetch events for agent_id: ${agent_id}`)
  }

  return res.json()
}

export const usePromptConsumedEvents = (agent_id: string) => {
  return useQuery({
    queryKey: ['prompt-consumed-events', agent_id],
    queryFn: () => fetchPromptConsumedEvents(agent_id),
    enabled: !!agent_id,
  })
}
