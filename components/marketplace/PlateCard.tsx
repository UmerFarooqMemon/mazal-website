"use client";
import Link from "next/link";
import { Eye, Star } from "lucide-react";
import { useLocale } from "../../context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import ListingPlanBadge from "@/components/marketplace/ListingPlanBadge";
import { ListingInlineStatusBadge } from "@/components/marketplace/ListingStatusBadge";
import type { PlatePreviewConfig } from "@/lib/plate-preview";
import {
  type MarketplaceListingPlanSummary,
  type MarketplaceListingStatus,
} from "@/services/marketplace";

interface PlateCardProps {
  id: string | number;
  /** Listing lifecycle status from API — used for grid QA (reserved/sold stay visible). */
  status?: MarketplaceListingStatus | string;
  emirate: string;
  code: string;
  price: number;
  type?: "DIRECT" | "AUCTION" | "SPOT" | string;
  listingPlan?: MarketplaceListingPlanSummary | null;
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
  /** Render config from the listing API — wins over plate_type/design lookup. */
  preview?: PlatePreviewConfig | null;
  hideCode?: boolean;
  /** Marketplace grid only: scale overlay font to card width instead of viewport. */
  fitPlateFont?: boolean;
}

export default function PlateCard({
  id,
  status,
  emirate,
  code,
  price,
  listingPlan,
  views,
  rating,
  previouslySold,
  plate_code,
  plate_digits,
  plate_type,
  plate_design,
  preview,
  hideCode = false,
  fitPlateFont = false,
}: PlateCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();

  const formattedViews = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-US",
  ).format(views);

  const digits =
    plate_digits ||
    (code.includes("|") ? code.split("|").pop()?.trim() : code) ||
    "";

  const letterCode = hideCode
    ? plate_code || ""
    : plate_code ||
      (code.includes("|") ? code.split("|")[0]?.trim() : "") ||
      "";

  return (
    <Link
      href={`/${locale}/listings/${id}`}
      data-listing-status={status}
      className="group relative block rounded-2xl border p-5 transition-all duration-300 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className={`flex justify-between items-center mb-4`}
      >
        <ListingPlanBadge plan={listingPlan} />
        <div
          className={`flex items-center gap-1.5 text-xs`}
          style={{ color: getColor("mutedText") }}
        >
          <Eye className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{formattedViews}</span>
        </div>
      </div>

      <div className="relative mb-4">
        <NumberPlateDisplay
          plate_code={letterCode}
          plate_digits={digits}
          emirate={emirate}
          preview={preview}
          plateType={plate_type}
          plateDesign={plate_design}
          crop="card"
          hideCode={hideCode}
          scaleFontToWidth={fitPlateFont}
          fontScaleMultiplier={fitPlateFont ? 2.3 : undefined}
        />
      </div>

      <div className="mb-4 min-h-6">
        <ListingInlineStatusBadge
          status={status}
          previouslySold={previouslySold}
        />
      </div>

      <div className={`text-start`}>
        <div
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: getColor("mutedText") }}
        >
          {t("listings.asking_price")}
        </div>
        <div
          className="text-[22px] leading-8 font-serif font-bold tracking-tight"
          style={{ color: getColor("primaryText") }}
        >
          <DirhamAmount amount={price} weight="bold" />
        </div>
        <div
          className={`mt-1.5 flex items-center gap-2 text-xs`}
          style={{ color: getColor("mutedText") }}
        >
          <span>{t("marketplace.seller_rating")}</span>
          <span style={{ color: getColor("border") }}>·</span>
          <span
            className={`flex items-center gap-1`}
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
