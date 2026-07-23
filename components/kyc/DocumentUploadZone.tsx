"use client";

import { useRef } from "react";
import { FileCheck2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import {
  isAllowedKycFile,
  isWithinKycFileSize,
  KYC_MAX_FILE_SIZE_KB,
  type KycDocumentKey,
} from "@/components/kyc/types";

interface DocumentUploadZoneProps {
  docKey: KycDocumentKey;
  title: string;
  hint: string;
  file?: File | null;
  uploadedLabel?: string | null;
  required?: boolean;
  error?: string;
  onChange: (key: KycDocumentKey, file: File | null) => void;
}

export default function DocumentUploadZone({
  docKey,
  title,
  hint,
  file,
  uploadedLabel,
  required = false,
  error,
  onChange,
}: DocumentUploadZoneProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFile = Boolean(file || uploadedLabel);

  const handleSelect = (next: File | null) => {
    if (!next) {
      onChange(docKey, null);
      return;
    }

    if (!isAllowedKycFile(next)) {
      toast.error(t("kyc.invalid_file_type"));
      return;
    }

    if (!isWithinKycFileSize(next)) {
      toast.error(
        t("kyc.file_too_large").replace("{size}", String(KYC_MAX_FILE_SIZE_KB)),
      );
      return;
    }

    onChange(docKey, next);
  };

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
        borderColor: error
          ? getColor("error")
          : hasFile
            ? getColor("primary")
            : getColor("border"),
        backgroundColor: hasFile
          ? `${getColor("primary")}08`
          : getColor("surface"),
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0] || null;
          handleSelect(next);
          e.target.value = "";
        }}
      />

      {hasFile ? (
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
          {required ? " *" : ""}
        </p>
        <p className="text-xs mt-0.5" style={{ color: getColor("secondaryText") }}>
          {file?.name || uploadedLabel || hint}
        </p>
        {error && (
          <p className="text-[10px] mt-1.5" style={{ color: getColor("error") }}>
            {error}
          </p>
        )}
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
