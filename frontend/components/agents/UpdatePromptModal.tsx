import { useState } from "react";
import { useUpdateAgent } from "@/hooks/agents/useUpdateAgent";
import { SYSTEM_PROMPT_MAX_TOKENS } from "@/constants";
import { useTokenCount } from "@/hooks/useTokenCount";
import { AgentUpdateDialog } from "./AgentUpdateDialog";

interface UpdatePromptModalProps {
  open: boolean;
  onClose: () => void;
  agentId: string;
  agentObjectId: string;
  currentPrompt?: string;
}

export const UpdatePromptModal = ({
  open,
  onClose,
  agentId,
  agentObjectId,
  currentPrompt = "",
}: UpdatePromptModalProps) => {
  const [prompt, setPrompt] = useState(currentPrompt);
  const { updatePrompt, isLoading } = useUpdateAgent();
  const { tokenCount, countTokens } = useTokenCount();

  const handleUpdate = () => {
    if (tokenCount > SYSTEM_PROMPT_MAX_TOKENS) return;
    updatePrompt(agentId, agentObjectId, prompt, onClose);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    countTokens(e.target.value);
  };

  const isInvalid = !prompt.trim() || tokenCount > SYSTEM_PROMPT_MAX_TOKENS;

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
      <label className="block text-sm font-medium mb-2 text-gray-700">
        System Prompt
      </label>
      <textarea
        value={prompt}
        onChange={handleChange}
        className="w-full bg-white border border-gray-300 rounded-xl p-4 min-h-[200px] focus:ring-1 focus:ring-black outline-none resize-none"
        placeholder="Enter new instructions..."
      />
      <div className="flex justify-between mt-2 text-xs">
        <span
          className={
            tokenCount > SYSTEM_PROMPT_MAX_TOKENS
              ? "text-red-500"
              : "text-gray-500"
          }
        >
          {tokenCount} / {SYSTEM_PROMPT_MAX_TOKENS} Tokens
        </span>
      </div>
    </AgentUpdateDialog>
  );
};
