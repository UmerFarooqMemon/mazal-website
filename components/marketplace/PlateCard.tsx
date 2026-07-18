"use client";
import Link from "next/link";
import Image from "next/image";
import { Eye, Star } from "lucide-react";
import { useLocale } from "../../context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

interface PlateCardProps {
  id: string | number;
  emirate: string;
  code: string;
  price: number;
  type?: "DIRECT" | "AUCTION" | "SPOT" | string;
  tier?: "diamond" | "gold" | "silver";
  views: number;
  seller?: string;
  rating: number;
  isFavorite?: boolean;
  isBlurred?: boolean;
  previouslySold?: boolean;
}

const TIER_LABELS = {
  diamond: "Diamond",
  gold: "Gold",
  silver: "Silver",
} as const;

export default function PlateCard({
  id,
  emirate,
  code,
  price,
  type,
  tier,
  views,
  rating,
  previouslySold,
}: PlateCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const formattedPrice = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-US",
    {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    },
  ).format(price);

  const formattedViews = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-US",
  ).format(views);

  const badgeLabel = tier
    ? TIER_LABELS[tier]
    : type || TIER_LABELS.diamond;

  return (
    <Link
      href={`/${locale}/listings/${id}`}
      className="group relative block rounded-2xl border p-5 transition-all duration-300 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      {previouslySold && (
        <span
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
          style={{
            backgroundColor: "#F5E6D3",
            color: "#8B5E2B",
          }}
        >
          Previously sold
        </span>
      )}

      <div
        className={`flex justify-between items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider"
          style={{
            backgroundColor: getColor("primaryLight"),
            color: getColor("primary"),
          }}
        >
          {badgeLabel}
        </span>
        <div
          className={`flex items-center gap-1.5 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ color: getColor("mutedText") }}
        >
          <Eye className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{formattedViews}</span>
        </div>
      </div>

      <div
        className="relative w-full aspect-[250/60] mb-4 overflow-hidden"
        style={{ backgroundColor: getColor("surface") }}
      >
        <Image
          src="/home-new.png"
          alt={`${emirate} ${code} Plate`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 280px"
        />
      </div>

      <div className={`${isRTL ? "text-right" : "text-left"}`}>
        <div
          className="text-[22px] leading-8 font-serif font-bold tracking-tight"
          style={{ color: getColor("primaryText") }}
        >
          {formattedPrice}
        </div>
        <div
          className={`mt-1.5 flex items-center gap-2 text-xs ${isRTL ? "flex-row-reverse justify-end" : ""}`}
          style={{ color: getColor("mutedText") }}
        >
          <span>{t("marketplace.seller_rating")}</span>
          <span style={{ color: getColor("border") }}>·</span>
          <span
            className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ color: getColor("secondaryText") }}
          >
            <Star
              className="w-3 h-3"
              style={{ fill: getColor("accent"), color: getColor("accent") }}
              strokeWidth={0}
            />
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
