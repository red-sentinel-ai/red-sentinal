import { SUI_SENTINEL_API_URL } from '@/constants'

export interface SentinelMemory {
  text: string
  distance: number
}

export interface SentinelMemoryResult {
  sentinel_id: number
  network: string
  enabled: boolean
  memories: SentinelMemory[]
}

export async function fetchSentinelMemories(params: {
  network: string
  sentinelId: number
}): Promise<SentinelMemoryResult | null> {
  const response = await fetch(
    `${SUI_SENTINEL_API_URL}/sentinels/${params.network}/${params.sentinelId}/memory`,
    { cache: 'no-store' }
  )

  if (response.status === 404) return null

  if (!response.ok) {
    throw new Error(`Failed to load sentinel memories (${response.status})`)
  }

  return response.json()
}
