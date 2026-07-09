"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { useLocale } from "@/context/LocaleContext";

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
      ...props
    },
    ref,
  ) => {
    const { locale } = useLocale();
    const isRTL = locale === "ar";

    // Base button styles
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3B9E] active:scale-[0.98]";

    // Variants with the new Gradient for 'primary'
    const variants: Record<string, string> = {
      // Exact gradient match: Dark Navy #041443 to Royal Blue #0A3B9E
      primary:
        "bg-gradient-to-r from-[#041443] via-[#0A3B9E] to-[#0A3B9E] text-white hover:shadow-md active:shadow-lg",
      secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      outline:
        "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-400",
      ghost:
        "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-[#0A3B9E]",
      gold: "bg-[#D4AF37] text-[#041443] hover:bg-[#c5a031] shadow-md hover:shadow-lg",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    };

    // Size variants
    const sizes: Record<string, string> = {
      sm: "px-4 py-1.5 text-xs",
      md: "px-6 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-base",
      icon: "h-10 w-10 p-0",
    };

    // Loading spinner SVG
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

    // Swap icons automatically for RTL
    const displayLeftIcon = isRTL ? rightIcon : leftIcon;
    const displayRightIcon = isRTL ? leftIcon : rightIcon;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
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
