import { notFound } from 'next/navigation'
import Image from 'next/image'
import { User, Folder } from 'lucide-react'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { supabaseServiceClient } from '@/db/config/server'
import { getDefeatedAgentIds, fetchAgentDetailsViaObject } from '@/lib/sui-utils'
import { FeaturedAgentCard } from '@/components/FeaturedAgentCard'
import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { AgentStatus } from '@/types'

async function getUserProfile(identifier: string) {
  const isWalletAddress = identifier.startsWith('0x') && identifier.length > 60

  let query = supabaseServiceClient.from('ss_users').select('*')

  if (isWalletAddress) {
    query = query.contains('wallet_addresses', [identifier])
  } else {
    query = query.eq('username', identifier)
  }

  const { data: user, error: userError } = await query.single()

  if (userError || !user || !user.wallet_addresses) {
    console.error('User lookup error:', userError?.message)
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

      const returnData = {
        ...agent,
        agent_id: String(agent.agent_id),
        ...onchainData,

        agent_path: agent.agent_path || '',
        created_at: agent.created_at || new Date().toISOString(),
        status,
      } as AgentDetails

      return returnData
    })
  )

  return { user, agents: enrichedAgents }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ identifier: string }> // Changed from 'username' to 'identifier'
}) {
  const { identifier } = await params // Changed from 'username' to 'identifier'
  const profileData = await getUserProfile(identifier) // Pass the identifier to the fetching function

  if (!profileData) {
    notFound()
  }

  const { user, agents } = profileData

  return (
    <div className="container mx-auto px-4 pb-12 pt-24 min-h-body">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            <div className="relative w-28 h-28 rounded-full border-2 border-gray-600 overflow-hidden flex-shrink-0">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt="User Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-foreground/20 flex items-center justify-center">
                  <User className="h-14 w-14" />
                </div>
              )}
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
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Folder className="h-6 w-6 text-blue-400" />
            <span>
              {user.display_name}&apos;s Sentinels ({agents.length})
            </span>
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
