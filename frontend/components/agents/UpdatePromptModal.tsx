import { useState } from 'react'
import { useUpdateAgent } from '@/hooks/agents/useUpdateAgent'
import { useUpdateAgentSolana } from '@/hooks/agents/useUpdateAgentSolana'
import { SYSTEM_PROMPT_MAX_TOKENS } from '@/constants'
import { useTokenCount } from '@/hooks/useTokenCount'
import { AgentUpdateDialog } from './AgentUpdateDialog'
import { isEvmChain, type SupportedChain } from '@/constants/chains'

interface UpdatePromptModalProps {
  open: boolean
  onClose: () => void
  agentId: string
  agentObjectId: string
  currentPrompt?: string
  coinType?: string
  chain?: SupportedChain
}

export const UpdatePromptModal = ({
  open,
  onClose,
  agentId,
  agentObjectId,
  currentPrompt = '',
  coinType,
  chain = 'sui',
}: UpdatePromptModalProps) => {
  const [prompt, setPrompt] = useState(currentPrompt)
  const { updatePrompt: updatePromptSui, isLoading: isSuiLoading } = useUpdateAgent()
  const { updatePrompt: updatePromptSolana, isLoading: isSolanaLoading } = useUpdateAgentSolana()
  const { tokenCount, countTokens } = useTokenCount()

  const isSolana = chain === 'solana'
  const isEvm = isEvmChain(chain)
  const isLoading = isSolana ? isSolanaLoading : isSuiLoading

  const handleUpdate = () => {
    if (isEvm || tokenCount > SYSTEM_PROMPT_MAX_TOKENS) return
    if (isSolana) {
      updatePromptSolana(agentId, prompt, onClose)
    } else {
      updatePromptSui(agentId, agentObjectId, prompt, coinType, onClose)
    }
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
      isConfirmDisabled={isLoading || isInvalid || isEvm}
    >
      {isEvm ? (
        <p className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-4 text-center text-sm text-[var(--color-text-muted)]">
          Prompt updates are not supported for BNB Chain agents.
        </p>
      ) : (
        <>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">System Prompt</label>
          <textarea
            value={prompt}
            onChange={handleChange}
            className="min-h-[200px] w-full resize-none rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-faint)] focus:ring-1 focus:ring-[var(--color-gold-primary)]"
            placeholder="Enter new instructions..."
          />
          <div className="mt-2 flex justify-between text-xs">
            <span className={tokenCount > SYSTEM_PROMPT_MAX_TOKENS ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}>
              {tokenCount} / {SYSTEM_PROMPT_MAX_TOKENS} Tokens
            </span>
          </div>
        </>
      )}
    </AgentUpdateDialog>
  )
}
