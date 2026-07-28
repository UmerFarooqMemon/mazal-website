"use client";
import { Shield, Clock, Star, Eye } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import {
  isHiddenPlateCode,
  type MarketplaceListingDetail,
} from "@/services/marketplace";

interface PlateHeroProps {
  listing?: MarketplaceListingDetail | null;
}

export default function PlateHero({ listing }: PlateHeroProps) {
  const { t, locale } = useLocale();
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
  const plateCode = listing?.plate_code || "";
  const rawDigits =
    listing?.plate_digits ||
    (!hideCode
      ? listing?.display_plate?.replace(/^[A-Za-z]+\s*[-|]?\s*/, "")
      : "") ||
    "";
  const plateDigits =
    hideCode && rawDigits && !/^\d+$/.test(rawDigits.trim()) ? "" : rawDigits;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-2xl border px-6 py-8 md:px-10 md:py-9 flex items-center justify-center shadow-sm min-h-[182px]"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div className="w-full max-w-xl">
          <NumberPlateDisplay
            plate_code={plateCode}
            plate_digits={plateDigits}
            emirate={
              listing?.emirate_label?.toUpperCase() || listing?.emirate || ""
            }
            plateType={listing?.plate_type || undefined}
            plateDesign={listing?.plate_design || undefined}
            crop="hero"
            hideCode={hideCode}
            digitCount={listing?.digit_count}
          />
        </div>
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
