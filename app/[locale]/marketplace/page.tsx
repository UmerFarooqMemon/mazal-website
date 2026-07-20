"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import SearchBar from "../../../components/marketplace/SearchBar";
import MarketplaceFilters, {
  type MarketplaceFilterState,
} from "../../../components/marketplace/MarketplaceFilters";
import PlateCard from "../../../components/marketplace/PlateCard";
import {
  mapEmirateToApi,
  mapListingToPlateCard,
  mapListingTypeToApi,
  searchListings,
} from "@/services/marketplace";

const INITIAL_FILTERS: MarketplaceFilterState = {
  emirate: "",
  digit_count: "",
  price_range: "",
  type: "",
};

export default function MarketplacePage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const isRTL = locale === "ar";

  const [filters, setFilters] =
    useState<MarketplaceFilterState>(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [listings, setListings] = useState<
    ReturnType<typeof mapListingToPlateCard>[]
  >([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchListings(
          {
            emirate: mapEmirateToApi(filters.emirate),
            listing_type: mapListingTypeToApi(filters.type),
            digit_count:
              filters.digit_count && filters.digit_count !== "Any"
                ? Number(filters.digit_count)
                : undefined,
            price_range: filters.price_range || undefined,
            q: appliedQuery || undefined,
            page: pageNum,
            per_page: 12,
          },
          locale,
        );

        const mapped = (response.data.listings || []).map(mapListingToPlateCard);
        setListings((prev) => (append ? [...prev, ...mapped] : mapped));
        setTotalCount(response.data.pagination?.total ?? mapped.length);
        setLastPage(response.data.pagination?.last_page ?? 1);
        setPage(pageNum);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listings.");
        if (!append) setListings([]);
      } finally {
        setLoading(false);
      }
    },
    [appliedQuery, filters, locale],
  );

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  const handleFilterChange = (
    key: keyof MarketplaceFilterState,
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setAppliedQuery(searchQuery.trim());
  };

  const handleLoadMore = () => {
    if (page < lastPage) {
      fetchListings(page + 1, true);
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
          <div
            className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            <h1
              className="text-4xl md:text-[40px] font-serif font-bold leading-none"
              style={{ color: getColor("primaryText") }}
            >
              {t("marketplace.title")}
            </h1>
            <Link
              href={`/${locale}/listings/create`}
              className="inline-flex items-center justify-center h-9 px-5 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90 shrink-0"
              style={{ backgroundColor: getColor("primary") }}
            >
              {t("marketplace.create_listing")}
            </Link>
          </div>
          <p
            className={`text-base mb-6 max-w-md ${isRTL ? "text-right ml-auto" : "text-left"}`}
            style={{ color: getColor("mutedText") }}
          >
            {t("marketplace.subtitle")}
          </p>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <aside
            className={`lg:col-span-1 ${isRTL ? "lg:col-start-4 lg:row-start-1" : ""}`}
          >
            <div
              className={`flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ color: getColor("mutedText") }}
            >
              {t("marketplace.filters")}
            </div>
            <MarketplaceFilters selected={filters} onChange={handleFilterChange} />
          </aside>

          <div
            className={`lg:col-span-3 ${isRTL ? "lg:col-start-1 lg:row-start-1" : ""}`}
          >
            <div
              className={`flex justify-between items-center mb-6 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ color: getColor("mutedText") }}
            >
              <span>
                {totalCount} {t("marketplace.results_count")}
              </span>
              <span>{t("marketplace.sorted_by")}</span>
            </div>

            {error && (
              <p
                className={`text-sm mb-6 ${isRTL ? "text-right" : "text-left"}`}
                style={{ color: "#DC2626" }}
              >
                {error}
              </p>
            )}

            {loading && listings.length === 0 ? (
              <div
                className="text-sm py-12 text-center"
                style={{ color: getColor("mutedText") }}
              >
                {t("common.loading") || "Loading..."}
              </div>
            ) : listings.length === 0 ? (
              <div
                className="text-sm py-12 text-center"
                style={{ color: getColor("mutedText") }}
              >
                {t("common.no_results") || "No listings found."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((plate) => (
                  <PlateCard
                    key={plate.id}
                    id={plate.id}
                    emirate={plate.emirate}
                    code={plate.code}
                    price={plate.price}
                    type={plate.type}
                    views={plate.views}
                    rating={plate.rating}
                    previouslySold={plate.previouslySold}
                    isFavorite={plate.isFavorite}
                    imageUrl={plate.imageUrl}
                  />
                ))}
              </div>
            )}

            {page < lastPage && (
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
