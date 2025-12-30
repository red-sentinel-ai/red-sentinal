import { useState } from "react";
import { Dialog } from "@/components/Dialog";
import { Loader2, X } from "lucide-react";
import { useUpdateAgent } from "@/hooks/agents/useUpdateAgent";
import { SYSTEM_PROMPT_MAX_TOKENS } from "@/constants";
import { useTokenCount } from "@/hooks/useTokenCount";

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

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Update Instructions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div>
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
        </div>

        <button
          onClick={handleUpdate}
          disabled={
            isLoading || !prompt.trim() || tokenCount > SYSTEM_PROMPT_MAX_TOKENS
          }
          className="w-full btn btn-black flex justify-center items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Update Prompt
        </button>
      </div>
    </Dialog>
  );
};

interface UpdateCostModalProps {
  open: boolean;
  onClose: () => void;
  agentId: string;
  agentObjectId: string;
  currentCost?: number;
}

export const UpdateCostModal = ({
  open,
  onClose,
  agentId,
  agentObjectId,
  currentCost = 0,
}: UpdateCostModalProps) => {
  const [cost, setCost] = useState(currentCost.toString());
  const { updateCost, isLoading } = useUpdateAgent();

  const handleUpdate = () => {
    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum < 0) return;
    updateCost(agentId, agentObjectId, costNum, onClose);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Update Attack Fee</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Fee per Message (SUI)
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:ring-1 focus:ring-black outline-none"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <p className="text-xs text-gray-500 mt-2">
            This is the amount attackers must pay to send one message to your
            agent.
          </p>
        </div>

        <button
          onClick={handleUpdate}
          disabled={isLoading || !cost}
          className="w-full btn btn-black flex justify-center items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Update Fee
        </button>
      </div>
    </Dialog>
  );
};
