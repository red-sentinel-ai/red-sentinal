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
      <label className="block text-[18px] font-medium text-black">{label}</label>
      <p className="mb-2 text-[14px] text-[#5E5E5E]">{subLabel}</p>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-[55px] w-full items-center justify-between rounded-xl border border-[#5E5E5E] bg-white px-4 transition-colors hover:border-black"
        >
          <div className="flex items-center gap-2">
            {label === 'Select service' && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-400">
                <div className="h-3 w-3 rounded-full bg-gray-600"></div>
              </div>
            )}
            <span className="font-medium">{selected}</span>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option)
                  setIsOpen(false)
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  {label === 'Select service' && (
                    <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                  )}
                  <span>{option}</span>
                </div>
                {selected === option && <Check className="h-4 w-4 text-green-500" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
