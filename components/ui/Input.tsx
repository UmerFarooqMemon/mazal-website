"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { useLocale } from "@/context/LocaleContext";

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
    const inputId = id || props.name || Math.random().toString(36).slice(2);

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-xs font-semibold text-gray-500 mb-2 ${isRTL ? "text-right" : "text-left"}`}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative w-full">
          {/* Left Icon (English) / Right Icon (Arabic) */}
          {icon && (
            <div
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}
            >
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200
              ${
                error
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 focus:border-[#0A3B9E] focus:ring-[#0A3B9E]/20"
              }
              focus:outline-none focus:ring-2
              disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50
              ${icon && isRTL ? "pr-10" : icon ? "pl-10" : ""}
              ${rightIcon && isRTL ? "pl-10" : rightIcon ? "pr-10" : ""}
              ${isRTL ? "text-right pr-4" : "text-left pl-4"}
              py-2.5
              ${className}`}
            {...props}
          />

          {/* Right Icon (English) / Left Icon (Arabic) */}
          {rightIcon && (
            <div
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-gray-400`}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Hint Text */}
        {hint && !error && (
          <p
            className={`text-[10px] text-gray-400 mt-1.5 ${isRTL ? "text-right" : "text-left"}`}
          >
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            className={`text-[10px] text-red-500 mt-1.5 ${isRTL ? "text-right" : "text-left"}`}
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
