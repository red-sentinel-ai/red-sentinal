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

export function toReadableEvmError(error: unknown, fallbackMessage: string): string {
  if (isUserRejectedRequestError(error)) return 'Transaction rejected'
  if (error instanceof WrongChainError) return error.message

  const shortMessage = (error as { shortMessage?: unknown } | null)?.shortMessage
  if (typeof shortMessage === 'string' && shortMessage.length > 0) return shortMessage

  return error instanceof Error ? error.message : fallbackMessage
}
