import { useQueryClient } from '@tanstack/react-query'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useUpdateAgent } from '@/hooks/agents/useUpdateAgent'
import { AgentUpdateDialog } from './AgentUpdateDialog'
import { getTokenForCoinType } from '@/constants'
import { TokenAmount } from '../ui/common/TokenAmount'

interface ClaimFeesModalProps {
  open: boolean
  onClose: () => void
  agentId: string
  agentObjectId: string
  accumulatedFees: number
  coinType?: string
}

export const ClaimFeesModal = ({
  open,
  onClose,
  agentId,
  agentObjectId,
  accumulatedFees,
  coinType,
}: ClaimFeesModalProps) => {
  const { claimFees, isLoading } = useUpdateAgent()
  const queryClient = useQueryClient()
  const account = useCurrentAccount()

  const token = getTokenForCoinType(coinType)
  const hasFees = accumulatedFees > 0

  const handleClaim = () => {
    if (!hasFees) return
    claimFees(agentId, agentObjectId, coinType, () => {
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
      <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-gray-100 bg-gray-50 py-4 sm:py-6">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 sm:text-sm">
          Available to Claim
        </span>
        <div className="text-2xl font-extrabold tracking-tight text-black sm:text-4xl">
          <TokenAmount rawAmount={accumulatedFees} token={token} precision={4} iconSize={24} />
        </div>
      </div>

      {!hasFees && (
        <p className="mt-2 text-center text-sm text-red-500">
          There are no fees available to claim at this time.
        </p>
      )}

      <p className="px-2 text-center text-[10px] text-gray-400 sm:px-4 sm:text-xs">
        These fees are collected from attackers who pay to interact with your agent.
      </p>
    </AgentUpdateDialog>
  )
}
