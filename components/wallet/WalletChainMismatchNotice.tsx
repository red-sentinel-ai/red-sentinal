'use client'

import Image from 'next/image'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'
import { CHAINS } from '@/constants/chains'
import { useEvmChain } from '@/hooks/evm/useEvmChain'
import { useChainSelection } from '@/hooks/useChainSelection'
import { toReadableEvmError } from '@/lib/evm/errors'

export function WalletChainMismatchNotice() {
  const {
    activeEvmChainKey,
    walletChainKey,
    isWalletOnWrongChain,
    isSwitchingChain,
    switchWalletToChain,
  } = useEvmChain()
  const { selectChain, isSelectingChain } = useChainSelection()

  if (!isWalletOnWrongChain || !activeEvmChainKey) return null

  const appChain = CHAINS[activeEvmChainKey]
  const walletChainName = walletChainKey ? CHAINS[walletChainKey].name : 'an unsupported network'
  const isBusy = isSwitchingChain || isSelectingChain

  const moveWalletToAppChain = async () => {
    try {
      await switchWalletToChain(activeEvmChainKey)
    } catch (error) {
      toast.error(toReadableEvmError(error, `Could not switch your wallet to ${appChain.name}`))
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-b border-[var(--color-warning)]/25 bg-[var(--color-bg-surface)] px-4 py-2.5">
      <div className="flex items-center gap-2 text-[var(--color-warning)]">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs font-medium sm:text-sm">
          Your wallet is on {walletChainName}, but Sentinel is set to {appChain.name}.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={moveWalletToAppChain}
          disabled={isBusy}
          className="flex items-center gap-1.5 bg-[var(--color-text-primary)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Image
              src={appChain.icon}
              alt={appChain.name}
              width={14}
              height={14}
              className="rounded-full"
            />
          )}
          Switch wallet to {appChain.name}
        </button>

        {walletChainKey && (
          <button
            type="button"
            onClick={() => selectChain(walletChainKey)}
            disabled={isBusy}
            className="button-ghost-terminal px-3 py-1.5 text-xs uppercase tracking-wider disabled:opacity-50"
          >
            Use {CHAINS[walletChainKey].name} instead
          </button>
        )}
      </div>
    </div>
  )
}
