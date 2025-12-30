import { ReactNode } from "react";
import { Dialog } from "@/components/Dialog";
import { Loader2, X } from "lucide-react";

interface AgentUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  isLoading: boolean;
  onConfirm: () => void;
  confirmText: string;
  isConfirmDisabled: boolean;
  children: ReactNode;
}

export const AgentUpdateDialog = ({
  open,
  onClose,
  title,
  isLoading,
  onConfirm,
  confirmText,
  isConfirmDisabled,
  children,
}: AgentUpdateDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div>{children}</div>

        <button
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          className="w-full btn btn-black flex justify-center items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {confirmText}
        </button>
      </div>
    </Dialog>
  );
};
