"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import VerifiedCertificateCard, {
  SAMPLE_CERTIFICATE,
  type CertificateDisplayData,
  type PlatePreviewConfig,
} from "@/components/certificates/VerifiedCertificateCard";
import VerifyCertificateSkeleton from "@/components/skeletons/certificates/VerifyCertificateSkeleton";
import type {
  CertificateVerifyCertificate,
  CertificateVerifyResponse,
} from "@/services/api";

function formatIssuedLabel(
  issuedAt?: string,
  expiresAt?: string,
  fallback?: string,
) {
  if (!issuedAt) return fallback || "Issued 01 July 2026 · Valid 90 days";

  const issued = new Date(issuedAt);
  const issuedStr = issued.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (!expiresAt) return `Issued ${issuedStr}`;

  const days = Math.max(
    0,
    Math.round(
      (new Date(expiresAt).getTime() - issued.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  return `Issued ${issuedStr} · Valid ${days} days`;
}

function toAmount(value?: string | number | null): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? Math.round(parsed) : 0;
  }
  return 0;
}

/** Split "M777" / "M 777" / "55555" into code + digits when API only sends display_plate. */
function parseDisplayPlate(display?: string): {
  plateCode: string;
  plateDigits: string;
} {
  const raw = (display || "").trim();
  if (!raw) return { plateCode: "", plateDigits: "" };

  const match = raw.match(/^([A-Za-z]+)\s*[-]?\s*(\d+)$/);
  if (match) {
    return { plateCode: match[1].toUpperCase(), plateDigits: match[2] };
  }

  if (/^\d+$/.test(raw)) {
    return { plateCode: "", plateDigits: raw };
  }

  return { plateCode: "", plateDigits: raw };
}

function unwrapCertificate(
  result: CertificateVerifyResponse | Record<string, unknown>,
): CertificateVerifyCertificate {
  const root = (result as CertificateVerifyResponse)?.data ?? result;
  const nested = (root as CertificateVerifyResponse["data"])?.certificate;
  if (nested && typeof nested === "object") {
    return nested;
  }
  return root as CertificateVerifyCertificate;
}

function mapVerifyResponse(
  payload: CertificateVerifyCertificate,
  fallbackCode: string,
): CertificateDisplayData {
  const fromPlate = payload.plate;
  const parsed = parseDisplayPlate(payload.display_plate);

  const plateCode =
    payload.plate_code || fromPlate?.plate_code || parsed.plateCode || "";
  const plateDigits =
    payload.plate_digits ||
    fromPlate?.plate_digits ||
    parsed.plateDigits ||
    "";

  const assessed =
    toAmount(payload.valued_amount) || toAmount(payload.assessed_value);
  const marketLow =
    toAmount(payload.fair_market_low) ||
    (assessed ? Math.round(assessed * 0.88) : 0);
  const marketHigh =
    toAmount(payload.fair_market_high) ||
    (assessed ? Math.round(assessed * 1.14) : 0);

  const expiresAt = payload.valid_until || payload.expires_at;

  return {
    certificateNumber: payload.certificate_number || fallbackCode,
    // Keep empty string when no code (classic plates) so PlateWithOverlay can hide it
    plateCode: plateCode || (plateDigits ? "" : "—"),
    plateDigits: plateDigits || "—",
    assessedValue: assessed,
    marketLow,
    marketHigh,
    issuedLabel: formatIssuedLabel(payload.issued_at, expiresAt),
    showPreviewBadge: false,
    emirate: payload.emirate || fromPlate?.emirate,
    emirateLabel: payload.emirate_label,
    plateType: payload.plate_type || fromPlate?.plate_type,
    plateVariant: payload.plate_variant,
    plateDesign: payload.plate_design || fromPlate?.plate_design,
    holderName: payload.holder_name,
  };
}

function buildPreviewMap(optionsData: {
  emirates?: {
    variants?: {
      key?: string;
      plate_type?: string;
      plate_design?: string;
      preview?: PlatePreviewConfig;
    }[];
  }[];
}): Record<string, PlatePreviewConfig> {
  const map: Record<string, PlatePreviewConfig> = {};
  for (const em of optionsData?.emirates || []) {
    for (const v of em?.variants || []) {
      if (!v?.preview) continue;
      if (v.key) map[v.key] = v.preview;
      if (v.plate_type && v.plate_design) {
        map[`${v.plate_type}_${v.plate_design}`] = v.preview;
      }
      // First variant for a plate_type wins as fallback (e.g. classic_car)
      if (v.plate_type && !map[v.plate_type]) {
        map[v.plate_type] = v.preview;
      }
    }
  }
  return map;
}

function resolvePlatePreview(
  previewMap: Record<string, PlatePreviewConfig>,
  data: CertificateDisplayData,
): PlatePreviewConfig | null {
  return (
    (data.plateVariant && previewMap[data.plateVariant]) ||
    (data.plateType &&
      data.plateDesign &&
      previewMap[`${data.plateType}_${data.plateDesign}`]) ||
    (data.plateType && previewMap[data.plateType]) ||
    null
  );
}

async function attachPlatePreview(
  mapped: CertificateDisplayData,
  locale: string,
): Promise<CertificateDisplayData> {
  try {
    const res = await fetch(`/api/number-plates/options?locale=${locale}`);
    const json = await res.json();
    const previewMap = buildPreviewMap(json?.data || {});
    const platePreview = resolvePlatePreview(previewMap, mapped);
    return { ...mapped, platePreview };
  } catch {
    return mapped;
  }
}

export default function VerifyCertificatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale, loading: localeLoading } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, getGradient, loading: themeLoading } = useTheme();

  const initialCode = searchParams.get("code") || "";
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [certificate, setCertificate] =
    useState<CertificateDisplayData | null>(null);

  const displayCertificate = useMemo(
    () => certificate || SAMPLE_CERTIFICATE,
    [certificate],
  );

  const handleVerify = async (
    value?: string,
    options?: { silent?: boolean },
  ) => {
    const certificateCode = (value ?? code).trim().toUpperCase();
    if (!certificateCode) {
      toast.error(
        t("certificates.verify_code_required") ||
          "Please enter a certificate code",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/certificates/verify/${encodeURIComponent(certificateCode)}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            t("certificates.verify_failed") ||
            "Verification failed",
        );
      }

      if (result.status === false) {
        throw new Error(
          result.message ||
            t("certificates.verify_invalid") ||
            "This certificate could not be verified",
        );
      }

      const cert = unwrapCertificate(result);

      if (cert.is_valid === false || cert.valid === false) {
        throw new Error(
          t("certificates.verify_invalid") ||
            "This certificate could not be verified",
        );
      }

      if (cert.is_expired === true) {
        throw new Error(
          t("certificates.verify_expired") ||
            "This certificate has expired",
        );
      }

      const mapped = await attachPlatePreview(
        mapVerifyResponse(cert, certificateCode),
        locale,
      );
      setCertificate(mapped);
      setCode(certificateCode);
      setMobileView("preview");

      if (!options?.silent) {
        toast.success(
          t("certificates.verify_success") || "Certificate verified",
        );
      }

      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        requestAnimationFrame(() => {
          document
            .getElementById("live-preview")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } else if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            "mazal_verified_certificate",
            JSON.stringify(mapped),
          );
        } catch {
          /* ignore */
        }
        router.push(`/${locale}/verify/preview`);
      }
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("certificates.verify_failed") ||
          "Verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode.trim()) {
      void handleVerify(initialCode.trim(), { silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (themeLoading || localeLoading) {
    return <VerifyCertificateSkeleton />;
  }

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-2.5 text-[10px] md:text-sm transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
      style={{
        borderColor: getColor("border") || "#D9DEE6",
        color: getColor("primaryText") || "#081123",
        backgroundColor: "#fff",
      }}
    >
      {isRTL ? (
        <ArrowRight className="size-3.5" />
      ) : (
        <ArrowLeft className="size-3.5" />
      )}
      {t("certificates.back") || "Back"}
    </button>
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#FBFAF7" }}
    >
      {/* Mobile: Form */}
      <section
        className={`md:hidden flex-1 flex flex-col px-6 pt-6 pb-8 ${
          mobileView === "form" ? "" : "hidden"
        }`}
        style={{ backgroundColor: "#fff" }}
      >
        <div className={isRTL ? "text-right" : "text-left"}>
          <p
            className="text-xs uppercase tracking-[0.06em] mb-3"
            style={{ color: getColor("mutedText") || "#545E6F" }}
          >
            {t("certificates.verify_eyebrow") || "Certificate verification"}
          </p>
          <h1
            className="font-serif text-[30px] leading-9 tracking-tight mb-6 max-w-[378px]"
            style={{ color: getColor("primaryText") || "#081123" }}
          >
            {t("certificates.verify_title") ||
              "Verify Mazal Valuation Certificate"}
          </h1>
        </div>

        <label
          className={`block text-xs mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("mutedText") || "#545E6F" }}
          htmlFor="verify-code-mobile"
        >
          {t("certificates.verify_code_label") || "Code"}
        </label>
        <input
          id="verify-code-mobile"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleVerify();
          }}
          placeholder="MZL-VAL-55K0-2026"
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ${isRTL ? "text-right" : "text-left"}`}
          style={{
            borderColor: getColor("border") || "#D9DEE6",
            color: getColor("primaryText") || "#081123",
          }}
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => void handleVerify()}
          className="mt-5 w-full rounded-full py-3 text-[15px] font-medium text-[#FBFAF6] disabled:opacity-60"
          style={{ background: getGradient("primaryButton") }}
        >
          {loading
            ? t("certificates.verifying") || "Verifying..."
            : t("certificates.verify_button") || "Verify Certificate"}
        </button>

        <div className="mt-auto pt-16">
          <div
            className="h-px w-full mb-7"
            style={{ backgroundColor: getColor("border") || "#D9DEE6" }}
          />
          <BackButton onClick={() => router.back()} />
        </div>
      </section>

      {/* Mobile: Preview */}
      <section
        className={`md:hidden flex-1 flex flex-col px-6 pt-6 pb-8 ${
          mobileView === "preview" ? "" : "hidden"
        }`}
        style={{ backgroundColor: "#fff" }}
      >
        <h1
          className={`font-serif text-[30px] leading-8 tracking-tight mb-6 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("primaryText") || "#081123" }}
        >
          {t("certificates.live_preview_title") || "Live Preview"}
        </h1>

        <VerifiedCertificateCard
          data={{ ...displayCertificate, showPreviewBadge: true }}
        />
        <div className="mt-10">
          <div
            className="h-px w-full mb-7"
            style={{ backgroundColor: getColor("border") || "#D9DEE6" }}
          />
          <BackButton onClick={() => setMobileView("form")} />
        </div>
      </section>

      {/* Desktop */}
      <div className="hidden md:block flex-1">
        <section
          className="bg-white border-b"
          style={{ borderColor: getColor("border") || "#D9DEE6" }}
        >
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-14 lg:py-16 text-center">
            <p
              className="text-base lg:text-lg font-medium uppercase tracking-[0.05em] mb-4"
              style={{ color: getColor("primary") || "#0A2F94" }}
            >
              {t("certificates.verify_eyebrow") || "Certificate verification"}
            </p>
            <h1
              className="font-serif text-4xl lg:text-[54px] leading-tight tracking-tight mb-4"
              style={{ color: getColor("primaryText") || "#081123" }}
            >
              {t("certificates.verify_title") ||
                "Verify Mazal Valuation Certificate"}
            </h1>
            <p
              className="text-lg lg:text-2xl mb-10"
              style={{ color: getColor("mutedText") || "#545E6F" }}
            >
              {t("certificates.verify_subtitle") ||
                "Confirm the authenticity of your valuation certificate."}
            </p>

            <p
              className="text-base lg:text-xl mb-3"
              style={{ color: getColor("mutedText") || "#545E6F" }}
            >
              {t("certificates.verify_hint") ||
                "Enter the unique certificate code below."}
            </p>

            <form
              className={`mx-auto flex max-w-[680px] items-center gap-3 rounded-full border bg-white pl-6 pr-2 py-2 ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ borderColor: getColor("border") || "#D9DEE6" }}
              onSubmit={(e) => {
                e.preventDefault();
                void handleVerify();
              }}
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MZL-VAL-55K0-2026"
                className={`flex-1 min-w-0 bg-transparent text-lg lg:text-2xl outline-none ${isRTL ? "text-right" : "text-left"}`}
                style={{ color: getColor("primaryText") || "#081123" }}
                aria-label={t("certificates.verify_code_label") || "Code"}
              />
              <Button
                type="submit"
                loading={loading}
                className="shrink-0 !px-8 !py-4 !text-base lg:!text-lg"
              >
                {t("certificates.verify_button") || "Verify Certificate"}
              </Button>
            </form>
          </div>
        </section>

        <section id="live-preview" className="px-6 lg:px-8 py-14 lg:py-16">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div
              className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 mb-10"
              style={{
                borderColor: getColor("primary") || "#0A2F94",
                color: getColor("primary") || "#0A2F94",
              }}
            >
              <span className="text-sm font-medium uppercase tracking-[0.06em]">
                {t("certificates.live_preview") || "LIVE PREVIEW"}
              </span>
            </div>

            <VerifiedCertificateCard
              data={{
                ...displayCertificate,
                showPreviewBadge: true,
              }}
              className="max-w-[896px]"
            />          </div>
        </section>
      </div>
    </div>
  );
}
