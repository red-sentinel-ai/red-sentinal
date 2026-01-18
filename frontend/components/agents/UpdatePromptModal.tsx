import { useState } from 'react'
import { useUpdateAgent } from '@/hooks/agents/useUpdateAgent'
import { SYSTEM_PROMPT_MAX_TOKENS } from '@/constants'
import { useTokenCount } from '@/hooks/useTokenCount'
import { AgentUpdateDialog } from './AgentUpdateDialog'

interface UpdatePromptModalProps {
  open: boolean
  onClose: () => void
  agentId: string
  agentObjectId: string
  currentPrompt?: string
}

export const UpdatePromptModal = ({
  open,
  onClose,
  agentId,
  agentObjectId,
  currentPrompt = '',
}: UpdatePromptModalProps) => {
  const [prompt, setPrompt] = useState(currentPrompt)
  const { updatePrompt, isLoading } = useUpdateAgent()
  const { tokenCount, countTokens } = useTokenCount()

  const handleUpdate = () => {
    if (tokenCount > SYSTEM_PROMPT_MAX_TOKENS) return
    updatePrompt(agentId, agentObjectId, prompt, onClose)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    countTokens(e.target.value)
  }

  const isInvalid = !prompt.trim() || tokenCount > SYSTEM_PROMPT_MAX_TOKENS

  return (
    <AgentUpdateDialog
      open={open}
      onClose={onClose}
      title="Update Instructions"
      isLoading={isLoading}
      onConfirm={handleUpdate}
      confirmText="Update Prompt"
      isConfirmDisabled={isLoading || isInvalid}
    >
      <label className="mb-2 block text-sm font-medium text-gray-700">System Prompt</label>
      <textarea
        value={prompt}
        onChange={handleChange}
        className="min-h-[200px] w-full resize-none rounded-xl border border-gray-300 bg-white p-4 outline-none focus:ring-1 focus:ring-black"
        placeholder="Enter new instructions..."
      />
      <div className="mt-2 flex justify-between text-xs">
        <span className={tokenCount > SYSTEM_PROMPT_MAX_TOKENS ? 'text-red-500' : 'text-gray-500'}>
          {tokenCount} / {SYSTEM_PROMPT_MAX_TOKENS} Tokens
        </span>
      </div>
    </AgentUpdateDialog>
  )
}
