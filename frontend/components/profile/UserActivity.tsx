import { useMemo } from 'react'
import { CheckCircle, XCircle, Trophy, Clock, User, AlertCircle } from 'lucide-react'
import { useAgentEvents } from '@/hooks/useAgentEvents'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { truncateAddress } from '@/lib/utils'
import { SUIVISION_TXBLOCK_URL } from '@/constants'

export const UserActivity = () => {
  const { events, loading } = useAgentEvents()
  const { address: accountAddress, chain } = useConnectedAddress()

  const isSui = chain === 'sui'

  const userEvents = useMemo(() => {
    if (!isSui || !accountAddress || !events.promptConsumed || !events.agentDefeated) {
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
  }, [events.promptConsumed, events.agentDefeated, accountAddress, isSui])

  const formatTimestamp = (ms: string) =>
    new Date(parseInt(ms)).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const { promptConsumed, agentDefeated } = userEvents

  return (
    <>
      {loading ? (
        <div className="py-20 text-center text-[var(--color-text-muted)]">
          <Clock className="mx-auto mb-4 h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
          Loading your activity...
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text-primary)]">
              <Trophy className="h-5 w-5 text-[var(--color-gold-primary)]" />
              Agent Victories
            </h2>

            {agentDefeated.length === 0 ? (
              <div className="py-8 text-center text-[var(--color-text-muted)]">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                You haven't defeated any agents yet.
              </div>
            ) : (
              <div className="space-y-4">
                {agentDefeated.map((event, i) => (
                  <div
                    key={`${event.id.txDigest}-${event.id.eventSeq}`}
                    className="rounded-lg border-l-4 border-[var(--color-gold-primary)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-card)]"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-semibold text-[var(--color-success)]">Victory #{i + 1}</div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {formatTimestamp(event.timestampMs)}
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm text-[var(--color-text-secondary)] md:grid-cols-2">
                      <div>
                        <span className="text-[var(--color-text-muted)]">Agent ID:</span>{' '}
                        <span>{event.parsedJson.agent_id}</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Amount Won:</span>{' '}
                        <span className="font-medium text-[var(--color-success)]">
                          {(parseInt(event.parsedJson.amount_won || '0') / 1e9).toFixed(2)} SUI
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Score:</span>{' '}
                        <span>{event.parsedJson.score}</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Tx:</span>{' '}
                        <a
                          href={`${SUIVISION_TXBLOCK_URL}/${event.id.txDigest}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[var(--color-gold-primary)] hover:underline"
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

          <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text-primary)]">
              <Clock className="h-5 w-5 text-[var(--color-info)]" />
              Prompt Attempts
            </h2>

            {promptConsumed.length === 0 ? (
              <div className="py-8 text-center text-[var(--color-text-muted)]">
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
                      className={`rounded-lg border-l-4 bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-card)] ${
                        event.parsedJson.success ? 'border-[var(--color-success)]' : 'border-[var(--color-danger)]'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {event.parsedJson.success ? (
                            <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                          ) : (
                            <XCircle className="h-4 w-4 text-[var(--color-danger)]" />
                          )}
                          <span
                            className={`font-medium ${
                              event.parsedJson.success ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                            }`}
                          >
                            {event.parsedJson.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <span className="text-sm text-[var(--color-text-muted)]">#{promptConsumed.length - i}</span>
                      </div>

                      <div className="grid gap-3 text-sm text-[var(--color-text-secondary)] md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[var(--color-text-muted)]" />
                          <span className="text-[var(--color-text-muted)]">Sender:</span>
                          <span className="font-mono">
                            {truncateAddress(event.parsedJson.sender)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
                          <span className="text-[var(--color-text-muted)]">Time:</span>
                          <span>{formatTimestamp(event.timestampMs)}</span>
                        </div>

                        {event.parsedJson.amount && parseInt(event.parsedJson.amount) > 0 && (
                          <div>
                            <span className="text-[var(--color-text-muted)]">Amount:</span>
                            <span className="ml-2 font-medium text-[var(--color-success)]">
                              {(parseInt(event.parsedJson.amount) / 1e9).toFixed(2)} SUI
                            </span>
                          </div>
                        )}

                        <div>
                          <span className="text-[var(--color-text-muted)]">Tx:</span>
                          <a
                            href={`${SUIVISION_TXBLOCK_URL}/${event.id.txDigest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 font-mono text-xs text-[var(--color-gold-primary)] hover:underline"
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
