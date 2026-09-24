import { Loader2 } from 'lucide-react'

interface Props {
  onClick: () => void
  loading: boolean
  disabled?: boolean
  children: React.ReactNode
}

export function ActionSubmitButton({ onClick, loading, disabled, children }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="flex h-11 w-full items-center justify-center gap-2 bg-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
