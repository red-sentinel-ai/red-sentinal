import { CHAINS, type EvmChainKey } from '@/constants/chains'

export class WrongChainError extends Error {
  readonly intendedChain: EvmChainKey

  constructor(intendedChain: EvmChainKey, reason: string) {
    super(reason)
    this.name = 'WrongChainError'
    this.intendedChain = intendedChain
  }

  static rejectedByUser(intendedChain: EvmChainKey) {
    return new WrongChainError(
      intendedChain,
      `Switch your wallet to ${CHAINS[intendedChain].name} to continue.`
    )
  }

  static unsupportedByWallet(intendedChain: EvmChainKey) {
    return new WrongChainError(
      intendedChain,
      `Your wallet can't switch to ${CHAINS[intendedChain].name}. Add the network in your wallet, or connect a different one.`
    )
  }
}

const USER_REJECTED_REQUEST_CODE = 4001
const UNRECOGNIZED_CHAIN_CODE = 4902

function getProviderErrorCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined
  const candidate = error as { code?: unknown; cause?: unknown }
  if (typeof candidate.code === 'number') return candidate.code
  return getProviderErrorCode(candidate.cause)
}

export function isUserRejectedRequestError(error: unknown): boolean {
  if (getProviderErrorCode(error) === USER_REJECTED_REQUEST_CODE) return true
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return message.includes('user rejected') || message.includes('user denied')
}

export function isUnrecognizedChainError(error: unknown): boolean {
  if (getProviderErrorCode(error) === UNRECOGNIZED_CHAIN_CODE) return true
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return (
    message.includes('unrecognized chain') ||
    message.includes('unsupported chain') ||
    message.includes('chain not configured')
  )
}

// Sentinel.sol custom errors, matched against the raw error message (viem
// renders reverts as "Reverted with custom error: 'AgentNotPaused()'").
// Checked before viem's generic shortMessage, which is often just
// "Execution Reverted" and hides the actual reason.
const SENTINEL_REVERT_MESSAGES: ReadonlyArray<[RegExp, string]> = [
  [/AgentNotPaused\(\)/, 'Pause the sentinel and wait 3 hours before withdrawing'],
  [/WithdrawalCooldownActive\(\)/, 'Withdrawal unlocks 3 hours after pausing — try again later'],
  [/InsufficientBalance\(\)/, 'The sentinel balance is lower than the requested amount'],
  [/AgentNotFound\(\)/, 'Sentinel not found'],
  [/AgentInactive\(\)/, 'This sentinel was defeated and can no longer be funded'],
  [/AgentNotActive\(\)/, 'This sentinel is not active'],
]

function collectErrorMessages(error: unknown, depth = 0): string[] {
  if (!error || depth > 5) return []
  const messages: string[] = []
  if (error instanceof Error) {
    messages.push(error.message)
    const cause = (error as { cause?: unknown }).cause
    if (cause) messages.push(...collectErrorMessages(cause, depth + 1))
  }
  return messages
}

function getSentinelRevertMessage(error: unknown): string | undefined {
  const messages = collectErrorMessages(error)
  for (const [pattern, readable] of SENTINEL_REVERT_MESSAGES) {
    if (messages.some(message => pattern.test(message))) return readable
  }
  return undefined
}

export function toReadableEvmError(error: unknown, fallbackMessage: string): string {
  if (isUserRejectedRequestError(error)) return 'Transaction rejected'
  if (error instanceof WrongChainError) return error.message

  const sentinelRevert = getSentinelRevertMessage(error)
  if (sentinelRevert) return sentinelRevert

  const shortMessage = (error as { shortMessage?: unknown } | null)?.shortMessage
  if (typeof shortMessage === 'string' && shortMessage.length > 0) return shortMessage

  return error instanceof Error ? error.message : fallbackMessage
}
