import { Clock, Trophy, AlertCircle, CheckCircle, XCircle, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { SUIVISION_TXBLOCK_URL } from '@/constants'

interface ParsedJson {
  success: boolean
  winner?: string
  amount_won?: string
  score?: number
  sender: string
  amount?: string
}

interface AgentEvent {
  id: {
    txDigest: string
    eventSeq: string
  }
  parsedJson: ParsedJson
  timestampMs: string
}

interface AgentEvents {
  agentDefeated: AgentEvent[]
  promptConsumed: AgentEvent[]
}

interface AgentHistoryProps {
  agentEvents: AgentEvents
  currentAgentId: string
}

export default function AgentHistory({ agentEvents }: AgentHistoryProps) {
  // Sort prompt events by timestamp (most recent first)
  const sortedPrompts = [...agentEvents.promptConsumed].sort(
    (a, b) => Number.parseInt(b.timestampMs) - Number.parseInt(a.timestampMs)
  )

  // Check if agent was defeated
  const isDefeated = agentEvents.agentDefeated.length > 0
  const defeatEvent = agentEvents.agentDefeated[0] // Most recent defeat

  // Calculate success rate
  const totalPrompts = sortedPrompts.length
  const successfulPrompts = sortedPrompts.filter(event => event.parsedJson.success).length
  const successRate = totalPrompts > 0 ? ((successfulPrompts / totalPrompts) * 100).toFixed(1) : 0

  const formatTimestamp = (timestamp: string) => {
    return new Date(Number.parseInt(timestamp)).toLocaleString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6 text-[#B5B5B5]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="rounded-lg border border-[#2E40494D] bg-[#12121266] p-6 backdrop-blur-xl lg:rounded-2xl"
      >
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-[#B8B8B8]">
          <Clock className="h-6 w-6 text-[#558EB4]" />
          Agent History
        </h2>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#2E40494D] bg-[#2E40494D] p-4">
            <div className="text-sm text-gray-400">Total Attempts</div>
            <div className="text-2xl font-bold text-[#B8B8B8]">{totalPrompts}</div>
          </div>
          <div className="rounded-lg border border-[#2E40494D] bg-[#2E40494D] p-4">
            <div className="text-sm text-gray-400">Success Rate</div>
            <div className="text-2xl font-bold text-green-400">{successRate}%</div>
          </div>
          <div className="rounded-lg border border-[#2E40494D] bg-[#2E40494D] p-4">
            <div className="text-sm text-gray-400">Status</div>
            <div className={`text-2xl font-bold ${isDefeated ? 'text-red-400' : 'text-green-400'}`}>
              {isDefeated ? 'Defeated' : 'Active'}
            </div>
          </div>
        </div>

        {isDefeated && defeatEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mb-6 rounded-lg border border-red-500/30 bg-red-900/20 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Agent Defeated</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <span className="text-gray-400">Winner: </span>
                <span className="font-mono">
                  {formatAddress(defeatEvent.parsedJson.winner || '')}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Amount Won: </span>
                <span className="text-green-400">
                  {(Number.parseInt(defeatEvent.parsedJson.amount_won || '0') / 1000000000).toFixed(
                    2
                  )}{' '}
                  SUI
                </span>
              </div>
              <div>
                <span className="text-gray-400">Score: </span>
                <span>{defeatEvent.parsedJson.score}</span>
              </div>
              <div>
                <span className="text-gray-400">Date: </span>
                <span>{formatTimestamp(defeatEvent.timestampMs)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="rounded-lg border border-[#2E40494D] bg-[#12121266] p-6 backdrop-blur-xl lg:rounded-2xl"
      >
        <h3 className="mb-4 text-xl font-bold text-[#B8B8B8]">Prompt Attempts</h3>
        {sortedPrompts.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No prompt attempts found for this agent.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPrompts.map((event, index) => (
              <motion.div
                key={`${event.id.txDigest}-${event.id.eventSeq}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="rounded-lg border-l-4 bg-[#2E40494D] p-4"
                style={{
                  borderLeftColor: event.parsedJson.success ? '#10b981' : '#ef4444',
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {event.parsedJson.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span
                      className={`font-semibold ${
                        event.parsedJson.success ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {event.parsedJson.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">#{totalPrompts - index}</span>
                </div>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Sender:</span>
                    <span className="font-mono">{formatAddress(event.parsedJson.sender)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Time:</span>
                    <span>{formatTimestamp(event.timestampMs)}</span>
                  </div>
                  {event.parsedJson.amount && Number.parseInt(event.parsedJson.amount) > 0 && (
                    <div>
                      <span className="text-gray-400">Amount:</span>
                      <span className="ml-2 text-green-400">
                        {(Number.parseInt(event.parsedJson.amount) / 1000000000).toFixed(2)} SUI
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Transaction:</span>
                    <a
                      href={`${SUIVISION_TXBLOCK_URL}/tx/${event.id.txDigest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 font-mono text-xs text-[#558EB4] hover:underline"
                    >
                      {formatAddress(event.id.txDigest)}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
