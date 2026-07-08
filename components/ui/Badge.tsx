"use client";

import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap";

    const variants = {
      default: "bg-gray-100 text-gray-600",
      primary: "bg-[#0A3B9E]/10 text-[#0A3B9E]",
      success: "bg-green-100 text-green-700",
      warning: "bg-[#D4AF37]/10 text-[#D4AF37]",
      danger: "bg-red-100 text-red-700",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
export default Badge;
