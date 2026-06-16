import { useQueryClient } from '@tanstack/react-query'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useUpdateAgent } from '@/hooks/agents/useUpdateAgent'
import { useClaimFeesSolana } from '@/hooks/agents/useClaimFeesSolana'
import { useClaimFeesEVM } from '@/hooks/agents/useClaimFeesEVM'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { AgentUpdateDialog } from './AgentUpdateDialog'
import { getTokenForCoinType } from '@/constants/tokens'
import { TokenAmount } from '../ui/common/TokenAmount'
import { isEvmChain, type SupportedChain } from '@/constants/chains'

interface ClaimFeesModalProps {
  open: boolean
  onClose: () => void
  agentId: string
  agentObjectId: string
  accumulatedFees: number
  coinType?: string
  chain?: SupportedChain
}

export const ClaimFeesModal = ({
  open,
  onClose,
  agentId,
  agentObjectId,
  accumulatedFees,
  coinType,
  chain = 'sui',
}: ClaimFeesModalProps) => {
  const { claimFees: claimFeesSui, isLoading: isSuiLoading } = useUpdateAgent()
  const { claimFees: claimFeesSolana, isLoading: isSolanaLoading } = useClaimFeesSolana()
  const { claimFees: claimFeesEvm, isLoading: isEvmLoading } = useClaimFeesEVM()
  const queryClient = useQueryClient()
  const account = useCurrentAccount()
  const { publicKey: solanaPublicKey } = useSolanaWallet()
  const { address: evmAddress } = useEVMWallet()

  const isSolana = chain === 'solana'
  const isEvm = isEvmChain(chain)
  const isLoading = isEvm ? isEvmLoading : isSolana ? isSolanaLoading : isSuiLoading
  const token = getTokenForCoinType(coinType)
  const hasFees = accumulatedFees > 0

  const handleClaim = async () => {
    if (!hasFees) return
    if (isEvm) {
      try {
        await claimFeesEvm(agentId)
        onClose()
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['agents-by-owner', evmAddress] })
        }, 3000)
      } catch (err) {
        console.error('Claim fees error:', err)
      }
      return
    }
    if (isSolana) {
      if (!coinType) return
      try {
        await claimFeesSolana({ agentId, tokenMint: coinType })
        onClose()
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['agents-by-owner', solanaPublicKey?.toBase58()],
          })
        }, 3000)
      } catch (err) {
        console.error('Claim fees error:', err)
      }
      return
    }
    claimFeesSui(agentId, agentObjectId, coinType, () => {
      onClose()
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', account?.address] })
      }, 3000)
    })
  }

  return (
    <AgentUpdateDialog
      open={open}
      onClose={onClose}
      title="Claim Accumulated Fees"
      isLoading={isLoading}
      onConfirm={handleClaim}
      confirmText="Claim Fees"
      isConfirmDisabled={isLoading || !hasFees}
    >
      <div className="flex flex-col items-center justify-center space-y-1.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] py-4">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Available to Claim
        </span>
        <div className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
          <TokenAmount rawAmount={accumulatedFees} token={token} precision={4} iconSize={16} />
        </div>
      </div>

      {!hasFees && (
        <p className="mt-2 text-center text-sm text-[var(--color-danger)]">
          There are no fees available to claim at this time.
        </p>
      )}

      <p className="px-2 text-center text-[10px] text-[var(--color-text-faint)] sm:px-4 sm:text-xs">
        These fees are collected from attackers who pay to interact with your agent.
      </p>
    </AgentUpdateDialog>
  )
}
