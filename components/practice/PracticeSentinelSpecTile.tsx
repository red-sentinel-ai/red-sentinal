'use client'

interface PracticeSentinelSpecTileProps {
  label: string
  value: string
}

export function PracticeSentinelSpecTile({ label, value }: PracticeSentinelSpecTileProps) {
  return (
    <div className="bg-[var(--color-bg-base)] p-3">
      <span className="industrial-header mb-1 block text-[9px] text-[var(--color-text-muted)]">
        {label}
      </span>
      <span className="industrial-header block break-words text-[11px] text-white">{value}</span>
    </div>
  )
}
