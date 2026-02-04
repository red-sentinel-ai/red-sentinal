import { ReactNode } from 'react'
import { Dialog } from '@/components/Dialog'
import { Loader2, X } from 'lucide-react'

interface AgentUpdateDialogProps {
  open: boolean
  onClose: () => void
  title: string
  isLoading: boolean
  onConfirm: () => void
  confirmText: string
  isConfirmDisabled: boolean
  children: ReactNode
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
    <Dialog open={open} onClose={onClose} className="p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="size-5 sm:size-6" />
          </button>
        </div>

        <div>{children}</div>

        <button
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          className="btn btn-black flex w-full items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmText}
        </button>
      </div>
    </Dialog>
  )
}
