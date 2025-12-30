import { useUpdateAgent } from "@/hooks/agents/useUpdateAgent";
import { AgentUpdateDialog } from "./AgentUpdateDialog";
import { MIST_PER_SUI } from "@/constants";

interface ClaimFeesModalProps {
  open: boolean;
  onClose: () => void;
  agentId: string;
  agentObjectId: string;
  accumulatedFees: number;
}

export const ClaimFeesModal = ({
  open,
  onClose,
  agentId,
  agentObjectId,
  accumulatedFees,
}: ClaimFeesModalProps) => {
  const { claimFees, isLoading } = useUpdateAgent();

  const feesInSui = accumulatedFees / Number(MIST_PER_SUI);
  const hasFees = accumulatedFees > 0;

  const handleClaim = () => {
    if (!hasFees) return;
    claimFees(agentId, agentObjectId, onClose);
  };

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
      <div className="flex flex-col items-center justify-center py-6 space-y-2 bg-gray-50 rounded-xl border border-gray-100">
        <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">
          Available to Claim
        </span>
        <div className="text-4xl font-extrabold text-black tracking-tight">
          {feesInSui.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}
          <span className="text-lg text-gray-400 ml-1">SUI</span>
        </div>
      </div>

      {!hasFees && (
        <p className="text-center text-sm text-red-500 mt-2">
          There are no fees available to claim at this time.
        </p>
      )}

      <p className="text-xs text-gray-400 text-center px-4">
        These fees are collected from attackers who pay to interact with your
        agent.
      </p>
    </AgentUpdateDialog>
  );
};
