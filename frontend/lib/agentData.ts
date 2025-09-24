import { supabaseServiceClient } from '@/db/config/server'

export interface AgentOGData {
  agent_name: string
  agent_profile: string | null
}

export async function getAgentDataForOG(slug: string): Promise<AgentOGData | null> {
  if (!slug) {
    return null
  }

  const isObjectId = slug.startsWith('0x') && slug.length > 60
  const columnToQuery = isObjectId ? 'object_id' : 'agent_path'

  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .select('agent_name, agent_profile')
    .eq(columnToQuery, slug)
    .single()

  if (error) {
    console.error(`[Supabase Fetch Error for OG Agent: ${slug}]`, error.message)
    return null
  }

  return data
}
