"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import SearchBar from "@/components/marketplace/SearchBar";
import AuctionListingCard from "@/components/auction/AuctionListingCard";
import AuctionBrowseFilters, {
  type AuctionBrowseFilterState,
} from "@/components/auction/AuctionBrowseFilters";
import { mapListingsToAuctionListings } from "@/components/auction/mappers";
import type { AuctionListing } from "@/components/auction/types";
import {
  mapEmirateToApi,
  searchListings,
  type MarketplaceAuctionBrowseFilters,
  type MarketplaceSearchParams,
} from "@/services/marketplace";

const INITIAL_FILTERS: AuctionBrowseFilterState = {
  status: "live",
  hasBids: false,
  endingSoonHours: 24,
  emirate: "All",
  digit_count: "Any",
  price_range: "",
  sort: "ending_soon",
  minBid: "",
  maxBid: "",
};

const SORT_LABEL_KEYS: Record<string, string> = {
  ending_soon: "auctions.sort_ending_soon",
  current_bid_asc: "auctions.sort_current_bid_asc",
  current_bid_desc: "auctions.sort_current_bid_desc",
  trending: "marketplace.sort_trending",
  price_asc: "marketplace.sort_price_asc",
  price_desc: "marketplace.sort_price_desc",
  newest: "marketplace.sort_newest",
  oldest: "marketplace.sort_oldest",
  relevance: "marketplace.sort_relevance",
};

function parseBid(value: string): number | undefined {
  const parsed = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function toFlag(on: boolean): "1" | undefined {
  return on ? "1" : undefined;
}

function buildAuctionSearchParams(
  filters: AuctionBrowseFilterState,
  query: string,
  page: number,
): MarketplaceSearchParams {
  const params: MarketplaceSearchParams = {
    listing_type: "auction",
    q: query || undefined,
    emirate: mapEmirateToApi(filters.emirate),
    digit_count:
      filters.digit_count && filters.digit_count !== "Any"
        ? Number(filters.digit_count)
        : undefined,
    price_range: filters.price_range || undefined,
    sort: filters.sort || undefined,
    has_bids: toFlag(filters.hasBids),
    min_bid: parseBid(filters.minBid),
    max_bid: parseBid(filters.maxBid),
    per_page: 12,
    page,
  };

  if (filters.status === "live") {
    params.live_only = "1";
  } else if (filters.status === "ending_soon") {
    params.ending_soon = "1";
    params.ending_soon_hours = filters.endingSoonHours || 24;
  } else if (filters.status === "upcoming") {
    params.upcoming_only = "1";
  }

  return params;
}

export default function AuctionsPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const isRTL = locale === "ar";
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [filters, setFilters] =
    useState<AuctionBrowseFilterState>(INITIAL_FILTERS);
  const [debouncedMinBid, setDebouncedMinBid] = useState("");
  const [debouncedMaxBid, setDebouncedMaxBid] = useState("");
  const [catalog, setCatalog] =
    useState<MarketplaceAuctionBrowseFilters | null>(null);
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [similar, setSimilar] = useState<AuctionListing[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedMinBid(filters.minBid);
      setDebouncedMaxBid(filters.maxBid);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [filters.minBid, filters.maxBid]);

  const fetchAuctions = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchListings(
          buildAuctionSearchParams(
            {
              ...filters,
              minBid: debouncedMinBid,
              maxBid: debouncedMaxBid,
            },
            appliedQuery,
            pageNum,
          ),
          locale,
        );

        if (response.data.filters?.auction) {
          setCatalog(response.data.filters.auction);
        }

        const mapped = mapListingsToAuctionListings(response.data.listings);
        setAuctions((prev) => (append ? [...prev, ...mapped] : mapped));
        setSimilar(
          mapListingsToAuctionListings(response.data.similar_listings || []),
        );
        setTotalCount(response.data.pagination?.total ?? mapped.length);
        setLastPage(response.data.pagination?.last_page ?? 1);
        setPage(pageNum);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load auctions.",
        );
        if (!append) {
          setAuctions([]);
          setSimilar([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      appliedQuery,
      debouncedMaxBid,
      debouncedMinBid,
      filters.status,
      filters.hasBids,
      filters.endingSoonHours,
      filters.emirate,
      filters.digit_count,
      filters.price_range,
      filters.sort,
      locale,
    ],
  );

  useEffect(() => {
    fetchAuctions(1);
  }, [fetchAuctions]);

  const handleLoadMore = () => {
    if (page < lastPage) {
      fetchAuctions(page + 1, true);
    }
  };

  if (themeLoading || localeLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  return (
    <div
      className="min-h-screen pb-16"
      style={{ backgroundColor: getColor("background") }}
    >
      <div
        className="border-b"
        style={{
          backgroundColor: getColor("background"),
          borderColor: getColor("border"),
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-3">
            <h1
              className="text-4xl md:text-[40px] font-serif font-bold leading-none"
              style={{ color: getColor("primaryText") }}
            >
              {t("auctions.title")}
            </h1>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href={`/${locale}/auctions/registrations`}>
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<ClipboardList className="w-4 h-4" />}
                  className="rounded-full !h-[38px]"
                >
                  {t("auctions.my_registrations_cta") ||
                    t("auctions.my_registrations_title") ||
                    "My registrations"}
                </Button>
              </Link>
              <Link href={`/${locale}/auctions/add`}>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="rounded-full !h-[38px]"
                >
                  {t("auctions.add_plate")}
                </Button>
              </Link>
            </div>
          </div>
          <p
            className={`text-base mb-12 max-w-md ${isRTL ? "me-auto" : ""}`}
            style={{ color: getColor("mutedText") }}
          >
            {t("auctions.subtitle")}
          </p>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={() => setAppliedQuery(query.trim())}
            placeholder={t("auctions.search_placeholder")}
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <aside className="lg:col-span-1">
            <AuctionBrowseFilters
              selected={filters}
              catalog={catalog}
              onChange={(patch) =>
                setFilters((prev) => ({ ...prev, ...patch }))
              }
            />
          </aside>

          <div className="lg:col-span-3">
            <div
              className="flex justify-between items-center mb-6 text-sm"
              style={{ color: getColor("mutedText") }}
            >
              <span>
                {totalCount} {t("marketplace.results_count")}
              </span>
              <span>
                {t("marketplace.sorted_by")}{" "}
                {filters.sort && SORT_LABEL_KEYS[filters.sort]
                  ? t(SORT_LABEL_KEYS[filters.sort])
                  : t("marketplace.sort_relevance")}
              </span>
            </div>

            {error && (
              <p className="text-sm mb-6" style={{ color: "#DC2626" }}>
                {error}
              </p>
            )}

            {loading && auctions.length === 0 ? (
              <div
                className="text-sm py-12 text-center"
                style={{ color: getColor("mutedText") }}
              >
                {t("common.loading") || "Loading..."}
              </div>
            ) : auctions.length === 0 ? (
              <div>
                <p
                  className="text-sm py-8 text-center"
                  style={{ color: getColor("mutedText") }}
                >
                  {t("auctions.no_exact_matches")}
                </p>
                {similar.length > 0 ? (
                  <>
                    <h3
                      className="font-serif text-xl mb-4"
                      style={{ color: getColor("primaryText") }}
                    >
                      {t("auctions.similar_listings")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {similar.map((auction) => (
                        <AuctionListingCard
                          key={auction.id}
                          auction={auction}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {auctions.map((auction) => (
                  <AuctionListingCard key={auction.id} auction={auction} />
                ))}
              </div>
            )}

            {page < lastPage && auctions.length > 0 && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="inline-flex items-center justify-center h-[42px] px-8 rounded-full border text-sm font-semibold transition-colors disabled:opacity-60"
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("surface"),
                    color: getColor("primaryText"),
                  }}
                >
                  {loading
                    ? t("common.loading") || "Loading..."
                    : t("marketplace.load_more")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
