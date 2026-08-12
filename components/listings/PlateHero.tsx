"use client";
import { Shield, Clock, Star, Eye } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import {
  getListingDetailCardBackground,
  hasListingDetailStatus,
  ListingDetailStatusBadge,
} from "@/components/marketplace/ListingStatusBadge";
import ListingPlanBadge from "@/components/marketplace/ListingPlanBadge";
import { usesCardCrop } from "@/lib/plate-preview";
import {
  isHiddenPlateCode,
  resolveListingPreview,
  resolvePlateParts,
  type MarketplaceListingDetail,
} from "@/services/marketplace";

interface PlateHeroProps {
  listing?: MarketplaceListingDetail | null;
}

export default function PlateHero({ listing }: PlateHeroProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  const cards = [
    {
      icon: Shield,
      title: t("listings.escrow_protected_title"),
      desc: t("listings.escrow_protected_desc"),
    },
    {
      icon: Clock,
      title: t("listings.window_title"),
      desc: t("listings.window_desc"),
    },
    {
      icon: Star,
      title: listing?.seller
        ? t("listings.seller_rating_title_dynamic").replace(
            "{rating}",
            listing.seller.rating.toFixed(1),
          )
        : t("listings.seller_rating_title"),
      desc: listing?.seller
        ? t("listings.seller_rating_desc_dynamic").replace(
            "{deals}",
            String(listing.seller.completed_deals),
          )
        : t("listings.seller_rating_desc"),
    },
    {
      icon: Eye,
      title: listing
        ? t("listings.views_title_dynamic").replace(
            "{views}",
            listing.view_count.toLocaleString(),
          )
        : t("listings.views_title"),
      desc: listing
        ? t("listings.views_desc_dynamic")
            .replace("{watchers}", String(listing.watcher_count ?? 0))
            .replace("{offers}", String(listing.offer_count ?? 0))
        : t("listings.views_desc"),
    },
  ];

  const hideCode = isHiddenPlateCode(listing);
  const { code: plateCode, digits: plateDigits } = resolvePlateParts(listing);
  const showDetailStatus = hasListingDetailStatus(
    listing?.status,
    listing?.previously_sold,
  );
  const detailCardBackground = getListingDetailCardBackground(
    listing?.status,
    listing?.previously_sold,
  );
  const preview = resolveListingPreview(listing);
  const plateCrop = usesCardCrop(preview) ? "card" : "hero";

  const plateDisplay = (
    <div className="plate-detail-frame relative w-full overflow-visible rounded-[20px] bg-white px-4 pt-5 pb-7 sm:px-8 sm:pt-7 sm:pb-9 shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
      <NumberPlateDisplay
        plate_code={plateCode}
        plate_digits={plateDigits}
        emirate={
          listing?.emirate_label?.toUpperCase() || listing?.emirate || ""
        }
        preview={preview}
        plateType={listing?.plate_type || undefined}
        plateDesign={listing?.plate_design || undefined}
        crop={plateCrop}
        hideCode={hideCode}
        wrapperClassName="w-full overflow-visible"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className={
          showDetailStatus
            ? "rounded-[24px] p-5 sm:p-7 md:p-8"
            : "rounded-2xl border px-6 py-8 md:px-10 md:py-9 flex flex-col shadow-sm"
        }
        style={
          showDetailStatus
            ? { background: detailCardBackground }
            : {
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
              }
        }
      >
        {showDetailStatus ? (
          <>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <ListingPlanBadge plan={listing?.listing_plan} />
                <ListingDetailStatusBadge
                  status={listing?.status}
                  previouslySold={listing?.previously_sold}
                />
              </div>
              <span
                className="text-[13px] font-medium"
                style={{ color: getColor("primaryText") }}
              >
                {t("listings.views_title_dynamic").replace(
                  "{views}",
                  (listing?.view_count ?? 0).toLocaleString(),
                )}
              </span>
            </div>

            {plateDisplay}
          </>
        ) : (
          <>
            {listing?.listing_plan ? (
              <div className="mb-4 self-start">
                <ListingPlanBadge plan={listing.listing_plan} />
              </div>
            ) : null}
            {plateDisplay}
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`rounded-xl border p-[21px] shadow-sm text-start`}
              style={{
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
              }}
            >
              <div
                className={`flex items-center gap-2 mb-2`}
                style={{ color: getColor("primary") }}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h4
                className="font-semibold text-base leading-6"
                style={{ color: getColor("primaryText") }}
              >
                {card.title}
              </h4>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: getColor("mutedText") }}
              >
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
