import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export const CustomDropdown = ({
  label,
  subLabel,
  options,
  selected,
  onSelect,
}: {
  label: string;
  subLabel: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex-1 min-w-[200px]" ref={dropdownRef}>
      <label className="text-[18px] font-medium text-black block">
        {label}
      </label>
      <p className="text-[14px] text-[#5E5E5E] mb-2">{subLabel}</p>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-[55px] px-4 bg-white border border-[#5E5E5E] rounded-xl flex items-center justify-between hover:border-black transition-colors"
        >
          <div className="flex items-center gap-2">
            {label === "Select service" && (
              <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
            )}
            <span className="font-medium">{selected}</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {label === "Select service" && (
                    <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                  )}
                  <span>{option}</span>
                </div>
                {selected === option && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
