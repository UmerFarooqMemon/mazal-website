"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
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
  plateTypeLabel?: string;
  plateVariant?: string;
  plateDesign?: string;
  holderName?: string;
  trafficFileNumber?: string;
  platePreview?: PlatePreviewConfig | null;
  /** Sample preview: hide real assessed figures. */
  maskAssessedValue?: boolean;
};

function dash(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function formatIssueDate(issuedAt: string | undefined, locale: string) {
  if (!issuedAt) return "—";
  const issued = new Date(issuedAt);
  if (Number.isNaN(issued.getTime())) return "—";
  return issued.toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number, locale: string) {
  if (!Number.isFinite(amount) || amount <= 0) return "—";
  return amount.toLocaleString(locale === "ar" ? "ar-AE" : "en-US");
}

function formatAssessedRange(
  data: CertificateDisplayData,
  locale: string,
) {
  const low = formatAmount(data.marketLow, locale);
  const high = formatAmount(data.marketHigh, locale);
  if (low !== "—" && high !== "—") return `${low} – ${high}`;
  if (low !== "—") return low;
  if (high !== "—") return high;
  return formatAmount(data.assessedValue, locale);
}

export const SAMPLE_CERTIFICATE: CertificateDisplayData = {
  certificateNumber: "MZL-26-K7H2-9QMX4P",
  plateCode: "M",
  plateDigits: "777",
  assessedValue: 620000,
  marketLow: 545600,
  marketHigh: 706800,
  issuedLabel: "Issued 01 July 2026 · Valid 90 days",
  issuedAt: "2026-07-01T00:00:00.000Z",
  signatory1Name: "Abdullah Almeer",
  signatory2Name: "Ahmed Al Nasser",
  showPreviewBadge: true,
  emirate: "DUBAI",
  emirateLabel: "Dubai",
  plateType: "private",
  plateTypeLabel: "Private",
  holderName: "Ahmed Al Nasser",
  trafficFileNumber: "—",
  maskAssessedValue: true,
};

type Props = {
  data?: CertificateDisplayData;
  className?: string;
};

function GradientRule({
  from,
  to,
  className = "",
}: {
  from: string;
  to: string;
  className?: string;
}) {
  return (
    <div
      className={`h-[2px] w-full ${className}`}
      style={{
        background: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`,
      }}
    />
  );
}

export default function VerifiedCertificateCard({
  data = SAMPLE_CERTIFICATE,
  className = "",
}: Props) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { branding } = useTheme();
  const [contact, setContact] = useState({
    phone: "—",
    email: "—",
    website: "—",
  });

  const primary = "#52bb78";
  const secondary = "#162e2c";
  const logoSrc = branding.logoUrl || branding.smallLogoUrl;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/site-settings");
        const json = await res.json();
        const phone = json?.data?.contact?.phone?.trim() || "—";
        const email = json?.data?.contact?.email?.trim() || "—";
        const rawWebsite =
          json?.data?.contact?.website?.trim() ||
          json?.data?.contact_website?.trim() ||
          "";
        const isLocal =
          /^localhost(:\d+)?$/i.test(rawWebsite) ||
          /^https?:\/\/localhost(:\d+)?/i.test(rawWebsite);
        const website = !rawWebsite || isLocal ? "—" : rawWebsite;
        if (!cancelled) setContact({ phone, email, website });
      } catch {
        /* keep placeholders */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const verifyUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/${locale}/verify?code=${encodeURIComponent(data.certificateNumber)}`;
  }, [data.certificateNumber, locale]);

  const qrSrc = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(verifyUrl)}`
    : "";

  const issueDate = formatIssueDate(data.issuedAt, locale);
  const assessed = data.maskAssessedValue
    ? "xxxxxx – xxxxxx"
    : formatAssessedRange(data, locale);
  const ownerName = dash(data.holderName);
  const traffic = dash(data.trafficFileNumber);
  const emirate = dash(data.emirateLabel || data.emirate);
  const plateCode = dash(data.plateCode === "—" ? "" : data.plateCode);
  const plateDigitsMasked = data.maskAssessedValue
    ? (data.plateDigits || "").replace(/[0-9]/g, "x")
    : data.plateDigits;
  const plateNumber = dash(
    !plateDigitsMasked || plateDigitsMasked === "—" ? "" : plateDigitsMasked,
  );
  const plateCategory = dash(data.plateTypeLabel || data.plateType);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`relative w-full ${className}`}>
      <div className="relative">
        <div
          id="certificate-preview"
          className="relative w-full rounded-xl md:rounded-2xl overflow-hidden border-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)] md:shadow-[0_30px_60px_-25px_rgba(0,0,0,0.5)]"
          style={{
            backgroundColor: "#000000",
            borderColor: "rgba(82,187,120,0.35)",
            color: "#ffffff",
          }}
        >
          <div className="px-5 py-6 md:px-10 md:py-8">
            <h3
              className="text-center text-base md:text-xl font-bold uppercase tracking-[0.28em] mb-5 md:mb-6"
              style={{ color: primary }}
            >
              {t("certificates.valuation_certificate_title") ||
                "Valuation Certificate"}
            </h3>

            <div className="flex justify-center mb-2">
              <div
                className="inline-block p-1.5"
                style={{
                  border: `2px solid ${primary}`,
                  backgroundColor: "#0a0a0a",
                }}
              >
                <div className="w-[240px] sm:w-[320px] md:w-[454px] max-w-full">
                  <NumberPlateDisplay
                    plate_code={
                      !data.plateCode || data.plateCode === "—"
                        ? ""
                        : data.plateCode
                    }
                    plate_digits={
                      !plateDigitsMasked || plateDigitsMasked === "—"
                        ? ""
                        : plateDigitsMasked
                    }
                    emirate={data.emirateLabel || data.emirate || "DUBAI"}
                    preview={data.platePreview}
                    plateType={data.plateType}
                    plateDesign={data.plateDesign}
                    crop="certificate"
                  />
                </div>
              </div>
            </div>

            <div
              className="text-center text-[11px] md:text-[13px] font-bold uppercase tracking-[0.18em] mt-2.5 mb-3.5"
              style={{ color: primary }}
            >
              {t("certificates.the_plate") || "The Plate"}
            </div>

            <GradientRule from={primary} to={secondary} className="mb-3.5" />

            <div
              className="text-[11px] md:text-[13px] font-bold uppercase tracking-[0.08em] mb-2.5"
              style={{ color: primary }}
            >
              {t("certificates.plate_details") || "Plate Details"}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                {
                  label: t("certificates.emirate") || "Emirate",
                  value: emirate,
                },
                {
                  label: t("certificates.plate_code_label") || "Plate Code",
                  value: plateCode,
                },
                {
                  label: t("certificates.number") || "Number",
                  value: plateNumber,
                },
                {
                  label: t("certificates.plate_category") || "Plate Category",
                  value: plateCategory,
                },
              ].map((col) => (
                <div key={col.label}>
                  <div
                    className="text-[9px] md:text-[10px] uppercase tracking-wide"
                    style={{ color: "#ffffff" }}
                  >
                    {col.label}
                  </div>
                  <div className="text-sm md:text-[14px] pt-1">
                    {col.value}
                  </div>
                </div>
              ))}
            </div>

            {(
              [
                {
                  label: t("certificates.issue_date") || "Issue date",
                  value: issueDate,
                },
                {
                  label:
                    t("certificates.assessed_market_value") ||
                    "Assessed market value (AED)",
                  value: assessed,
                },
                {
                  label: t("certificates.owner_name") || "Owner's name",
                  value: ownerName,
                },
                {
                  label:
                    t("certificates.traffic_file_number") ||
                    "Traffic file number",
                  value: traffic,
                },
              ] as const
            ).map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[12px] md:text-[13px]">{row.label}</span>
                  <span className="text-[12px] md:text-[13px] text-end">
                    {row.value}
                  </span>
                </div>
                <GradientRule from={primary} to={secondary} />
              </div>
            ))}

            <div className="flex items-center justify-between gap-4 py-2.5">
              <div>
                <div className="text-[12px] md:text-[13px]">
                  {t("certificates.unique_certificate_number") ||
                    "Unique certificate number"}
                </div>
                <div className="font-bold text-[12px] md:text-[13px] pt-1">
                  {data.certificateNumber}
                </div>
              </div>
              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt=""
                  width={78}
                  height={78}
                  className="size-[64px] md:size-[78px] shrink-0 bg-white p-1"
                />
              ) : null}
            </div>
            <GradientRule from={primary} to={secondary} />

            <div className="flex justify-center my-5 md:my-6">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Mazal"
                  className="h-9 md:h-[42px] w-auto max-w-[220px] object-contain"
                />
              ) : (
                <div className="text-2xl md:text-[30px] font-bold tracking-[0.18em]">
                  MAZAL
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] md:text-[12px] mb-3">
              <span className="text-start break-all">{contact.phone}</span>
              <span className="text-center break-all">{contact.email}</span>
              <span className="text-end break-all">{contact.website}</span>
            </div>

            <GradientRule from={primary} to={secondary} className="my-3" />

            <p className="text-[9px] md:text-[10px] leading-[1.45] m-0">
              {t("certificates.pdf_disclaimer") ||
                "This valuation reflects Mazal's market assessment as of the issue date, based on available data and prevailing market conditions. Mazal assumes no liability for any third-party decisions, transactions, or claims arising from this valuation."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
