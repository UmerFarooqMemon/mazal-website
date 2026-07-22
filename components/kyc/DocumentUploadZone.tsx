"use client";

import { useRef } from "react";
import { FileCheck2, Upload, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import type { KycDocumentKey } from "@/components/kyc/types";

interface DocumentUploadZoneProps {
  docKey: KycDocumentKey;
  title: string;
  hint: string;
  file?: File | null;
  onChange: (key: KycDocumentKey, file: File | null) => void;
}

export default function DocumentUploadZone({
  docKey,
  title,
  hint,
  file,
  onChange,
}: DocumentUploadZoneProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`relative flex flex-col items-center justify-center gap-2 min-h-[140px] rounded-2xl border border-dashed px-4 py-6 cursor-pointer transition-all duration-200 hover:opacity-90 ${isRTL ? "text-right" : "text-center"}`}
      style={{
        borderColor: file ? getColor("primary") : getColor("border"),
        backgroundColor: file
          ? `${getColor("primary")}08`
          : getColor("surface"),
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0] || null;
          onChange(docKey, next);
          e.target.value = "";
        }}
      />

      {file ? (
        <FileCheck2
          className="w-6 h-6"
          style={{ color: getColor("primary") }}
        />
      ) : (
        <Upload className="w-6 h-6" style={{ color: getColor("primary") }} />
      )}

      <div>
        <p
          className="text-sm font-medium"
          style={{ color: getColor("primaryText") }}
        >
          {title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: getColor("secondaryText") }}>
          {file ? file.name : hint}
        </p>
      </div>

      {file && (
        <button
          type="button"
          aria-label={t("kyc.remove_file")}
          onClick={(e) => {
            e.stopPropagation();
            onChange(docKey, null);
          }}
          className="absolute top-3 end-3 p-1 rounded-full"
          style={{
            backgroundColor: getColor("primaryLight"),
            color: getColor("secondaryText"),
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
