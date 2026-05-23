import Link from 'next/link'
import { Plus } from 'lucide-react'

export function ForgeCard() {
  return (
    <Link
      href="/defend?mode=syndicate"
      className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-gold-primary)] hover:shadow-[0_0_15px_rgba(200,56,79,0.15)]"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[var(--color-border-default)] transition-colors group-hover:border-[var(--color-gold-primary)]">
        <Plus className="h-8 w-8 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-gold-primary)]" />
      </div>
      <h3 className="text-xl font-semibold leading-8 tracking-tight text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-gold-primary)]">
        Forge Syndicate
      </h3>
      <p className="mt-2 max-w-[200px] text-base leading-6 text-[var(--color-text-secondary)]">
        Establish your own collective and define security parameters.
      </p>
    </Link>
  )
}
