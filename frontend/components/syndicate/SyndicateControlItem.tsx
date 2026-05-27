interface Props {
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export function SyndicateControlItem({ title, subtitle, icon, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-between border border-[var(--color-border-strong)] p-5 text-left transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div>
        <p className="text-sm font-medium uppercase text-[var(--color-text-primary)]">{title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>
      </div>
      <span className="text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-primary)]">
        {icon}
      </span>
    </button>
  )
}
