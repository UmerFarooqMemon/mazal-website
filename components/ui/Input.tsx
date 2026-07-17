"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className = "", icon, rightIcon, label, error, hint, id, ...props },
    ref,
  ) => {
    const { locale } = useLocale();
    const isRTL = locale === "ar";
    const { getColor } = useTheme();
    const inputId = id || props.name || Math.random().toString(36).slice(2);

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-[11px] font-medium leading-none mb-2 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative w-full">
          {/* Left / Right Icon */}
          {icon && (
            <div
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center`}
              style={{ color: getColor("mutedText") }}
            >
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-white py-3.5 text-sm placeholder:text-gray-400 transition-all duration-200 
              ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "focus:ring-2"}
              focus:outline-none
              disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100
              ${icon && isRTL ? "pr-10" : icon ? "pl-10" : ""}
              ${rightIcon && isRTL ? "pl-10" : rightIcon ? "pr-10" : ""}
              ${isRTL ? "text-right pr-4" : "text-left pl-4"}
              ${className}`}
            style={{
              borderColor: error ? undefined : getColor("border"),
              color: getColor("primaryText"),
            }}
            {...props}
          />

          {/* Right / Left Icon */}
          {rightIcon && (
            <div
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}
              style={{ color: getColor("mutedText") }}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Hint Text */}
        {hint && !error && (
          <p
            className={`text-[10px] mt-1.5 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("mutedText") }}
          >
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            className={`text-[10px] mt-1.5 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("error") }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
