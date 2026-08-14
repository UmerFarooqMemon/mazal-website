"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function WalletDialog({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = "max-w-[520px]",
}: WalletDialogProps) {
  const { getColor } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-start sm:items-center justify-center overflow-y-auto p-4 sm:p-6 bg-black/30 backdrop-blur-[6px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${maxWidth} my-auto rounded-[24px] shadow-[0_40px_90px_-30px_rgba(6,32,25,0.45)] p-6 sm:p-7`}
        style={{ backgroundColor: getColor("surface") }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="size-11 rounded-[14px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: getColor("primaryLight"), color: getColor("primary") }}
          >
            {icon}
          </div>
          <h2
            className="flex-1 min-w-0 font-serif text-[26px] leading-tight tracking-tight truncate"
            style={{ color: getColor("primaryText") }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-10 rounded-[12px] flex items-center justify-center shrink-0 transition-colors hover:bg-gray-100"
            style={{ backgroundColor: getColor("primaryLight"), color: getColor("primaryText") }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}
