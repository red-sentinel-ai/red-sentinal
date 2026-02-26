import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK, AGENT_PRIZE_POOL_HISTORY_QUERY_KEY } from '@/constants'
import { ChartDataPoint } from '@/components/charts/PrizePoolChartModal'

interface PrizePoolHistoryData {
  history: ChartDataPoint[]
  change7d: {
    percentage: number
    absolute: number
  }
}

interface AgentApiResponse {
  prizePoolHistory: {
    history: Array<{ time: string; value: number }>
    change7d: { percentage: number; absolute: number }
  }
}

export const useAgentPrizePoolHistory = (agentId: string, enabled = true) => {
  return useQuery<PrizePoolHistoryData, Error>({
    queryKey: [AGENT_PRIZE_POOL_HISTORY_QUERY_KEY, agentId],
    enabled: !!agentId && enabled,
    queryFn: async () => {
      const response = await fetch(`${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}/${agentId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch agent data: ${response.statusText}`)
      }
      const data: AgentApiResponse = await response.json()
      const { history, change7d } = data.prizePoolHistory
      return {
        history: history.map(point => ({
          time: new Date(point.time),
          value: point.value,
        })),
        change7d,
      }
    },
    staleTime: 60 * 1000,
  })
}
