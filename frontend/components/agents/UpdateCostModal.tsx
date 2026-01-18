import { useState } from 'react'
import { useUpdateAgent } from '@/hooks/agents/useUpdateAgent'
import { AgentUpdateDialog } from './AgentUpdateDialog'

interface UpdateCostModalProps {
  open: boolean
  onClose: () => void
  agentId: string
  agentObjectId: string
  currentCost?: number
}

export const UpdateCostModal = ({
  open,
  onClose,
  agentId,
  agentObjectId,
  currentCost = 0,
}: UpdateCostModalProps) => {
  const initialCost = currentCost ? currentCost : 0

  const [cost, setCost] = useState(initialCost.toString())
  const { updateCost, isLoading } = useUpdateAgent()

  const handleUpdate = () => {
    const costNum = parseFloat(cost)
    if (isNaN(costNum) || costNum < 0) return
    updateCost(agentId, agentObjectId, costNum, onClose)
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
      <label className="mb-2 block text-sm font-medium text-gray-700">Fee per Message (SUI)</label>
      <input
        type="number"
        value={cost}
        onChange={e => setCost(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:ring-1 focus:ring-black"
        placeholder="0.00"
        min="0"
        step="0.01"
      />
      <p className="mt-2 text-xs text-gray-500">
        This is the amount attackers must pay to send one message to your agent.
      </p>
    </AgentUpdateDialog>
  )
}
