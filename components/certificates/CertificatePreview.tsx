"use client";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";
import { generateCertificatePDF } from "@/lib/pdf-generator";

export default function CertificatePreview() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
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
          <div className="text-[#0A3B9E] text-xs font-bold uppercase tracking-wider mb-1">
            {t("certificates.live_preview")}
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#041443]">
            {t("certificates.preview_title")}
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-200 shrink-0"
          onClick={handleDownload}
          disabled={isDownloading}
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
          {isDownloading ? "Downloading..." : t("certificates.download_sample")}
        </Button>
      </div>

      {/* Certificate Card - Added ID for PDF capture */}
      <div
        id="certificate-preview"
        className="bg-white border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgba(10,59,158,0.08)] overflow-hidden relative w-full"
      >
        {/* Blue Header */}
        <div
          className={`bg-linear-to-r from-[#031D5B] via-[#0943A1] to-[#0943A1] text-white px-6 md:px-8 py-5 md:py-6 flex flex-col sm:flex-row justify-between items-center gap-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}
        >
          <div
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className="bg-[#D4AF37] text-[#041443] font-bold text-lg w-10 h-10 rounded flex items-center justify-center">
              M
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className="font-bold text-base md:text-lg">
                Mazal Platform
              </div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider">
                {t("certificates.licensed_escrow")}
              </div>
            </div>
          </div>
          <div className={isRTL ? "text-left" : "text-right"}>
            <div className="uppercase tracking-wider text-gray-300 text-[10px]">
              {t("certificates.certificate")}
            </div>
            <div className="font-mono text-[10px]">MZL-VAL-55K8-2026</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 text-center">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">
            {t("certificates.official")}
          </div>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#041443] mb-1">
            {t("certificates.plate_certificate")}
          </h3>
          <p className="text-sm text-gray-500 mb-6 md:mb-8">
            Issued 01 July 2026 · Valid 90 days · Purpose: Insurance
          </p>

          {/* Plate Image */}
          <div className="mb-6 md:mb-10 inline-block w-full max-w-75">
            <img
              src="/plate-empty.png"
              alt="Plate Design"
              className="w-full h-auto object-contain block"
              crossOrigin="anonymous"
            />
          </div>

          {/* Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="bg-[#F3F4F8] rounded-xl p-3 md:p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                {t("certificates.market_low")}
              </div>
              <div className="text-lg md:text-xl font-bold text-[#041443]">
                AED 545,600
              </div>
            </div>
            <div className="bg-[#EEF2F8] border border-[#0A3B9E]/20 rounded-xl p-3 md:p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#0A3B9E]">
                {t("certificates.assessed_value")}
              </div>
              <div className="text-lg md:text-2xl font-bold text-[#0A3B9E]">
                AED 620,000
              </div>
            </div>
            <div className="bg-[#F3F4F8] rounded-xl p-3 md:p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                {t("certificates.market_high")}
              </div>
              <div className="text-lg md:text-xl font-bold text-[#041443]">
                AED 706,800
              </div>
            </div>
          </div>

          {/* Info Columns */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 border-t border-gray-100 pt-6 md:pt-8 mb-6 md:mb-8 ${isRTL ? "text-right" : "text-left"}`}
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                {t("certificates.methodology")}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Assessment triangulates 90-day comparable sales, active
                listings, and closed auction data from Mazal's escrow ledger.
              </p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                {t("certificates.comparable_sales")}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div
                  className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>Dubai · similar pattern</span>
                  <span>AED 582,800</span>
                </div>
                <div
                  className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>Dubai · same digit count</span>
                  <span>AED 657,200</span>
                </div>
                <div
                  className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>Dubai · adjacent code</span>
                  <span>AED 607,800</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6 mb-6 md:mb-8 ${isRTL ? "text-right" : "text-left"}`}
          >
            <div>
              <div className="font-serif italic text-lg md:text-xl text-[#0A3B9E]">
                A. Al Marri
              </div>
              <div className="text-xs text-gray-500">
                Head of Valuations · Mazal
              </div>
            </div>
            <div>
              <div className="font-serif italic text-lg md:text-xl text-[#0A3B9E]">
                R. Suleiman
              </div>
              <div className="text-xs text-gray-500">
                Senior Analyst · Mazal
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`bg-[#F4F7FC] border-t border-gray-100 rounded-b-2xl pt-5 md:pt-6 pb-5 md:pb-6 px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 -mx-6 md:-mx-10 -mb-6 md:-mb-10 mt-6 md:mt-10 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            <div
              className={`flex flex-col sm:flex-row items-center gap-3 ${isRTL ? "sm:flex-row-reverse text-right" : "text-left"}`}
            >
              <img
                src="/mazal-certified.png"
                alt="Mazal Certified"
                className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0"
                crossOrigin="anonymous"
              />
              <div className="leading-relaxed">
                Verify authenticity at{" "}
                <span className="text-[#0A3B9E] underline">
                  mazal.ae/verify
                </span>{" "}
                using certificate number MZL-VAL-55K8-2026.
              </div>
            </div>
            <div className="w-10 h-10 bg-white border border-gray-200 rounded shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
