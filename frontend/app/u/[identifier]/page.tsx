import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { User, Folder } from 'lucide-react'
import { truncateAddress } from '@/lib/utils'
import { supabaseServiceClient } from '@/db/config/server'
import { FeaturedAgentCard } from '@/components/FeaturedAgentCard'
import { TelegramSubscriptionsSectionWrapper } from '@/components/profile/TelegramSubscriptionsSectionWrapper'
import { type AgentDetails } from '@/hooks/agents/useAllAgents'
import { APP_NETWORK, EXPLORER_BASE_URL, SUI_SENTINEL_API_URL } from '@/constants'

// Here we didn't used the useAgentsByOwner because it's a server components and good for SEO, if we want to use useAgentsByOwner hook, we will need to convert it to client component
async function fetchAgentsByCreator(walletAddress: string): Promise<AgentDetails[]> {
  const res = await fetch(
    `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?creator=${walletAddress}&limit=50&include_prize_pool=true`
  )
  if (!res.ok) return []

  const { agents } = await res.json()
  return agents.map((agent: AgentDetails) => ({
    ...agent,
    agent_path: agent.agent_name
      ? agent.agent_name.toLowerCase().replace(/\s+/g, '_')
      : agent.agent_object_id,
  }))
}

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

  const agentsByWallet = await Promise.all(
    user.wallet_addresses.map((addr: string) => fetchAgentsByCreator(addr))
  )
  const agents = agentsByWallet.flat()

  return { user, agents }
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
    <div className="min-h-body container mx-auto px-4 pb-12 pt-24 text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="mb-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-2 border-[var(--color-border-subtle)]">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt="User Avatar" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-subtle)]">
                  <User className="h-14 w-14 text-[var(--color-text-faint)]" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold sm:text-4xl">
                {user.display_name || user.username}
              </h1>
              <p className="mt-1 text-[var(--color-text-muted)]">@{user.username}</p>
              {user.wallet_addresses?.[0] && (
                <div className="mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Wallet Address:</p>
                  <Link
                    href={`${EXPLORER_BASE_URL}/address/${user.wallet_addresses[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-[var(--color-info)] hover:underline"
                  >
                    {truncateAddress(user.wallet_addresses[0])}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <TelegramSubscriptionsSectionWrapper
          profileWalletAddresses={user.wallet_addresses ?? []}
        />

        <div>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
            <Folder className="h-6 w-6 text-[var(--color-gold-primary)]" />
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
            <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] py-16 text-center">
              <p className="text-[var(--color-text-muted)]">This user has not launched any Sentinels yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
