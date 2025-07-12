import { useState, useEffect, useCallback } from 'react'
import { AgentDetails } from '@/types'
import { fetchAgentDetailsViaObject } from '@/lib/sui-utils'
import { useSuiClient } from '@mysten/dapp-kit'
import { useAgentObjectNames } from './useAgentObjectNames'

interface UseAllAgentsReturn {
  agents: AgentDetails[]
  loading: boolean
  error: string | null
  refetchAll: () => Promise<void>
  refetchAgent: (objectId: string) => Promise<AgentDetails>
}

export const useAllAgents = (): UseAllAgentsReturn => {
  const {
    agentObjectNames,
    loading: idsLoading,
    error: idsError,
    refetch: refetchIdWithNames,
  } = useAgentObjectNames()
  const client = useSuiClient()
  const [agents, setAgents] = useState<AgentDetails[]>([])

  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  const fetchFeaturedAgentIds = async (): Promise<Set<string>> => {
    try {
      const res = await fetch('/api/agents/featured')
      if (!res.ok) throw new Error('Failed to fetch featured agents')
      const data: { agent_id: number; is_featured: true }[] = await res.json()
      return new Set(data.map((d) => String(d.agent_id)))
    } catch (err) {
      console.error('[Featured Agents Error]', err)
      return new Set()
    }
  }

  const fetchAgentDetails = useCallback(
    async (objectIds: string[]) => {
      objectIds = objectIds.filter((objectId) => objectId.startsWith('0x'))
      setDetailsLoading(true)
      setDetailsError(null)

      try {
        const [featuredIds, settledResults] = await Promise.all([
          fetchFeaturedAgentIds(),
          Promise.all(
            objectIds.map(async (objectId) => {
              try {
                return await fetchAgentDetailsViaObject(client, objectId)
              } catch (error) {
                console.error(`Error fetching agent ${objectId}:`, error)
                return null
              }
            })
          ),
        ])

        const successfulAgents = settledResults
          .filter((agent) => agent !== null)
          .map((agent) => {
            const agentObjectId = agent.agent_object_id
            const entry = agentObjectNames.find((agent) => agent.agentId === agentObjectId)
            agent.agent_name = entry ? entry.agentName : ''
            agent.is_featured = featuredIds.has(String(agent.agent_id))
            return agent
          })

        const sortedAgents = successfulAgents.sort((a, b) => {
          const aFeatured = a.is_featured ? 1 : 0
          const bFeatured = b.is_featured ? 1 : 0
          return bFeatured - aFeatured
        })

        setAgents(sortedAgents)

        if (successfulAgents.length !== objectIds.length) {
          setDetailsError(`Failed to fetch ${objectIds.length - successfulAgents.length} agents`)
        }
      } catch (error) {
        console.error('Unexpected error in fetchAgentDetails:', error)
        setDetailsError('An unexpected error occurred while fetching agents')
      } finally {
        setDetailsLoading(false)
      }
    },
    [client, agentObjectNames]
  )

  useEffect(() => {
    if (agentObjectNames.length > 0 && !idsLoading && !idsError) {
      const agentObjectIds = agentObjectNames.map((agent) => agent.agentId)
      fetchAgentDetails(agentObjectIds)
    }
  }, [agentObjectNames, idsLoading, idsError, fetchAgentDetails])

  const refetchAll = useCallback(async () => {
    try {
      await refetchIdWithNames()
      if (agentObjectNames.length > 0) {
        const agentObjectIds = agentObjectNames.map((agent) => agent.agentId)
        await fetchAgentDetails(agentObjectIds)
      }
    } catch (error) {
      console.error('Error refetching all agents:', error)
    }
  }, [refetchIdWithNames, agentObjectNames, fetchAgentDetails])

  const refetchAgent = useCallback(
    async (objectId: string) => {
      try {
        const updatedAgent = await fetchAgentDetailsViaObject(client, objectId)

        const ourAgentName = agentObjectNames.find(
          (agent) => agent.agentId === updatedAgent.agent_object_id
        )

        updatedAgent.agent_name = ourAgentName?.agentName || ''

        const featuredIds = await fetchFeaturedAgentIds()
        updatedAgent.is_featured = featuredIds.has(String(updatedAgent.agent_id))

        setAgents((prevAgents) =>
          prevAgents.map((agent) =>
            agent.agent_id === updatedAgent.agent_id ? updatedAgent : agent
          )
        )

        return updatedAgent
      } catch (error) {
        console.error(`Error refetching agent ${objectId}:`, error)
        throw new Error(`Failed to refetch agent ${objectId}`)
      }
    },
    [agentObjectNames, client]
  )

  return {
    agents,
    loading: idsLoading || detailsLoading,
    error: idsError || detailsError,
    refetchAll,
    refetchAgent,
  }
}
