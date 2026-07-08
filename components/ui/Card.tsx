"use client";

import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles = "rounded-2xl overflow-hidden";

    const variants = {
      default: "bg-white border border-gray-200 shadow-sm",
      elevated:
        "bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
      flat: "bg-[#F3F4F8] border border-gray-200",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
export default Card;
