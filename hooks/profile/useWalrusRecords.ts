import { useQuery } from '@tanstack/react-query'

import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'
import { useAuth } from '@/context/AuthContext'

export interface WalrusRecordItem {
  record_id: string
  status: 'awaiting_register_signature' | 'finalizing' | 'awaiting_certify_signature' | 'certified' | 'failed'
  blob_id: string
  blob_object_id: string | null
  sentinel_id: number
  register_digest: string | null
  created_at: string
  error: string | null
}

async function fetchWalrusRecords(userId: string): Promise<WalrusRecordItem[]> {
  const res = await fetch(`${SUI_SENTINEL_API_URL}/walrus/${APP_NETWORK}/records`, {
    credentials: 'include',
    headers: { 'x-user-id': userId },
  })
  if (!res.ok) throw new Error(`Failed to fetch Walrus records: ${res.status}`)
  const data = (await res.json()) as { records: WalrusRecordItem[] }
  return data.records
}

export function useWalrusRecords() {
  const { user } = useAuth()
  return useQuery<WalrusRecordItem[]>({
    queryKey: ['walrus-records', user?.id, APP_NETWORK],
    queryFn: () => fetchWalrusRecords(user!.id),
    enabled: !!user?.id,
    staleTime: 30_000,
  })
}
