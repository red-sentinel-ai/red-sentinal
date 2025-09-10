import { supabaseServiceClient } from '@/db/config/server'

export interface AgentOGData {
  agent_name: string
  agent_profile: string | null
}

/**
 * This function is safe to use in Server Components.
 * @param objectId The object_id of the agent.
 * @returns The agent's data or null if not found.
 */
export async function getAgentDataForOG(objectId: string): Promise<AgentOGData | null> {
  if (!objectId) {
    return null
  }

  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .select('agent_name, agent_profile')
    .eq('object_id', objectId)
    .single()

  if (error) {
    console.error(`[Supabase Fetch Error for OG Agent: ${objectId}]`, error.message)
    return null
  }

  return data
}
