'use client'

import { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { SENTINEL_ABI } from '@/lib/evm/abi'
import { isEvmChain, toEvmChainKey, type SupportedChain } from '@/constants/chains'
import { getEvmConfigForChainKey } from '@/constants/evm'
import { WITHDRAWAL_COOLDOWN_MS } from './usePauseAgentEVM'

// AgentState enum on Sentinel.sol
const AGENT_STATE_ACTIVE = 0
const AGENT_STATE_PAUSED = 1

const COOLDOWN_TICK_MS = 30_000

export type EvmWithdrawReadiness = {
  /** Undefined while loading or for non-EVM chains */
  onChainState: 'active' | 'paused' | undefined
  pausedAtSec: bigint | undefined
  isPaused: boolean
  /** Milliseconds left in the post-pause withdrawal cooldown; 0 when withdrawable */
  cooldownRemainingMs: number | null
  /** True only when paused AND the 3-hour cooldown has elapsed */
  canWithdraw: boolean
  isLoading: boolean
  refetch: () => void
}

/**
 * Reads the sentinel's pause state straight from the Sentinel contract. The
 * backend Agent record doesn't carry the EVM paused state, and withdrawals are
 * gated on-chain (paused + 3-hour cooldown), so the UI needs this to explain
 * why a withdrawal would fail instead of sending a reverting transaction.
 */
export function useEvmWithdrawReadiness(
  agentId: string | undefined,
  chain: SupportedChain | undefined
): EvmWithdrawReadiness {
  const isEvm = isEvmChain(chain)
  const chainKey = isEvm ? toEvmChainKey(chain) : null
  const evmConfig = chainKey ? getEvmConfigForChainKey(chainKey) : null
  const enabled = isEvm && !!agentId && !!evmConfig

  // The cooldown countdown must move with the wall clock, so re-render on a
  // slow tick while the hook is mounted.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!isEvm) return
    const interval = setInterval(() => setTick(t => t + 1), COOLDOWN_TICK_MS)
    return () => clearInterval(interval)
  }, [isEvm])

  const { data, isLoading, refetch } = useReadContract({
    address: evmConfig?.contractAddress,
    abi: SENTINEL_ABI,
    functionName: 'getAgent',
    args: enabled && agentId ? [agentId] : undefined,
    chainId: evmConfig?.chainId,
    query: { enabled },
  })

  const agent = data as
    | {
        state: number
        pausedAt: bigint
        exists: boolean
        isDefeated: boolean
      }
    | undefined

  const isPaused = agent?.state === AGENT_STATE_PAUSED
  const pausedAtSec = agent?.pausedAt

  let cooldownRemainingMs: number | null = null
  if (isPaused && pausedAtSec !== undefined) {
    const cooldownEndMs = Number(pausedAtSec) * 1000 + WITHDRAWAL_COOLDOWN_MS
    cooldownRemainingMs = Math.max(0, cooldownEndMs - Date.now())
  }

  return {
    onChainState:
      agent?.state === AGENT_STATE_PAUSED
        ? 'paused'
        : agent?.state === AGENT_STATE_ACTIVE
          ? 'active'
          : undefined,
    pausedAtSec,
    isPaused,
    cooldownRemainingMs,
    canWithdraw: isPaused && cooldownRemainingMs === 0,
    isLoading: isEvm && isLoading,
    refetch: () => refetch(),
  }
}
