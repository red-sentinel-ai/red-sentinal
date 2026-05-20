import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export const CustomDropdown = ({
  label,
  subLabel,
  options,
  selected,
  onSelect,
}: {
  label: string
  subLabel: string
  options: string[]
  selected: string
  onSelect: (val: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-w-[200px] flex-1" ref={dropdownRef}>
      <label className="block text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>
      <p className="mb-1.5 mt-0.5 text-xs text-[var(--color-text-muted)]">{subLabel}</p>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-full items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-sm text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-gold-primary)]"
        >
          <div className="flex items-center gap-2">
            {label === 'Select service' && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border-default)]">
                <div className="h-3 w-3 rounded-full bg-[var(--color-text-muted)]"></div>
              </div>
            )}
            <span className="font-medium">{selected}</span>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform text-[var(--color-text-muted)] ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-lg">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option)
                  setIsOpen(false)
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
              >
                <div className="flex items-center gap-2">
                  {label === 'Select service' && (
                    <div className="h-4 w-4 rounded-full border border-[var(--color-border-default)]"></div>
                  )}
                  <span>{option}</span>
                </div>
                {selected === option && <Check className="h-4 w-4 text-[var(--color-success)]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
