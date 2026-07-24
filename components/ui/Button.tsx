"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const { locale } = useLocale();
    const isRTL = locale === "ar";
    const { getColor, getGradient } = useTheme();

    const borderColor = getColor("border");
    const outlineBorder =
      !borderColor ||
      borderColor === "transparent" ||
      borderColor.startsWith("rgba(0, 0, 0, 0)")
        ? "#D9DEE6"
        : borderColor;

    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const Spinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const displayLeftIcon = isRTL ? rightIcon : leftIcon;
    const displayRightIcon = isRTL ? leftIcon : rightIcon;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{
          ...(variant === "primary" && {
            background: getGradient("primaryButton"),
            color: "#FFFFFF",
          }),
          ...(variant === "secondary" && {
            background: getGradient("secondaryButton"),
            color: "#FFFFFF",
          }),
          ...(variant === "outline" && {
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: outlineBorder,
            color: getColor("primaryText") || "#081123",
          }),
          ...(variant === "gold" && {
            backgroundColor: getColor("accent"),
            color: getColor("primary"),
          }),
          ...(variant === "danger" && {
            backgroundColor: getColor("error"),
            color: "#FFFFFF",
          }),
          ...style,
        }}
        className={`
          ${baseStyles}
          ${variant === "outline" ? "border border-solid bg-white" : ""}
          ${size === "sm" ? "px-4 py-1.5 text-xs" : ""}
          ${size === "md" ? "px-6 py-2.5 text-sm" : ""}
          ${size === "lg" ? "px-8 py-3.5 text-base" : ""}
          ${size === "icon" ? "h-10 w-10 p-0" : ""}
          ${fullWidth ? "w-full" : ""}
          ${isRTL ? "flex-row-reverse" : ""}
          ${className}
        `}
        {...props}
      >
        {loading ? <Spinner /> : displayLeftIcon}
        {children}
        {!loading && displayRightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
