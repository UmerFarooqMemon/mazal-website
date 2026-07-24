"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import type { PlatePreviewConfig } from "@/lib/plate-preview";

export type { PlatePreviewConfig } from "@/lib/plate-preview";

export type CertificateDisplayData = {
  certificateNumber: string;
  plateCode: string;
  plateDigits: string;
  assessedValue: number;
  marketLow: number;
  marketHigh: number;
  issuedLabel: string;
  issuedAt?: string;
  expiresAt?: string;
  methodology?: string;
  comparableSales?: { label: string; amount: number }[];
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

function formatIssuedLabel(data: CertificateDisplayData, locale: string) {
  if (!data.issuedAt) return data.issuedLabel;

  const issued = new Date(data.issuedAt);
  if (Number.isNaN(issued.getTime())) return data.issuedLabel;

  const date = issued.toLocaleDateString(
    locale === "ar" ? "ar-AE" : "en-GB",
    { day: "2-digit", month: "long", year: "numeric" },
  );

  if (!data.expiresAt) {
    return locale === "ar" ? `صدرت ${date}` : `Issued ${date}`;
  }

  const expires = new Date(data.expiresAt);
  if (Number.isNaN(expires.getTime())) return data.issuedLabel;

  const days = Math.max(
    0,
    Math.round(
      (expires.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  return locale === "ar"
    ? `صدرت ${date} · صالحة لمدة ${days.toLocaleString("ar-AE")} يومًا`
    : `Issued ${date} · Valid ${days} days`;
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
        amount: 582_800,
      },
      {
        label: t("certificates.sale_2") || "Dubai · same digit count",
        amount: 657_200,
      },
      {
        label: t("certificates.sale_3") || "Dubai · adjacent code",
        amount: 607_600,
      },
    ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative w-full ${
        data.showPreviewBadge
          ? isRTL
            ? "pt-3 pl-4 md:pt-3.5 md:pl-5"
            : "pt-3 pr-4 md:pt-3.5 md:pr-5"
          : ""
      } ${className}`}
    >
      <div className="relative">
        {data.showPreviewBadge && (
          <div
            className={`absolute z-20 pointer-events-none ${
              isRTL
                ? "-top-[8px] -left-[12px] md:-top-[10px] md:-left-[16px] -rotate-[10deg]"
                : "-top-[8px] -right-[12px] md:-top-[10px] md:-right-[16px] rotate-[10deg]"
            }`}
          >
            <div
              className="px-2.5 py-0.5 md:px-3 md:py-1 rounded-[6px] text-[9px] md:text-[11px] font-semibold uppercase tracking-[0.08em] text-white"
              style={{
                background: getGradient("primary"),
                boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
              }}
            >
              {t("certificates.preview_badge") || "PREVIEW"}
            </div>
          </div>
        )}

        <div
          className="relative w-full rounded-xl md:rounded-2xl overflow-hidden border-2 shadow-[0_12px_30px_-10px_rgba(1,15,81,0.35)] md:shadow-[0_30px_60px_-25px_rgba(1,15,81,0.35)]"
          style={{
            backgroundColor: "#FBFAF7",
            borderColor: "rgba(10,47,148,0.2)",
          }}
        >
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
            {formatIssuedLabel(data, locale)}
          </p>
        </div>

        {/* Plate — same PlateWithOverlay as certificates/request live preview */}
        <div className="relative mx-auto w-full max-w-[340px] md:max-w-[440px]">
          <NumberPlateDisplay
            plate_code={
              !data.plateCode || data.plateCode === "—" ? "" : data.plateCode
            }
            plate_digits={
              !data.plateDigits || data.plateDigits === "—"
                ? ""
                : data.plateDigits
            }
            emirate={data.emirateLabel || data.emirate || "DUBAI"}
            preview={data.platePreview}
            plateType={data.plateType}
            plateDesign={data.plateDesign}
            crop="certificate"
          />
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
              <DirhamAmount amount={data.marketLow} weight="bold" />
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
              <DirhamAmount amount={data.assessedValue} weight="bold" />
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
              <DirhamAmount amount={data.marketHigh} weight="bold" />
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
                  <span className="shrink-0">
                    <DirhamAmount amount={sale.amount} />
                  </span>
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
        className={`flex items-center gap-3 px-4 py-3 md:px-10 md:py-4 border-t ${isRTL ? "flex-row-reverse" : ""}`}
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
      </div>
        </div>
      </div>
    </div>
  );
}
