import { useQuery } from '@tanstack/react-query'

import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'
import { useAuth } from '@/context/AuthContext'

export interface WalrusRecordItem {
  attack_id: string
  sentinel_id: number
  blob_id: string
  register_digest: string | null
  certify_digest: string | null
  created_at: string
  success: boolean | null
}

async function fetchWalrusRecords(): Promise<WalrusRecordItem[]> {
  const res = await fetch(`${SUI_SENTINEL_API_URL}/walrus/${APP_NETWORK}/records`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to fetch Walrus records: ${res.status}`)
  const data = (await res.json()) as { records: WalrusRecordItem[] }
  return data.records
}

export function useWalrusRecords() {
  const { user } = useAuth()
  return useQuery<WalrusRecordItem[]>({
    queryKey: ['walrus-records', user?.id, APP_NETWORK],
    queryFn: () => fetchWalrusRecords(),
    enabled: !!user?.id,
    staleTime: 30_000,
  })
}
