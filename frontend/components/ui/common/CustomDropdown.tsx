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
      <label className="font-display block text-[18px] font-medium text-on-surface">{label}</label>
      <p className="mb-2 text-[14px] text-on-surface-variant">{subLabel}</p>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-[55px] w-full items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest px-4 transition-colors hover:border-outline text-on-surface"
        >
          <div className="flex items-center gap-2">
            {label === 'Select service' && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-outline-variant">
                <div className="h-3 w-3 rounded-full bg-primary/60"></div>
              </div>
            )}
            <span className="font-medium">{selected}</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-ambient">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option)
                  setIsOpen(false)
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-on-surface hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-2">
                  {label === 'Select service' && (
                    <div className="h-4 w-4 rounded-full border border-outline-variant"></div>
                  )}
                  <span>{option}</span>
                </div>
                {selected === option && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
