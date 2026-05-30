interface Props {
  title: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  description?: string
  badge?: string
}

export function SyndicateMemberActionCard({
  title,
  icon,
  onClick,
  disabled,
  description,
  badge,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col border border-[var(--color-border-strong)] p-5 text-left transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="mb-4 flex items-center justify-between text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-primary)]">
        {icon}
        {badge && (
          <span className="text-xs font-bold tabular-nums text-[var(--color-gold-primary)]">
            {badge}
          </span>
        )}
      </span>
      <p className="text-sm font-medium uppercase text-[var(--color-text-primary)]">{title}</p>
      {description && (
        <p className="mt-1 text-xs normal-case text-[var(--color-text-muted)]">{description}</p>
      )}
    </button>
  )
}
