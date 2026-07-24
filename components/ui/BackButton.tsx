"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Button from "./Button";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function BackButton({
  href,
  onClick,
  children,
  className = "",
  size = "md",
}: BackButtonProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const Icon = isRTL ? ArrowRight : ArrowLeft;
  const label = children ?? t("common.back") ?? "Back";

  const borderColor = getColor("border");
  const outlineBorder =
    !borderColor ||
    borderColor === "transparent" ||
    borderColor.startsWith("rgba(0, 0, 0, 0)")
      ? "#D9DEE6"
      : borderColor;

  const sizeClass =
    size === "sm"
      ? "px-4 py-1.5 text-xs"
      : size === "lg"
        ? "px-8 py-3.5 text-base"
        : "px-6 py-2.5 text-sm";

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-2 font-semibold rounded-full border border-solid bg-white transition-all duration-200 active:scale-[0.98] ${sizeClass} ${isRTL ? "flex-row-reverse" : ""} ${className}`}
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: outlineBorder,
          color: getColor("primaryText") || "#081123",
        }}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      leftIcon={<Icon className="w-4 h-4" />}
      className={className}
    >
      {label}
    </Button>
  );
}
