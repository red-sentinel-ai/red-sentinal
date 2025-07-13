import { useState, useEffect, useCallback } from 'react'
import { AgentDetails } from '@/types'
import { fetchAgentDetailsViaObject } from '@/lib/sui-utils'
import { useSuiClient } from '@mysten/dapp-kit'
import { useAgentObjectNames } from './useAgentObjectNames'
import { DEFAULT_PROFILE_URL } from '@/constants'

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

  const fetchFeaturedAgentsMap = async (): Promise<Map<string, string>> => {
    try {
      const res = await fetch('/api/agents/featured')
      if (!res.ok) throw new Error('Failed to fetch featured agents')
      const data: { agent_id: number; is_featured: true; agent_profile?: string }[] =
        await res.json()

      const map = new Map<string, string>()
      for (const agent of data) {
        map.set(String(agent.agent_id), agent.agent_profile ?? '')
      }

      return map
    } catch (err) {
      console.error('[Featured Agents Error]', err)
      return new Map()
    }
  }

  const fetchAgentDetails = useCallback(
    async (objectIds: string[]) => {
      objectIds = objectIds.filter((objectId) => objectId.startsWith('0x'))
      setDetailsLoading(true)
      setDetailsError(null)

      try {
        const [featuredAgentsMap, settledResults] = await Promise.all([
          fetchFeaturedAgentsMap(),
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
            const entry = agentObjectNames.find((a) => a.agentId === agentObjectId)
            const agentIdStr = String(agent.agent_id)

            agent.agent_name = entry ? entry.agentName : ''
            agent.is_featured = featuredAgentsMap.has(agentIdStr)
            agent.agent_profile = featuredAgentsMap.get(agentIdStr) || DEFAULT_PROFILE_URL

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

        const featuredAgentsMap = await fetchFeaturedAgentsMap()
        const featuredAgentProfile = featuredAgentsMap.get(String(updatedAgent.agent_id))

        updatedAgent.is_featured = featuredAgentsMap.has(String(updatedAgent.agent_id))
        updatedAgent.agent_profile = featuredAgentProfile || DEFAULT_PROFILE_URL

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
