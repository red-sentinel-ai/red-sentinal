import { supabaseServiceClient } from '@/db/config/server'

export interface AgentOGData {
  agent_name: string
  agent_profile: string | null
}

/**
 * This function is safe to use in Server Components.
 * @param agentPath The agent_path of the agent.
 * @returns The agent's data or null if not found.
 */
export async function getAgentDataForOG(agentPath: string): Promise<AgentOGData | null> {
  if (!agentPath) {
    return null
  }

  const { data, error } = await supabaseServiceClient
    .from('ss_agents')
    .select('agent_name, agent_profile')
    .eq('agent_path', agentPath)
    .single()

  if (error) {
    console.error(`[Supabase Fetch Error for OG Agent: ${agentPath}]`, error.message)
    return null
  }

  return data
}
