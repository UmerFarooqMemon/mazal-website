"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PortfolioStats from "@/components/portfolio/PortfolioStats";
import PortfolioPlateCard from "@/components/portfolio/PortfolioPlateCard";
import type { PortfolioPlate } from "@/components/portfolio/data";
import { formatCountdown } from "@/components/auction/mappers";
import {
  getMyListings,
  type MarketplaceListingDetail,
} from "@/services/marketplace";

function mapListingToPortfolioPlate(
  listing: MarketplaceListingDetail,
): PortfolioPlate {
  const isAuction = listing.listing_type === "auction";
  const isListed =
    listing.status === "active" ||
    listing.status === "pending_approval" ||
    listing.status === "published";

  return {
    id: String(listing.id),
    emirate: listing.emirate_label?.toUpperCase() || listing.emirate,
    code: listing.plate_code || "",
    digits: listing.plate_digits || "",
    estValue: Number(listing.asking_price) || 0,
    returnPct: 0,
    status: isAuction ? "auction" : isListed ? "listed" : "owned",
    addedDate: (listing.created_at || listing.published_at || "").slice(0, 10),
    views: listing.view_count,
    auctionRemaining:
      isAuction && listing.auction?.ends_at
        ? formatCountdown(listing.auction.ends_at)
        : undefined,
    isListed,
    isAuction,
  };
}

export default function PortfolioPage() {
  const { t, locale } = useLocale();
  const { getColor, getGradient, loading } = useTheme();
  const isRTL = locale === "ar";
  const [plates, setPlates] = useState<PortfolioPlate[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlates = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await getMyListings(locale);
      const mapped = (response.data.listings || []).map(
        mapListingToPortfolioPlate,
      );
      setPlates(mapped);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load portfolio.",
      );
      setPlates([]);
    } finally {
      setFetching(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchPlates();
  }, [fetchPlates]);

  const auctionCount = useMemo(
    () => plates.filter((p) => p.isAuction).length,
    [plates],
  );
  const listedCount = useMemo(
    () => plates.filter((p) => p.isListed).length,
    [plates],
  );
  const totalEstValue = useMemo(
    () => plates.reduce((sum, p) => sum + (p.estValue || 0), 0),
    [plates],
  );

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div
          className={`mb-5 flex justify-end ${isRTL ? "justify-start" : ""}`}
        >
          <Link
            href={`/${locale}/portfolio/add`}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-95`}
            style={{ background: getGradient("primaryButton") }}
          >
            <Plus className="size-4" />
            {t("portfolio.add_plate")}
          </Link>
        </div>

        <div className="space-y-5">
          <PortfolioStats
            auctionOverride={auctionCount}
            listedOverride={listedCount}
            plateCount={plates.length}
            totalEstValue={totalEstValue}
          />

          {error && (
            <p className="text-sm" style={{ color: "#DC2626" }}>
              {error}
            </p>
          )}

          {fetching ? (
            <div
              className="text-sm py-12 text-center"
              style={{ color: getColor("mutedText") }}
            >
              {t("common.loading") || "Loading..."}
            </div>
          ) : plates.length === 0 ? (
            <div
              className="text-sm py-12 text-center"
              style={{ color: getColor("mutedText") }}
            >
              {t("common.no_results") || "No listings found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {plates.map((plate) => (
                <PortfolioPlateCard key={plate.id} plate={plate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
