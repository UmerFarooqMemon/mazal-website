"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = (params?.id as string) || "1";

  const [listing, setListing] = useState<MarketplaceListingDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PayTabs returns to /marketplace/{id}?auction_deposit_return=1 — send user to auction register flow.
  useEffect(() => {
    const isReturn = searchParams.get("auction_deposit_return") === "1";
    if (!isReturn) return;

    const failed = searchParams.get("paytabs_failed");
    const qs = new URLSearchParams({ auction_deposit_return: "1" });
    if (failed) qs.set("paytabs_failed", failed);
    router.replace(`/${locale}/auctions/${listingId}/register?${qs.toString()}`);
  }, [listingId, locale, router, searchParams]);

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
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10">
        <div
          className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-10`}
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <PlateHero listing={listing} />

            <div className="pt-6">
              <h3
                className="text-2xl font-serif font-bold mb-3"
                style={{ color: getColor("primaryText") }}
              >
                {t("listings.description_heading")}
              </h3>
              <p
                className="text-sm leading-relaxed max-w-2xl"
                style={{ color: getColor("mutedText") }}
              >
                {listing.description ||
                  t("listings.description_template")
                    .replace(
                      "{emirate}",
                      listing.emirate_label || listing.emirate || "",
                    )
                    .replace("{code}", listing.plate_code || "—")
                    .replace("{digits}", listing.plate_digits || "—")}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ListingSidebar listing={listing} />
          </div>
        </div>

        <SimilarPlates listingId={listingId} />
      </div>
    </div>
  );
}
