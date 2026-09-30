export interface ShareFact {
  fact_id: string
  fact: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Optional, admin-configured attribution for a deployed Sentinel. */
export interface SentinelAttribution {
  agent_id: number
  org_x_handle: string | null
  org_description: string | null
}
