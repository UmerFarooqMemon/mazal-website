"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PlateHero from "../../../../components/listings/PlateHero";
import ListingSidebar from "../../../../components/listings/ListingSidebar";
import SimilarPlates from "../../../../components/listings/SimilarPlates";
import {
  getListingDetail,
  type MarketplaceListingDetail,
} from "@/services/marketplace";

export default function ListingDetailPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const params = useParams();
  const listingId = (params?.id as string) || "1";
  const isRTL = locale === "ar";

  const [listing, setListing] = useState<MarketplaceListingDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getListingDetail(listingId, locale)
      .then((response) => {
        if (!active) return;
        setListing(response.data.listing);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load listing.");
        setListing(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [listingId, locale]);

  if (themeLoading || localeLoading || loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  if (error || !listing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: getColor("background") }}
      >
        <p style={{ color: getColor("mutedText") }}>
          {error || t("common.not_found") || "Listing not found."}
        </p>
      </div>
    );
  }

  const typeLabel = listing.listing_type_label || listing.listing_type;

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div
          className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ color: getColor("mutedText") }}
        >
          <Link
            href={`/${locale}/marketplace`}
            className="hover:opacity-80 transition-opacity"
            style={{ color: getColor("mutedText") }}
          >
            {t("listings.breadcrumb_marketplace")}
          </Link>
          <span>/</span>
          <span>{listing.emirate_label}</span>
          <span>/</span>
          <span style={{ color: getColor("secondaryText") }}>{typeLabel}</span>
        </div>

        <div
          className={`grid grid-cols-1 lg:grid-cols-5 gap-10 ${isRTL ? "rtl-grid" : ""}`}
        >
          <div
            className={`lg:col-span-3 space-y-8 ${isRTL ? "lg:col-start-3 lg:row-start-1" : "lg:col-start-1 lg:row-start-1"}`}
          >
            <PlateHero listing={listing} />

            <div className={isRTL ? "text-right" : "text-left"}>
              <h3
                className="text-lg font-serif font-bold mb-2"
                style={{ color: getColor("primaryText") }}
              >
                {listing.title || t("listings.description_title")}
              </h3>
              <p
                className="text-sm leading-relaxed max-w-2xl"
                style={{ color: getColor("mutedText") }}
              >
                {listing.description || t("listings.description_text")}
              </p>
            </div>
          </div>

          <div
            className={`lg:col-span-2 ${isRTL ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-4 lg:row-start-1"}`}
          >
            <ListingSidebar listing={listing} />
          </div>
        </div>

        <SimilarPlates listingId={listingId} />
      </div>
    </div>
  );
}
