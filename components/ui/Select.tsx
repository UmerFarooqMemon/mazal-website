"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
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
  const { getColor } = useTheme();
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
          className={`block text-[11px] font-medium mb-1.5 text-start`}
          style={{ color: getColor("secondaryText") }}
        >
          {label}
        </label>
      )}

      {/* Custom Select */}
      <div ref={ref} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full rounded-xl border bg-white py-3 px-4 text-sm flex items-center justify-between cursor-pointer transition-all duration-200 ${error ? "border-red-300" : ""} text-start`}
          style={{
            borderColor: isOpen
              ? getColor("primary")
              : error
                ? undefined
                : getColor("border"),
            color: selectedOption
              ? getColor("primaryText")
              : getColor("mutedText"),
            boxShadow: isOpen
              ? `0 0 0 3px ${getColor("primary")}20`
              : undefined,
          }}
        >
          <span>{displayText}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={1.5}
            style={{ color: getColor("mutedText") }}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={`absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg overflow-hidden start-0`}
            style={{
              borderColor: getColor("border"),
              borderWidth: "1px",
            }}
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
                  className={`w-full px-4 py-2.5 text-sm transition-colors duration-100 ${option.key === value ? "font-medium" : ""} text-start`}
                  style={{
                    backgroundColor:
                      option.key === value
                        ? `${getColor("primary")}15`
                        : "transparent",
                    color:
                      option.key === value
                        ? getColor("primary")
                        : getColor("primaryText"),
                  }}
                  onMouseEnter={(e) => {
                    if (option.key !== value) {
                      e.currentTarget.style.backgroundColor = `${getColor("primary")}08`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (option.key !== value) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
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
          className={`text-[10px] mt-1.5 text-start`}
          style={{ color: getColor("mutedText") }}
        >
          {hint}
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          className={`text-[10px] mt-1.5 text-start`}
          style={{ color: getColor("error") }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
