import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { User, Folder } from 'lucide-react'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { formatAddress } from '@mysten/sui/utils'
import { supabaseServiceClient } from '@/db/config/server'
import { getDefeatedAgentIds, fetchAgentDetailsViaObject } from '@/lib/sui-utils'
import { FeaturedAgentCard } from '@/components/FeaturedAgentCard'
import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { AgentStatus } from '@/types'
import { EXPLORER_BASE_URL } from '@/constants'

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
    basicAgents.map(async agent => {
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
  params: Promise<{ identifier: string }>
}) {
  const { identifier } = await params
  const profileData = await getUserProfile(identifier)

  if (!profileData) {
    notFound()
  }

  const { user, agents } = profileData

  return (
    <div className="min-h-body container mx-auto px-4 pb-12 pt-24 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="mb-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt="User Avatar" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <User className="h-14 w-14 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold sm:text-4xl">
                {user.display_name || user.username}
              </h1>
              <p className="mt-1 text-gray-500">@{user.username}</p>
              {user.wallet_addresses?.[0] && (
                <div className="mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center">
                  <p className="text-sm font-medium text-gray-600">Wallet Address:</p>
                  <Link
                    href={`${EXPLORER_BASE_URL}/address/${user.wallet_addresses[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-blue-600 hover:underline"
                  >
                    {formatAddress(user.wallet_addresses[0])}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
            <Folder className="h-6 w-6 text-blue-500" />
            <span>
              {user.display_name}&apos;s Sentinels ({agents.length})
            </span>
          </h2>
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent, index) => (
                <FeaturedAgentCard key={agent.agent_id} agent={agent} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
              <p className="text-gray-500">This user has not launched any Sentinels yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
