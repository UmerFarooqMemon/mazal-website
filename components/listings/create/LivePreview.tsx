"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PlateWithOverlay from "@/components/ui/PlateWithOverlay";
import type { PlatePreviewConfig } from "@/lib/plate-preview";

interface LivePreviewProps {
  code: string;
  digits: string;
  emirate: string;
  plateVariant: string;
  price: string;
  hideCode?: boolean;
  showCode?: boolean;
  preview?: PlatePreviewConfig;
  label?: string;
}

export default function LivePreview({
  code,
  digits,
  emirate,
  plateVariant,
  price,
  hideCode = false,
  showCode: showCodeProp,
  preview: previewProp,
  label,
}: LivePreviewProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const [fetchedPreview, setFetchedPreview] = useState<PlatePreviewConfig>();
  const [fetchedShowCode, setFetchedShowCode] = useState(true);

  useEffect(() => {
    if (previewProp) return;

    let active = true;
    fetch(`/api/number-plates/options?locale=${locale}`)
      .then((response) => response.json())
      .then((result) => {
        if (!active) return;
        const emirates = result?.data?.emirates || [];
        const variants = emirates.flatMap(
          (item: {
            variants?: Array<{
              key: string;
              has_code?: boolean;
              fields?: string[];
              preview?: PlatePreviewConfig;
            }>;
          }) => item.variants || [],
        );
        const selected = variants.find(
          (variant: { key: string }) => variant.key === plateVariant,
        );
        setFetchedPreview(selected?.preview);
        setFetchedShowCode(
          (selected?.fields?.includes("plate_code") ?? true) &&
            (selected?.has_code ?? true),
        );
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [locale, plateVariant, previewProp]);

  const preview = previewProp || fetchedPreview;
  const showCode =
    showCodeProp !== undefined ? showCodeProp : fetchedShowCode;

  const formattedPrice = price
    ? new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-US", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
      }).format(Number(price.replace(/,/g, "")) || 0)
    : "AED 0";

  return (
    <div
      className="rounded-2xl border shadow-[0_12px_40px_-20px_rgba(4,20,67,0.2)] p-6"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className={`text-[11px] font-bold tracking-[0.14em] uppercase mb-5 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("mutedText") }}
      >
        {label || t("listings.live_preview")}
      </div>

      <div
        className="relative w-full rounded-xl border overflow-hidden mb-6"
        style={{
          borderColor: getColor("border"),
          backgroundColor: "#F5F5F5",
        }}
      >
        <div className="plate-crop plate-crop--form">
          <PlateWithOverlay
            plate_code={showCode ? code : ""}
            plate_digits={digits}
            emirate={emirate}
            preview={preview}
            isRTL={isRTL}
            hideCode={showCode && hideCode}
          />
        </div>
      </div>

      <div
        className="border-t pt-5"
        style={{ borderColor: getColor("border") }}
      >
        <div
          className={`flex items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: getColor("secondaryText") }}
          >
            {t("listings.total_amount")}
          </span>
          <span
            className="text-2xl md:text-3xl font-bold"
            style={{ color: getColor("primaryText") }}
          >
            {formattedPrice}
          </span>
        </div>
        <p
          className={`text-[11px] mt-2 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("mutedText") }}
        >
          {emirate}
        </p>
      </div>
    </div>
  );
}
