import { useMemo } from 'react'
import { CheckCircle, XCircle, Trophy, Clock, User, AlertCircle } from 'lucide-react'
import { useAgentEvents } from '@/hooks/useAgentEvents'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { truncateAddress } from '@/lib/utils'
import { SUIVISION_TXBLOCK_URL } from '@/constants'

export const UserActivity = () => {
  const { events, loading } = useAgentEvents()
  const account = useCurrentAccount()
  const accountAddress = account?.address

  const userEvents = useMemo(() => {
    if (!accountAddress || !events.promptConsumed || !events.agentDefeated) {
      return {
        promptConsumed: [],
        agentDefeated: [],
      }
    }

    const filteredPrompts = events.promptConsumed.filter(
      event => event.parsedJson.sender === accountAddress
    )

    const filteredDefeated = events.agentDefeated.filter(
      event => event.parsedJson.winner === accountAddress
    )

    return {
      promptConsumed: filteredPrompts,
      agentDefeated: filteredDefeated,
    }
  }, [events.promptConsumed, events.agentDefeated, accountAddress])

  const formatTimestamp = (ms: string) =>
    new Date(parseInt(ms)).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const { promptConsumed, agentDefeated } = userEvents

  return (
    <>
      {loading ? (
        <div className="py-20 text-center text-gray-500">
          <Clock className="mx-auto mb-4 h-10 w-10 animate-spin" />
          Loading your activity...
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-black">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Agent Victories
            </h2>

            {agentDefeated.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                You haven’t defeated any agents yet.
              </div>
            ) : (
              <div className="space-y-4">
                {agentDefeated.map((event, i) => (
                  <div
                    key={`${event.id.txDigest}-${event.id.eventSeq}`}
                    className="rounded-lg border-l-4 border-yellow-400 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-semibold text-green-600">Victory #{i + 1}</div>
                      <div className="text-sm text-gray-500">
                        {formatTimestamp(event.timestampMs)}
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm text-gray-800 md:grid-cols-2">
                      <div>
                        <span className="text-gray-500">Agent ID:</span>{' '}
                        <span>{event.parsedJson.agent_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount Won:</span>{' '}
                        <span className="font-medium text-green-600">
                          {(parseInt(event.parsedJson.amount_won || '0') / 1e9).toFixed(2)} SUI
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Score:</span>{' '}
                        <span>{event.parsedJson.score}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tx:</span>{' '}
                        <a
                          href={`${SUIVISION_TXBLOCK_URL}/${event.id.txDigest}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-blue-600 hover:underline"
                        >
                          {truncateAddress(event.id.txDigest)}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-black">
              <Clock className="h-5 w-5 text-blue-500" />
              Prompt Attempts
            </h2>

            {promptConsumed.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                No prompt attempts yet.
              </div>
            ) : (
              <div className="space-y-4">
                {[...promptConsumed]
                  .sort((a, b) => parseInt(b.timestampMs) - parseInt(a.timestampMs))
                  .map((event, i) => (
                    <div
                      key={`${event.id.txDigest}-${event.id.eventSeq}`}
                      className={`rounded-lg border-l-4 bg-white p-4 shadow-sm ${
                        event.parsedJson.success ? 'border-green-500' : 'border-red-500'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {event.parsedJson.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`font-medium ${
                              event.parsedJson.success ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {event.parsedJson.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">#{promptConsumed.length - i}</span>
                      </div>

                      <div className="grid gap-3 text-sm text-gray-800 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500">Sender:</span>
                          <span className="font-mono">
                            {truncateAddress(event.parsedJson.sender)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500">Time:</span>
                          <span>{formatTimestamp(event.timestampMs)}</span>
                        </div>

                        {event.parsedJson.amount && parseInt(event.parsedJson.amount) > 0 && (
                          <div>
                            <span className="text-gray-500">Amount:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {(parseInt(event.parsedJson.amount) / 1e9).toFixed(2)} SUI
                            </span>
                          </div>
                        )}

                        <div>
                          <span className="text-gray-500">Tx:</span>
                          <a
                            href={`${SUIVISION_TXBLOCK_URL}/${event.id.txDigest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 font-mono text-xs text-blue-600 hover:underline"
                          >
                            {truncateAddress(event.id.txDigest)}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
