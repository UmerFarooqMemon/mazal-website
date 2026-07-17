"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PlateWithOverlay from "@/components/ui/PlateWithOverlay";

export type PlatePreviewConfig = {
  background_image_url?: string;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  overlays?: {
    plate_code?: Record<string, unknown>;
    plate_digits?: Record<string, unknown>;
  };
};

export type CertificateDisplayData = {
  certificateNumber: string;
  plateCode: string;
  plateDigits: string;
  assessedValue: number;
  marketLow: number;
  marketHigh: number;
  issuedLabel: string;
  methodology?: string;
  comparableSales?: { label: string; amount: string }[];
  signatory1Name?: string;
  signatory1Title?: string;
  signatory2Name?: string;
  signatory2Title?: string;
  showPreviewBadge?: boolean;
  emirate?: string;
  emirateLabel?: string;
  plateType?: string;
  plateVariant?: string;
  plateDesign?: string;
  holderName?: string;
  /** Variant preview from /api/number-plates/options — drives PlateWithOverlay */
  platePreview?: PlatePreviewConfig | null;
};

function formatAed(value: number) {
  return `AED ${value.toLocaleString("en-AE")}`;
}

export const SAMPLE_CERTIFICATE: CertificateDisplayData = {
  certificateNumber: "MZL-VAL-55K0-2026",
  plateCode: "M",
  plateDigits: "777",
  assessedValue: 620000,
  marketLow: 545600,
  marketHigh: 706800,
  issuedLabel: "Issued 01 July 2026 · Valid 90 days",
  signatory1Name: "Abdullah Almeer",
  signatory2Name: "Ahmed Al Nasser",
  showPreviewBadge: true,
};

type Props = {
  data?: CertificateDisplayData;
  className?: string;
};

export default function VerifiedCertificateCard({
  data = SAMPLE_CERTIFICATE,
  className = "",
}: Props) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, getGradient } = useTheme();

  const sales =
    data.comparableSales ||
    [
      {
        label: t("certificates.sale_1") || "Dubai · similar pattern",
        amount: "AED 582,800",
      },
      {
        label: t("certificates.sale_2") || "Dubai · same digit count",
        amount: "AED 657,200",
      },
      {
        label: t("certificates.sale_3") || "Dubai · adjacent code",
        amount: "AED 607,600",
      },
    ];

  return (
    <div
      className={`relative w-full rounded-xl md:rounded-2xl overflow-hidden border-2 shadow-[0_12px_30px_-10px_rgba(1,15,81,0.35)] md:shadow-[0_30px_60px_-25px_rgba(1,15,81,0.35)] ${className}`}
      style={{
        backgroundColor: "#FBFAF7",
        borderColor: "rgba(10,47,148,0.2)",
      }}
    >
      {data.showPreviewBadge && (
        <div className="absolute -top-1.5 -right-1.5 z-10 rotate-6">
          <div
            className="px-2 py-0.5 rounded text-[10px] md:text-[11px] font-medium uppercase tracking-[0.08em] text-white"
            style={{ background: getGradient("primary") }}
          >
            {t("certificates.preview_badge") || "PREVIEW"}
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 md:px-10 md:py-6 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ background: getGradient("primary") }}
      >
        <div
          className={`flex items-center gap-2 md:gap-3 min-w-0 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div
            className="shrink-0 size-[18px] md:size-11 rounded-[3px] md:rounded-md flex items-center justify-center font-serif font-bold text-[10px] md:text-2xl"
            style={{
              backgroundColor: getColor("accent") || "#E0AE57",
              color: "#2B1500",
            }}
          >
            M
          </div>
          <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="font-serif text-[10px] md:text-2xl text-[#FBFAF6] leading-tight tracking-tight truncate">
              {t("certificates.platform_name") || "Mazal Platform"}
            </div>
            <div className="text-[5px] md:text-[11px] uppercase tracking-[0.18em] text-[#FBFAF6]/80 leading-tight">
              {t("certificates.licensed_escrow")}
            </div>
          </div>
        </div>
        <div
          className={`shrink-0 ${isRTL ? "text-left" : "text-right"}`}
        >
          <div className="text-[5px] md:text-[11px] uppercase tracking-[0.18em] text-[#FBFAF6]/80">
            {t("certificates.certificate")}
          </div>
          <div className="font-mono text-[6px] md:text-sm text-[#FBFAF6]">
            {data.certificateNumber}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-5 md:p-10 flex flex-col gap-6 md:gap-8">
        <div className="text-center">
          <div
            className="text-[5px] md:text-[11px] uppercase tracking-[0.3em] mb-0.5"
            style={{ color: getColor("mutedText") || "#545E6F" }}
          >
            {t("certificates.official")}
          </div>
          <h3
            className="font-serif text-[15px] md:text-4xl tracking-tight leading-tight"
            style={{ color: getColor("primaryText") || "#081123" }}
          >
            {t("certificates.plate_certificate")}
          </h3>
          <p
            className="text-[6px] md:text-sm mt-1"
            style={{ color: getColor("mutedText") || "#545E6F" }}
          >
            {data.issuedLabel}
          </p>
        </div>

        {/* Plate — same PlateWithOverlay as certificates/request live preview */}
        <div className="relative mx-auto w-full max-w-[340px] md:max-w-[440px]">
          {data.platePreview?.background_image_url ? (
            <div
              style={{
                marginTop: "-8%",
                marginBottom: "-8%",
                overflow: "hidden",
                mixBlendMode: "multiply",
              }}
            >
              <PlateWithOverlay
                plate_code={
                  !data.plateCode || data.plateCode === "—"
                    ? ""
                    : data.plateCode
                }
                plate_digits={
                  !data.plateDigits || data.plateDigits === "—"
                    ? ""
                    : data.plateDigits
                }
                emirate={data.emirateLabel || data.emirate || "DUBAI"}
                preview={data.platePreview as any}
                isRTL={isRTL}
              />
            </div>
          ) : (
            <div className="relative w-full aspect-[748/180]">
              <img
                src="/plate-empty.png"
                alt={t("certificates.plate_preview") || "Plate"}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div
                className={`absolute inset-0 flex items-center justify-between px-[8%] ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <span
                  className="font-serif font-bold text-[28px] sm:text-[36px] md:text-[48px] tracking-wide leading-none"
                  style={{ color: getColor("primaryText") || "#081123" }}
                >
                  {data.plateCode}
                </span>
                <span className="flex-1" aria-hidden />
                <span
                  className="font-serif font-bold text-[28px] sm:text-[36px] md:text-[48px] tracking-wide leading-none"
                  style={{ color: getColor("primaryText") || "#081123" }}
                >
                  {data.plateDigits}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Values */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-4">
          <div
            className="rounded-md md:rounded-xl border px-1.5 py-2 md:p-4 text-center"
            style={{
              backgroundColor: "rgba(234,239,247,0.4)",
              borderColor: getColor("border") || "#D9DEE6",
            }}
          >
            <div
              className="text-[5px] md:text-[10px] uppercase tracking-wide mb-0.5"
              style={{ color: getColor("mutedText") || "#545E6F" }}
            >
              {t("certificates.market_low")}
            </div>
            <div
              className="font-serif text-[8px] md:text-xl tracking-tight"
              style={{ color: getColor("primaryText") || "#081123" }}
            >
              {formatAed(data.marketLow)}
            </div>
          </div>
          <div
            className="rounded-md md:rounded-xl border px-1.5 py-2 md:p-4 text-center"
            style={{
              backgroundColor: "rgba(10,47,148,0.05)",
              borderColor: "rgba(10,47,148,0.3)",
            }}
          >
            <div
              className="text-[5px] md:text-[10px] uppercase tracking-wide mb-0.5"
              style={{ color: getColor("mutedText") || "#545E6F" }}
            >
              {t("certificates.assessed_value")}
            </div>
            <div
              className="font-serif font-semibold text-[10px] md:text-2xl tracking-tight"
              style={{ color: getColor("primary") || "#0A2F94" }}
            >
              {formatAed(data.assessedValue)}
            </div>
          </div>
          <div
            className="rounded-md md:rounded-xl border px-1.5 py-2 md:p-4 text-center"
            style={{
              backgroundColor: "rgba(234,239,247,0.4)",
              borderColor: getColor("border") || "#D9DEE6",
            }}
          >
            <div
              className="text-[5px] md:text-[10px] uppercase tracking-wide mb-0.5"
              style={{ color: getColor("mutedText") || "#545E6F" }}
            >
              {t("certificates.market_high")}
            </div>
            <div
              className="font-serif text-[8px] md:text-xl tracking-tight"
              style={{ color: getColor("primaryText") || "#081123" }}
            >
              {formatAed(data.marketHigh)}
            </div>
          </div>
        </div>

        {/* Methodology + Sales */}
        <div
          className={`grid grid-cols-2 gap-3 md:gap-8 ${isRTL ? "text-right" : "text-left"}`}
        >
          <div>
            <div
              className="text-[5px] md:text-[10px] uppercase tracking-wide mb-1 md:mb-2"
              style={{ color: getColor("mutedText") || "#545E6F" }}
            >
              {t("certificates.methodology")}
            </div>
            <p
              className="text-[6px] md:text-xs leading-relaxed"
              style={{ color: "rgba(8,17,35,0.8)" }}
            >
              {data.methodology ||
                t("certificates.methodology_desc") ||
                "Assessment triangulates 90-day comparable sales, active listings, and closed auction data from Mazal's escrow ledger."}
            </p>
          </div>
          <div>
            <div
              className="text-[5px] md:text-[10px] uppercase tracking-wide mb-1 md:mb-2"
              style={{ color: getColor("mutedText") || "#545E6F" }}
            >
              {t("certificates.comparable_sales")}
            </div>
            <div className="space-y-1">
              {sales.map((sale) => (
                <div
                  key={sale.label}
                  className={`flex justify-between gap-2 text-[6px] md:text-xs ${isRTL ? "flex-row-reverse" : ""}`}
                  style={{ color: "rgba(8,17,35,0.8)" }}
                >
                  <span className="min-w-0 truncate">{sale.label}</span>
                  <span className="shrink-0">{sale.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div
          className={`grid grid-cols-2 gap-4 md:gap-10 ${isRTL ? "text-right" : "text-left"}`}
        >
          <div>
            <div
              className="font-serif italic text-[10px] md:text-xl tracking-tight"
              style={{ color: getColor("primary") || "#0A2F94" }}
            >
              {data.signatory1Name ||
                t("certificates.signatory_1_name") ||
                "Abdullah Almeer"}
            </div>
            <div
              className="h-px w-full my-1"
              style={{ backgroundColor: getColor("border") || "#D9DEE6" }}
            />
            <div
              className="text-[5px] md:text-xs"
              style={{ color: getColor("mutedText") || "#545E6F" }}
            >
              {data.signatory1Title ||
                t("certificates.signatory_1") ||
                "Head of Valuations · Mazal"}
            </div>
          </div>
          <div>
            <div
              className="font-serif italic text-[10px] md:text-xl tracking-tight"
              style={{ color: getColor("primary") || "#0A2F94" }}
            >
              {data.signatory2Name ||
                t("certificates.signatory_2_name") ||
                "Ahmed Al Nasser"}
            </div>
            <div
              className="h-px w-full my-1"
              style={{ backgroundColor: getColor("border") || "#D9DEE6" }}
            />
            <div
              className="text-[5px] md:text-xs"
              style={{ color: getColor("mutedText") || "#545E6F" }}
            >
              {data.signatory2Title ||
                t("certificates.signatory_2") ||
                "Senior Analyst · Mazal"}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 md:px-10 md:py-4 border-t ${isRTL ? "flex-row-reverse" : ""}`}
        style={{
          backgroundColor: "rgba(234,239,247,0.4)",
          borderColor: getColor("border") || "#D9DEE6",
        }}
      >
        <div
          className={`flex items-center gap-2 md:gap-3 min-w-0 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
        >
          <img
            src="/mazal-certified.png"
            alt={t("certificates.certified") || "Mazal Certified"}
            className="size-7 md:size-12 object-contain shrink-0"
          />
          <p
            className="text-[5px] md:text-xs leading-relaxed"
            style={{ color: getColor("mutedText") || "#545E6F" }}
          >
            {t("certificates.verify_text") || "Verify authenticity at"}{" "}
            <span style={{ color: getColor("primary") || "#0A2F94" }}>
              mazal.cloud/verify
            </span>{" "}
            {t("certificates.using_certificate") ||
              "using certificate number"}{" "}
            <span className="font-medium">{data.certificateNumber}</span>.
          </p>
        </div>
        <div
          className="size-7 md:size-12 rounded shrink-0 border"
          style={{
            borderColor: getColor("border") || "#D9DEE6",
            backgroundColor: getColor("surface") || "#fff",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
