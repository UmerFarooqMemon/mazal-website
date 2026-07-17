"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import VerifiedCertificateCard, {
  SAMPLE_CERTIFICATE,
  type CertificateDisplayData,
} from "@/components/certificates/VerifiedCertificateCard";
import VerifyPreviewSkeleton from "@/components/skeletons/certificates/VerifyPreviewSkeleton";
import {
  buildPlatePreviewLookup,
  resolvePlatePreview,
} from "@/lib/plate-preview";

async function ensurePlatePreview(
  data: CertificateDisplayData,
  locale: string,
): Promise<CertificateDisplayData> {
  if (data.platePreview?.background_image_url) return data;
  if (!data.plateType && !data.plateVariant) return data;

  try {
    const res = await fetch(`/api/number-plates/options?locale=${locale}`);
    const json = await res.json();
    const lookup = buildPlatePreviewLookup(json?.data || {});
    const platePreview = resolvePlatePreview(lookup, data);
    return { ...data, platePreview };
  } catch {
    return data;
  }
}

export default function LivePreviewCertificatePage() {
  const router = useRouter();
  const { t, locale, loading: localeLoading } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, loading: themeLoading } = useTheme();
  const [certificate, setCertificate] =
    useState<CertificateDisplayData>(SAMPLE_CERTIFICATE);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const raw = sessionStorage.getItem("mazal_verified_certificate");
        if (!raw) return;
        const parsed = JSON.parse(raw) as CertificateDisplayData;
        const withPreview = await ensurePlatePreview(parsed, locale);
        if (!cancelled) setCertificate(withPreview);
      } catch {
        /* keep sample */
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (themeLoading || localeLoading) {
    return <VerifyPreviewSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Mobile layout — matches Figma Live Preview */}
      <section className="md:hidden flex-1 flex flex-col px-6 pt-6 pb-8">
        <h1
          className={`font-serif text-[30px] leading-8 tracking-tight mb-6 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("primaryText") || "#081123" }}
        >
          {t("certificates.live_preview_title") || "Live Preview"}
        </h1>

        <VerifiedCertificateCard
          data={{ ...certificate, showPreviewBadge: true }}
        />

        <div className="mt-10">
          <div
            className="h-px w-full mb-7"
            style={{ backgroundColor: getColor("border") || "#D9DEE6" }}
          />
          <button
            type="button"
            onClick={() => router.push(`/${locale}/verify`)}
            className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-2.5 text-[10px] transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
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
        </div>
      </section>

      {/* Desktop — centered certificate preview */}
      <section className="hidden md:flex flex-1 flex-col items-center px-6 lg:px-8 py-14 lg:py-16">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <h1
            className="font-serif text-4xl lg:text-5xl tracking-tight mb-4 text-center"
            style={{ color: getColor("primaryText") || "#081123" }}
          >
            {t("certificates.live_preview_title") || "Live Preview"}
          </h1>
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
            data={{ ...certificate, showPreviewBadge: true }}
            className="max-w-[896px]"
          />

          <button
            type="button"
            onClick={() => router.push(`/${locale}/verify`)}
            className={`mt-10 inline-flex items-center gap-1.5 border rounded-full px-4 py-2.5 text-sm transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
            style={{
              borderColor: getColor("border") || "#D9DEE6",
              color: getColor("primaryText") || "#081123",
              backgroundColor: "#fff",
            }}
          >
            {isRTL ? (
              <ArrowRight className="size-4" />
            ) : (
              <ArrowLeft className="size-4" />
            )}
            {t("certificates.back") || "Back"}
          </button>
        </div>
      </section>
    </div>
  );
}
