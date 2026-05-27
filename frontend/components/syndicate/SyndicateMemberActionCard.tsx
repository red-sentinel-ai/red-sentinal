interface Props {
  title: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export function SyndicateMemberActionCard({ title, icon, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group border border-[var(--color-border-strong)] p-5 text-left transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="mb-4 block text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-primary)]">
        {icon}
      </span>
      <p className="text-sm font-medium uppercase text-[var(--color-text-primary)]">{title}</p>
    </button>
  )
}
