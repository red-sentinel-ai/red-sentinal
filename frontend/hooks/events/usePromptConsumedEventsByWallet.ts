import { useQuery } from '@tanstack/react-query'
import { INDEXER_BASE_URL } from '@/constants'
import { PromptConsumedEvent } from './usePromptConsumedEvents'

export const fetchPromptConsumedEventsByWallet = async (
  walletAddress: string
): Promise<PromptConsumedEvent[]> => {
  const res = await fetch(
    `${INDEXER_BASE_URL}/events/sentinel/prompt-consumed/wallet/${walletAddress}`
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch events for wallet address: ${walletAddress}`)
  }

  return res.json()
}

export const usePromptConsumedEventsByWallet = (walletAddress: string) => {
  return useQuery({
    queryKey: ['prompt-consumed-events-wallet', walletAddress],
    queryFn: () => fetchPromptConsumedEventsByWallet(walletAddress),
    enabled: !!walletAddress,
  })
}
