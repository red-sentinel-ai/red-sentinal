import { CheckCircle, XCircle, Trophy, Clock, User, AlertCircle } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { SUI_TESTNET_BASE_URL } from '@/constants'
import { fromTokenUnits, truncateAddress } from '@/lib/utils'
import { usePromptConsumedEventsByWallet } from '@/hooks/events/usePromptConsumedEventsByWallet'

export const UserActivity = () => {
  const account = useCurrentAccount()
  const accountAddress = account?.address
  const { data: promptEvents, isLoading } = usePromptConsumedEventsByWallet(accountAddress)

  const victories = (promptEvents || []).filter((e) => e.success)
  const attempts = promptEvents || []

  return (
    <>
      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Agent Victories
        </h2>

        {isLoading ? (
          <div className="text-gray-400 text-center py-8">
            <Clock className="w-10 h-10 mx-auto mb-4 animate-spin" />
            Loading your activity...
          </div>
        ) : victories.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            You haven’t defeated any agents yet.
          </div>
        ) : (
          <div className="space-y-4">
            {victories.map((event, i) => (
              <div
                key={event.txDigest}
                className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-green-400 font-semibold">Victory #{i + 1}</div>
                  <div className="text-sm text-gray-400">{formatTimestamp(event.timestamp)}</div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Agent ID:</span> <span>{event.agent_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount Won:</span>{' '}
                    <span className="text-green-400">
                      {(parseInt(event.amount || '0') / 1e9).toFixed(2)} SUI
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Score:</span> <span>{event.score}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Tx:</span>{' '}
                    <a
                      href={`${SUI_TESTNET_BASE_URL}/${event.txDigest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline font-mono"
                    >
                      {truncateAddress(event.txDigest)}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-lg mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Prompt Attempts
        </h2>

        {isLoading ? (
          <div className="text-gray-400 text-center py-8">
            <Clock className="w-10 h-10 mx-auto mb-4 animate-spin" />
            Loading your prompt attempts...
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No prompt attempts yet.
          </div>
        ) : (
          <div className="space-y-4">
            {[...attempts]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((event, i) => (
                <div
                  key={event.txDigest}
                  className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                    event.success ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2 items-center">
                      {event.success ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={`font-medium ${
                          event.success ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {event.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">#{attempts.length - i}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex gap-2 items-center">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Sender:</span>
                      <span className="font-mono">{truncateAddress(event.sender)}</span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Time:</span>
                      <span>{formatTimestamp(event.timestamp)}</span>
                    </div>

                    {event.amount && parseInt(event.amount) > 0 && (
                      <div>
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-green-400 ml-2">
                          {fromTokenUnits(event.amount)} SUI
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-400">Tx:</span>
                      <a
                        href={`${SUI_TESTNET_BASE_URL}/${event.txDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline ml-2 font-mono text-xs"
                      >
                        {truncateAddress(event.txDigest)}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  )
}

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
