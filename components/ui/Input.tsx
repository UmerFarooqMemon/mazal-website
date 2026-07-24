"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: React.ReactNode;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      icon,
      rightIcon,
      label,
      error,
      hint,
      id,
      type,
      ...props
    },
    ref,
  ) => {
    const { locale } = useLocale();
    const isRTL = locale === "ar";
    const { getColor } = useTheme();
    const generatedId = useId();
    const inputId = id || props.name || generatedId;
    const isDateOrTime = type === "date" || type === "time";

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
            type={type}
            className={`w-full rounded-xl border bg-white py-3.5 text-sm placeholder:text-gray-400 transition-all duration-200 
              ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "focus:ring-2"}
              focus:outline-none
              disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100
              ${icon ? (isRTL ? "pr-10" : "pl-10") : isRTL ? "pr-4" : "pl-4"}
              ${rightIcon ? (isRTL ? "pl-10" : "pr-10") : isRTL ? "pl-4" : "pr-4"}
              ${isRTL ? "text-right" : "text-left"}
              ${isDateOrTime ? "[&::-webkit-calendar-picker-indicator]:me-0.5 [&::-webkit-calendar-picker-indicator]:cursor-pointer" : ""}
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
