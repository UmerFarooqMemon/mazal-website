"use client";

import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";

interface LivePreviewProps {
  code: string;
  digits: string;
  emirate: string;
  price: string;
  hideCode?: boolean;
  label?: string;
}

export default function LivePreview({
  code,
  digits,
  emirate,
  price,
  hideCode = false,
  label,
}: LivePreviewProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  const formattedPrice = price
    ? new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-US", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
      }).format(Number(price.replace(/,/g, "")) || 0)
    : "AED 0";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_12px_40px_-20px_rgba(4,20,67,0.2)] p-6">
      <div
        className={`text-[11px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF] mb-5 ${isRTL ? "text-right" : "text-left"}`}
      >
        {label || t("listings.live_preview")}
      </div>

      <div
        className={`relative w-full rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] overflow-hidden mb-6 ${hideCode ? "blur-sm select-none" : ""}`}
      >
        <div className="relative w-full aspect-[458/109]">
          <Image
            src="/home-new.png"
            alt={`${emirate} plate preview`}
            fill
            className="object-contain p-4"
            sizes="560px"
          />
        </div>
        <div className="absolute inset-x-0 bottom-2 flex justify-center">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0A3B9E]/80 bg-white/80 px-2 py-0.5 rounded">
            {(code || "AA").toUpperCase()} · {digits || "777"}
          </span>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] pt-5">
        <div
          className={`flex items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
            {t("listings.total_amount")}
          </span>
          <span className="text-2xl md:text-3xl font-bold text-[#041443]">
            {formattedPrice}
          </span>
        </div>
        <p
          className={`text-[11px] text-[#9CA3AF] mt-2 ${isRTL ? "text-right" : "text-left"}`}
        >
          {emirate}
        </p>
      </div>
    </div>
  );
}
