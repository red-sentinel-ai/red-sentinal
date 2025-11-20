import { useQuery } from '@tanstack/react-query'
import { useSuiClient } from '@mysten/dapp-kit'
import { SuiClient, SuiEvent } from '@mysten/sui/client'
import { SUI_CONFIG, MIST_PER_SUI, AGENT_PRIZE_POOL_HISTORY_QUERY_KEY } from '@/constants'
import { ChartDataPoint } from '@/components/charts/PrizePoolChartModal'

type AgentEvent = SuiEvent & {
  parsedJson: {
    agent_id: string
    amount?: string
    amount_to_agent?: string
    amount_won?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  timestampMs: string
}

interface PrizePoolHistoryData {
  history: ChartDataPoint[]
  change7d: {
    percentage: number
    absolute: number
  }
}

/**
 * TODO: this should be paginated to fetch all historical data.
 * For this example, we fetch the 50 most recent, which is not complete.
 */
const fetchEvents = async (client: SuiClient, eventType: string): Promise<AgentEvent[]> => {
  const { data } = await client.queryEvents({
    query: {
      MoveEventType: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::${eventType}`,
    },
    limit: 50, // Increase limit or implement pagination for full history
    order: 'ascending',
  })
  return data as unknown as AgentEvent[]
}

const calculatePrizePoolHistory = (events: AgentEvent[], agentId: string): PrizePoolHistoryData => {
  const filteredEvents = events
    .filter((event) => event.parsedJson?.agent_id === agentId)
    .sort((a, b) => Number(a.timestampMs) - Number(b.timestampMs))

  if (filteredEvents.length === 0) {
    return { history: [], change7d: { percentage: 0, absolute: 0 } }
  }

  let currentBalance = 0
  const history: ChartDataPoint[] = []

  history.push({ time: new Date(Number(filteredEvents[0].timestampMs) - 1000), value: 0 })

  for (const event of filteredEvents) {
    const timestamp = new Date(Number(event.timestampMs))
    const type = event.type.split('::').pop()
    let balanceChanged = false

    switch (type) {
      case 'AgentFunded':
        currentBalance += Number(event.parsedJson.amount || 0)
        balanceChanged = true
        break
      case 'FeeTransferred':
        currentBalance += Number(event.parsedJson.amount_to_agent || 0)
        balanceChanged = true
        break
      case 'FundsWithdrawn':
        currentBalance -= Number(event.parsedJson.amount || 0)
        balanceChanged = true
        break
      case 'AgentDefeated':
        // We add one point at the peak, and one at zero right after.
        const balanceBeforeDefeat = Number(event.parsedJson.amount_won || 0)
        if (currentBalance !== balanceBeforeDefeat) {
          // Trust the event data for the final balance before defeat
          currentBalance = balanceBeforeDefeat
          history.push({
            time: new Date(timestamp.getTime() - 1),
            value: currentBalance / MIST_PER_SUI,
          })
        }
        currentBalance = 0
        balanceChanged = true
        break
    }

    if (currentBalance < 0) {
      currentBalance = 0
    }

    if (balanceChanged) {
      history.push({ time: timestamp, value: currentBalance / MIST_PER_SUI })
    }
  }

  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  const currentSuiBalance = history.length > 0 ? history[history.length - 1].value : 0

  const firstDataPointInWindow = history.find((p) => p.time.getTime() >= sevenDaysAgo)

  // Find the data point just *before* the 7-day window
  const lastDataPointBeforeWindow = [...history]
    .reverse()
    .find((p) => p.time.getTime() < sevenDaysAgo)

  // Use the data point before the window as the starting balance.
  // If no data point before, use the first data point in the window (or 0 if none).
  const balance7d = lastDataPointBeforeWindow?.value ?? firstDataPointInWindow?.value ?? 0

  const absoluteChange = currentSuiBalance - balance7d
  // Handle division by zero or infinite increase from 0
  const percentageChange =
    balance7d > 0 ? (absoluteChange / balance7d) * 100 : currentSuiBalance > 0 ? Infinity : 0

  return {
    history,
    change7d: {
      percentage: percentageChange,
      absolute: absoluteChange,
    },
  }
}

export const useAgentPrizePoolHistory = (agentId: string) => {
  const client = useSuiClient()

  return useQuery<PrizePoolHistoryData, Error>({
    queryKey: [AGENT_PRIZE_POOL_HISTORY_QUERY_KEY, agentId],
    enabled: !!agentId,
    queryFn: async () => {
      const [fundedEvents, feeEvents, defeatedEvents, withdrawnEvents] = await Promise.all([
        fetchEvents(client, 'AgentFunded'),
        fetchEvents(client, 'FeeTransferred'),
        fetchEvents(client, 'AgentDefeated'),
        fetchEvents(client, 'FundsWithdrawn'),
      ])

      const allEvents = [...fundedEvents, ...feeEvents, ...defeatedEvents, ...withdrawnEvents]

      return calculatePrizePoolHistory(allEvents, agentId)
    },
    staleTime: 60 * 1000,
  })
}
