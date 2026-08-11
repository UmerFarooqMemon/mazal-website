"use client";

import Link from "next/link";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import ListingPlanBadge from "@/components/marketplace/ListingPlanBadge";
import { ListingInlineStatusBadge } from "@/components/marketplace/ListingStatusBadge";
import { useLocale } from "@/context/LocaleContext";
import type { PlatePreviewConfig } from "@/lib/plate-preview";
import {
  mapListingToPlateCard,
  toMarketplaceNumber,
  type MarketplaceListingCard,
  type MarketplaceListingPlanSummary,
  type MarketplaceListingStatus,
} from "@/services/marketplace";

export type HomeV2Plate = {
  id: string | number;
  status?: MarketplaceListingStatus | string;
  code: string;
  digits: string;
  emirate?: string;
  price: number;
  views: number;
  rating: number;
  listingPlan?: MarketplaceListingPlanSummary | null;
  showHeart?: boolean;
  plateType?: string;
  plateDesign?: string;
  preview?: PlatePreviewConfig | null;
  hideCode?: boolean;
  href?: string;
};

export function mapListingToHomeV2Plate(
  listing: MarketplaceListingCard,
): HomeV2Plate {
  const card = mapListingToPlateCard(listing);
  const auctionPrice =
    listing.listing_type === "auction"
      ? listing.auction?.current_price ?? listing.auction?.current_high_bid
      : undefined;

  return {
    id: listing.id,
    status: card.status,
    code: card.plate_code || "",
    digits: card.plate_digits || listing.display_plate || "",
    emirate: card.emirate,
    price:
      auctionPrice == null
        ? card.price
        : toMarketplaceNumber(auctionPrice),
    views: card.views,
    rating: card.rating,
    listingPlan: card.listingPlan,
    showHeart: Boolean(card.isFavorite),
    plateType: card.plate_type,
    plateDesign: card.plate_design,
    preview: card.preview,
    hideCode: card.hideCode,
    href: `/listings/${listing.id}`,
  };
}

/** Maps homepage listing payloads without filtering reserved/sold rows. */
export function mapListingsToHomeV2Plates(
  listings: MarketplaceListingCard[] | null | undefined,
): HomeV2Plate[] {
  return (listings ?? []).map(mapListingToHomeV2Plate);
}

export default function HomeV2PlateCard({ plate }: { plate: HomeV2Plate }) {
  const { locale, t } = useLocale();

  return (
    <Link
      href={`/${locale}${plate.href ?? `/home-v2/plates/${plate.id}`}`}
      data-listing-status={plate.status}
      className="relative flex flex-col gap-4 rounded-xl border border-[#d9dee6] bg-white p-5 shadow-[0_1px_2px_rgba(1,15,81,0.08),0_8px_24px_-12px_rgba(1,15,81,0.15)] transition-shadow hover:shadow-[0_8px_28px_-10px_rgba(21,46,43,0.2)]"
    >
      <div className="flex items-center justify-between">
        <ListingPlanBadge plan={plate.listingPlan} />
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-xs text-[#545e6f]">
            <HomeV2Icon src="/home-v2/icon-eye.svg" size={14} />
            {plate.views.toLocaleString("en-US")}
          </span>
          {plate.showHeart ? (
            <HomeV2Icon src="/home-v2/icon-heart.svg" size={19} />
          ) : null}
        </div>
      </div>

      <div className="relative">
        <NumberPlateDisplay
          plate_code={plate.code}
          plate_digits={plate.digits}
          emirate={plate.emirate ?? "DUBAI"}
          preview={plate.preview}
          plateType={plate.plateType}
          plateDesign={plate.plateDesign}
          plateVariant={
            plate.preview || plate.plateType || plate.plateDesign
              ? undefined
              : "private_new_colorful"
          }
          crop="card"
          hideCode={plate.hideCode}
          scaleFontToWidth
          fontScaleMultiplier={2.3}
        />
      </div>

      <div className="min-h-6">
        <ListingInlineStatusBadge status={plate.status} />
      </div>

      <div className="flex flex-col gap-1">
        <div className="font-serif text-2xl font-semibold tracking-tight text-[#081123]">
          <DirhamAmount amount={plate.price} weight="bold" />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#545e6f]">
          <span>{t("marketplace.seller_rating")}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <HomeV2Icon src="/home-v2/icon-star.svg" size={12} />
            {plate.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
