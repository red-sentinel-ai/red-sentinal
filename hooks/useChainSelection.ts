'use client'

import { useCallback, useState } from 'react'
import { toast } from '@/lib/toast'
import { useAccount } from 'wagmi'
import { CHAINS, toEvmChainKey, type SupportedChain } from '@/constants/chains'
import { useActiveChain } from '@/context/ActiveChainContext'
import { useEvmChain } from '@/hooks/evm/useEvmChain'
import { toReadableEvmError } from '@/lib/evm/errors'

export function useChainSelection() {
  const { activeChain, setActiveChain, isHydrated } = useActiveChain()
  const { isConnected: isEvmWalletConnected } = useAccount()
  const { switchWalletToChain } = useEvmChain()
  const [isSelectingChain, setIsSelectingChain] = useState(false)

  const selectChain = useCallback(
    async (nextChain: SupportedChain) => {
      if (nextChain === activeChain || isSelectingChain) return

      const previousChain = activeChain
      const nextEvmChainKey = toEvmChainKey(nextChain)

      setActiveChain(nextChain)

      if (!nextEvmChainKey || !isEvmWalletConnected) return

      setIsSelectingChain(true)
      try {
        await switchWalletToChain(nextEvmChainKey)
      } catch (error) {
        setActiveChain(previousChain)
        toast.error(
          toReadableEvmError(error, `Could not switch your wallet to ${CHAINS[nextChain].name}`)
        )
      } finally {
        setIsSelectingChain(false)
      }
    },
    [activeChain, isSelectingChain, setActiveChain, isEvmWalletConnected, switchWalletToChain]
  )

  return { activeChain, selectChain, isSelectingChain, isHydrated }
}
