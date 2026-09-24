'use client'

import { useCallback } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { useActiveChain } from '@/context/ActiveChainContext'
import {
  getEvmChainId,
  getEvmChainKey,
  toEvmChainKey,
  type EvmChainId,
  type EvmChainKey,
} from '@/constants/chains'
import { getEvmConfigForChainKey, type EvmConfig } from '@/constants/evm'
import {
  WrongChainError,
  isUnrecognizedChainError,
  isUserRejectedRequestError,
} from '@/lib/evm/errors'

export type EvmChainState = {
  activeEvmChainKey: EvmChainKey | null
  intendedChainId: EvmChainId | null
  evmConfig: EvmConfig | null
  walletChainId: number | undefined
  walletChainKey: EvmChainKey | null
  isWalletOnWrongChain: boolean
  isSwitchingChain: boolean
  ensureWalletOnActiveChain: () => Promise<EvmChainId>
  switchWalletToChain: (chainKey: EvmChainKey) => Promise<void>
}

export function useEvmChain(): EvmChainState {
  const { activeChain } = useActiveChain()
  const { chainId: walletChainId, isConnected } = useAccount()
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain()

  const activeEvmChainKey = toEvmChainKey(activeChain)
  const intendedChainId = getEvmChainId(activeChain)
  const evmConfig = activeEvmChainKey ? getEvmConfigForChainKey(activeEvmChainKey) : null
  const walletChainKey = getEvmChainKey(walletChainId)

  const isWalletOnWrongChain =
    isConnected && intendedChainId !== null && walletChainId !== intendedChainId

  const switchWalletToChain = useCallback(
    async (chainKey: EvmChainKey) => {
      const targetChainId = getEvmChainId(chainKey)
      if (targetChainId === null) return

      try {
        await switchChainAsync({ chainId: targetChainId })
      } catch (error) {
        if (isUserRejectedRequestError(error)) throw WrongChainError.rejectedByUser(chainKey)
        if (isUnrecognizedChainError(error)) throw WrongChainError.unsupportedByWallet(chainKey)
        throw error
      }
    },
    [switchChainAsync]
  )

  const ensureWalletOnActiveChain = useCallback(async () => {
    if (!activeEvmChainKey || intendedChainId === null) {
      throw new Error('No EVM chain is selected')
    }
    if (!isConnected) {
      throw new Error('EVM wallet not connected')
    }
    if (walletChainId !== intendedChainId) {
      await switchWalletToChain(activeEvmChainKey)
    }
    return intendedChainId
  }, [activeEvmChainKey, intendedChainId, isConnected, walletChainId, switchWalletToChain])

  return {
    activeEvmChainKey,
    intendedChainId,
    evmConfig,
    walletChainId,
    walletChainKey,
    isWalletOnWrongChain,
    isSwitchingChain,
    ensureWalletOnActiveChain,
    switchWalletToChain,
  }
}
