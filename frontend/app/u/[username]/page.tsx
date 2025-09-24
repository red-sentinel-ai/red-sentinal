import { notFound } from 'next/navigation'
import { supabaseServiceClient } from '@/db/config/server'
import { User, Folder } from 'lucide-react'
import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { FeaturedAgentCard } from '@/components/FeaturedAgentCard'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { getDefeatedAgentIds, fetchAgentDetailsViaObject } from '@/lib/sui-utils'
import { AgentStatus } from '@/types'

async function getUserProfile(username: string) {
  const { data: user } = await supabaseServiceClient
    .from('ss_users')
    .select('*')
    .eq('username', username)
    .single()

  if (!user || !user.wallet_addresses) {
    return null
  }

  const { data: basicAgents } = await supabaseServiceClient
    .from('ss_agents')
    .select('*')
    .in('owner', user.wallet_addresses)

  if (!basicAgents) {
    return { user, agents: [] }
  }

  const client = new SuiClient({ url: getFullnodeUrl('testnet') })
  const defeatedAgentIds = await getDefeatedAgentIds(client)

  const enrichedAgents = await Promise.all(
    basicAgents.map(async (agent) => {
      const onchainData = await fetchAgentDetailsViaObject(client, agent.object_id)

      const status: AgentStatus = defeatedAgentIds.has(String(agent.agent_id))
        ? 'Defeated'
        : 'Active'

      return {
        ...agent,
        ...onchainData,
        //TODO: remove below these, why they will be null, they are in the db
        agent_path: agent.agent_path || '',
        created_at: agent.created_at || new Date().toISOString(),
        status,
      } as AgentDetails
    })
  )

  return { user, agents: enrichedAgents }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const profileData = await getUserProfile(username)
  if (!profileData) {
    notFound()
  }

  const { user, agents } = profileData

  return (
    <div className="container mx-auto px-4 pb-12 pt-24 min-h-body">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-foreground/20 flex items-center justify-center">
              <User className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold">
                {user.display_name || user.username}
              </h1>
              <p className="text-gray-400 mt-1">@{user.username}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Folder className="h-6 w-6" />
            Sentinels ({agents.length})
          </h2>
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <FeaturedAgentCard
                  key={agent.agent_id}
                  agent={agent}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900/50 rounded-lg">
              <p className="text-gray-400">This user has not launched any Sentinels yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
