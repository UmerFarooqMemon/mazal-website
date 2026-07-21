"use client";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount } from "@/components/ui";
import { generateCertificatePDF } from "@/lib/pdf-generator";

export default function CertificatePreview() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, getGradient } = useTheme();
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
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
      >
        <div className={isRTL ? "text-right" : "text-left"}>
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

      {/* Certificate Card */}
      <div
        id="certificate-preview"
        className="rounded-2xl shadow-[0_8px_30px_rgba(10,59,158,0.08)] overflow-hidden relative w-full"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
          borderWidth: "1px",
        }}
      >
        {/* Header */}
        <div
          className={`text-white px-6 md:px-8 py-5 md:py-6 flex flex-col sm:flex-row justify-between items-center gap-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          style={{ background: getGradient("primary") }}
        >
          <div
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className="font-bold text-lg w-10 h-10 rounded flex items-center justify-center"
              style={{
                backgroundColor: getColor("accent"),
                color: getColor("secondary"),
              }}
            >
              M
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className="font-bold text-base md:text-lg text-white">
                {t("certificates.platform_name") || "Mazal Platform"}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/70">
                {t("certificates.licensed_escrow")}
              </div>
            </div>
          </div>
          <div className={isRTL ? "text-left" : "text-right"}>
            <div className="uppercase tracking-wider text-white/50 text-[10px]">
              {t("certificates.certificate")}
            </div>
            <div className="font-mono text-[10px] text-white/80">
              MZL-VAL-55K8-2026
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 text-center">
          <div
            className="text-[10px] uppercase tracking-wider mb-2"
            style={{ color: getColor("mutedText") }}
          >
            {t("certificates.official")}
          </div>
          <h3
            className="text-3xl md:text-4xl font-serif font-bold mb-1"
            style={{ color: getColor("primaryText") }}
          >
            {t("certificates.plate_certificate")}
          </h3>
          <p
            className="text-sm mb-6 md:mb-8"
            style={{ color: getColor("secondaryText") }}
          >
            {t("certificates.issued_info") ||
              "Issued 01 July 2026 · Valid 90 days · Purpose: Insurance"}
          </p>

          {/* Plate Image */}
          <div className="mb-6 md:mb-10 inline-block w-full max-w-75">
            <img
              src="/plate-empty.png"
              alt={t("certificates.plate_design") || "Plate Design"}
              className="w-full h-auto object-contain block"
              crossOrigin="anonymous"
            />
          </div>

          {/* Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-10">
            <div
              className="rounded-xl p-3 md:p-4"
              style={{ backgroundColor: getColor("primaryLight") }}
            >
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: getColor("secondaryText") }}
              >
                {t("certificates.market_low")}
              </div>
              <div
                className="text-lg md:text-xl font-bold"
                style={{ color: getColor("primaryText") }}
              >
                <DirhamAmount amount={545_600} weight="bold" />
              </div>
            </div>
            <div
              className="rounded-xl p-3 md:p-4"
              style={{
                backgroundColor: getColor("primaryLight"),
                borderColor: `${getColor("primary")}20`,
                borderWidth: "1px",
              }}
            >
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: getColor("primary") }}
              >
                {t("certificates.assessed_value")}
              </div>
              <div
                className="text-lg md:text-2xl font-bold"
                style={{ color: getColor("primary") }}
              >
                <DirhamAmount amount={620_000} weight="bold" />
              </div>
            </div>
            <div
              className="rounded-xl p-3 md:p-4"
              style={{ backgroundColor: getColor("primaryLight") }}
            >
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: getColor("secondaryText") }}
              >
                {t("certificates.market_high")}
              </div>
              <div
                className="text-lg md:text-xl font-bold"
                style={{ color: getColor("primaryText") }}
              >
                <DirhamAmount amount={706_800} weight="bold" />
              </div>
            </div>
          </div>

          {/* Info Columns */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 border-t pt-6 md:pt-8 mb-6 md:mb-8 ${isRTL ? "text-right" : "text-left"}`}
            style={{ borderColor: getColor("border") }}
          >
            <div>
              <div
                className="text-[10px] uppercase tracking-wider mb-2"
                style={{ color: getColor("secondaryText") }}
              >
                {t("certificates.methodology")}
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: getColor("secondaryText") }}
              >
                {t("certificates.methodology_desc") ||
                  "Assessment triangulates 90-day comparable sales, active listings, and closed auction data from Mazal's escrow ledger."}
              </p>
            </div>
            <div>
              <div
                className="text-[10px] uppercase tracking-wider mb-2"
                style={{ color: getColor("secondaryText") }}
              >
                {t("certificates.comparable_sales")}
              </div>
              <div
                className="text-xs space-y-1"
                style={{ color: getColor("secondaryText") }}
              >
                <div
                  className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>
                    {t("certificates.sale_1") || "Dubai · similar pattern"}
                  </span>
                  <span><DirhamAmount amount={582_800} /></span>
                </div>
                <div
                  className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>
                    {t("certificates.sale_2") || "Dubai · same digit count"}
                  </span>
                  <span><DirhamAmount amount={657_200} /></span>
                </div>
                <div
                  className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>
                    {t("certificates.sale_3") || "Dubai · adjacent code"}
                  </span>
                  <span><DirhamAmount amount={607_800} /></span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-6 border-t pt-6 mb-6 md:mb-8 ${isRTL ? "text-right" : "text-left"}`}
            style={{ borderColor: getColor("border") }}
          >
            <div>
              <div
                className="font-serif italic text-lg md:text-xl"
                style={{ color: getColor("primary") }}
              >
                A. Al Marri
              </div>
              <div
                className="text-xs"
                style={{ color: getColor("secondaryText") }}
              >
                {t("certificates.signatory_1") || "Head of Valuations · Mazal"}
              </div>
            </div>
            <div>
              <div
                className="font-serif italic text-lg md:text-xl"
                style={{ color: getColor("primary") }}
              >
                R. Suleiman
              </div>
              <div
                className="text-xs"
                style={{ color: getColor("secondaryText") }}
              >
                {t("certificates.signatory_2") || "Senior Analyst · Mazal"}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`rounded-b-2xl pt-5 md:pt-6 pb-5 md:pb-6 px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs -mx-6 md:-mx-10 -mb-6 md:-mb-10 mt-6 md:mt-10 ${isRTL ? "sm:flex-row-reverse" : ""}`}
            style={{
              backgroundColor: getColor("primaryLight"),
              borderColor: getColor("border"),
              borderTopWidth: "1px",
            }}
          >
            <div
              className={`flex flex-col sm:flex-row items-center gap-3 ${isRTL ? "sm:flex-row-reverse text-right" : "text-left"}`}
            >
              <img
                src="/mazal-certified.png"
                alt={t("certificates.certified") || "Mazal Certified"}
                className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0"
                crossOrigin="anonymous"
              />
              <div
                className="leading-relaxed"
                style={{ color: getColor("secondaryText") }}
              >
                {t("certificates.verify_text") || "Verify authenticity at"}{" "}
                <span
                  className="underline"
                  style={{ color: getColor("primary") }}
                >
                  mazal.ae/verify
                </span>{" "}
                {t("certificates.using_certificate") ||
                  "using certificate number"}{" "}
                MZL-VAL-55K8-2026.
              </div>
            </div>
            <div
              className="w-10 h-10 rounded shrink-0"
              style={{
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
                borderWidth: "1px",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
