"use client";
import Link from "next/link";
import { Eye, Star } from "lucide-react";
import { useLocale } from "../../context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";

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
  imageUrl?: string;
  plate_code?: string;
  plate_digits?: string;
  plate_type?: string;
  plate_design?: string;
  hideCode?: boolean;
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
  plate_code,
  plate_digits,
  plate_type,
  plate_design,
  hideCode = false,
}: PlateCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const formattedViews = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-US",
  ).format(views);

  const badgeLabel = tier
    ? TIER_LABELS[tier]
    : type || TIER_LABELS.diamond;

  const digits =
    plate_digits ||
    (code.includes("|") ? code.split("|").pop()?.trim() : code) ||
    "";

  const letterCode =
    plate_code ||
    (code.includes("|") ? code.split("|")[0]?.trim() : "") ||
    "";

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

      <div className="mb-4">
        <NumberPlateDisplay
          plate_code={letterCode}
          plate_digits={digits}
          emirate={emirate}
          plateType={plate_type}
          plateDesign={plate_design}
          crop="card"
          hideCode={hideCode}
        />
      </div>

      <div className={`${isRTL ? "text-right" : "text-left"}`}>
        <div
          className="text-[22px] leading-8 font-serif font-bold tracking-tight"
          style={{ color: getColor("primaryText") }}
        >
          <DirhamAmount amount={price} weight="bold" />
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
