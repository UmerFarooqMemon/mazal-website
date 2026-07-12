"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: { key: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function Select({
  label,
  error,
  hint,
  options,
  value,
  onChange,
  placeholder,
}: SelectProps) {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.key === value);
  const displayText = selectedOption?.label || placeholder || "Select...";

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          className={`block text-[11px] font-medium text-gray-500 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
        >
          {label}
        </label>
      )}

      {/* Custom Select */}
      <div ref={ref} className="relative">
        {/* Trigger Button - Looks like an input */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full rounded-xl border bg-white py-3 px-4 text-sm flex items-center justify-between cursor-pointer transition-all duration-200
            ${isOpen ? "border-[#0A3B9E] ring-2 ring-[#0A3B9E]/20" : "border-gray-200 hover:border-[#0A3B9E]/30"}
            ${error ? "border-red-300" : ""}
            ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
        >
          <span className={selectedOption ? "text-gray-700" : "text-gray-400"}>
            {displayText}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={`absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden ${isRTL ? "right-0" : "left-0"}`}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    onChange?.(option.key);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm transition-colors duration-100 hover:bg-[#0A3B9E]/5
                    ${option.key === value ? "bg-[#0A3B9E]/10 text-[#0A3B9E] font-medium" : "text-gray-700 hover:text-[#041443]"}
                    ${isRTL ? "text-right" : "text-left"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {hint && !error && (
        <p
          className={`text-[10px] text-gray-400 mt-1.5 ${isRTL ? "text-right" : "text-left"}`}
        >
          {hint}
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          className={`text-[10px] text-red-500 mt-1.5 ${isRTL ? "text-right" : "text-left"}`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
