"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { getColor } = useTheme();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[6px] transition-opacity duration-300">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={`w-full ${sizeClasses[size]} rounded-[24px] shadow-[0_40px_90px_-30px_rgba(6,32,25,0.45)] overflow-hidden`}
        style={{
          backgroundColor: getColor("surface") || "#ffffff",
          border: `1px solid ${getColor("border") || "#E8E4DC"}`,
        }}
      >
        {title && (
          <div
            className="flex items-center justify-between px-6 pt-6 pb-4"
            style={{ borderBottom: `1px solid ${getColor("border") || "#E8E4DC"}` }}
          >
            <h3
              className="text-lg font-serif font-bold"
              style={{ color: getColor("primaryText") }}
            >
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="size-10 rounded-[12px] flex items-center justify-center transition-colors"
              style={{
                backgroundColor: getColor("primaryLight"),
                color: getColor("primaryText"),
              }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="px-6 py-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
