import { useState } from 'react'
import { useUpdateAgentSui } from '@/hooks/agents/useUpdateAgentSui'
import { useUpdateAgentSolana } from '@/hooks/agents/useUpdateAgentSolana'
import { useUpdateAgentEVM } from '@/hooks/agents/useUpdateAgentEVM'
import { AgentUpdateDialog } from './AgentUpdateDialog'
import { getTokenForCoinType } from '@/constants/tokens'
import { isEvmChain, type SupportedChain } from '@/constants/chains'

interface UpdateCostModalProps {
  open: boolean
  onClose: () => void
  agentId: string
  agentObjectId: string
  currentCost?: number
  coinType?: string
  chain?: SupportedChain
}

export const UpdateCostModal = ({
  open,
  onClose,
  agentId,
  agentObjectId,
  currentCost = 0,
  coinType,
  chain = 'sui',
}: UpdateCostModalProps) => {
  const initialCost = currentCost ? currentCost : 0

  const [cost, setCost] = useState(initialCost.toString())
  const { updateCost: updateCostSui, isLoading: isSuiLoading } = useUpdateAgentSui()
  const { updateCost: updateCostSolana, isLoading: isSolanaLoading } = useUpdateAgentSolana()
  const { updateCost: updateCostEvm, isLoading: isEvmLoading } = useUpdateAgentEVM()
  const token = getTokenForCoinType(coinType, chain)

  const isSolana = chain === 'solana'
  const isEvm = isEvmChain(chain)
  const isLoading = isEvm ? isEvmLoading : isSolana ? isSolanaLoading : isSuiLoading

  const handleUpdate = () => {
    const costNum = parseFloat(cost)
    if (isNaN(costNum) || costNum < 0) return
    if (isEvm) {
      const costInBaseUnits = BigInt(Math.floor(costNum * Math.pow(10, token.decimals)))
      updateCostEvm(agentId, costInBaseUnits, onClose)
    } else if (isSolana) {
      const costInBaseUnits = BigInt(Math.floor(costNum * Math.pow(10, token.decimals)))
      updateCostSolana(agentId, costInBaseUnits, onClose)
    } else {
      updateCostSui(agentId, agentObjectId, costNum, coinType, onClose)
    }
  }

  return (
    <AgentUpdateDialog
      open={open}
      onClose={onClose}
      title="Update Attack Fee"
      isLoading={isLoading}
      onConfirm={handleUpdate}
      confirmText="Update Fee"
      isConfirmDisabled={isLoading || !cost}
    >
      <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">Fee per Message ({token.symbol})</label>
      <input
        type="number"
        value={cost}
        onChange={e => setCost(e.target.value)}
        className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-faint)] focus:ring-1 focus:ring-[var(--color-gold-primary)]"
        placeholder="0.00"
        min="0"
        step="0.01"
      />
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        This is the amount attackers must pay to send one message to your agent.
      </p>
    </AgentUpdateDialog>
  )
}
