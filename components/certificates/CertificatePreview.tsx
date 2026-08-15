"use client";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import { generateCertificatePDF } from "@/lib/pdf-generator";
import VerifiedCertificateCard, {
  SAMPLE_CERTIFICATE,
} from "@/components/certificates/VerifiedCertificateCard";

export default function CertificatePreview() {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await generateCertificatePDF();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div className="text-start">
          <div
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ color: getColor("primary") }}
          >
            {t("certificates.live_preview")}
          </div>
          <h2
            className="text-3xl md:text-4xl font-serif font-bold"
            style={{ color: getColor("primaryText") }}
          >
            {t("certificates.preview_title")}
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={handleDownload}
          disabled={isDownloading}
          style={{ borderColor: getColor("border") }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {isDownloading
            ? t("common.loading")
            : t("certificates.download_sample")}
        </Button>
      </div>

      <VerifiedCertificateCard
        data={{ ...SAMPLE_CERTIFICATE, showPreviewBadge: true }}
      />
    </div>
  );
}
