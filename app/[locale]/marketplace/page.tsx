"use client";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import SearchBar from "../../../components/marketplace/SearchBar";
import MarketplaceFilters from "../../../components/marketplace/MarketplaceFilters";
import PlateCard from "../../../components/marketplace/PlateCard";

const platesData = [
  {
    id: 1,
    emirate: "DUBAI",
    code: "M | 7",
    price: 5100000,
    tier: "diamond" as const,
    views: 8421,
    rating: 4.9,
  },
  {
    id: 2,
    emirate: "ABU DHABI",
    code: "1 | 88",
    price: 2200000,
    tier: "diamond" as const,
    views: 6004,
    rating: 4.9,
  },
  {
    id: 3,
    emirate: "DUBAI",
    code: "T | 8",
    price: 6200000,
    tier: "diamond" as const,
    views: 6004,
    rating: 4.9,
  },
  {
    id: 4,
    emirate: "DUBAI",
    code: "K | 55",
    price: 5100000,
    tier: "diamond" as const,
    views: 6004,
    rating: 4.9,
  },
  {
    id: 5,
    emirate: "ABU DHABI",
    code: "13 | 9",
    price: 2200000,
    tier: "diamond" as const,
    views: 6004,
    rating: 4.9,
  },
  {
    id: 6,
    emirate: "ABU DHABI",
    code: "5 | 777",
    price: 6200000,
    tier: "diamond" as const,
    views: 6004,
    rating: 4.9,
  },
  {
    id: 7,
    emirate: "DUBAI",
    code: "O | 2024",
    price: 5100000,
    tier: "gold" as const,
    views: 6004,
    rating: 4.9,
  },
  {
    id: 8,
    emirate: "RAS AL KHAIMAH",
    code: "C | 11",
    price: 2200000,
    tier: "silver" as const,
    views: 6004,
    rating: 4.9,
  },
  {
    id: 9,
    emirate: "DUBAI",
    code: "P | 111",
    price: 6200000,
    tier: "diamond" as const,
    views: 6004,
    rating: 4.9,
  },
];

export default function MarketplacePage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const isRTL = locale === "ar";

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
      {/* Hero + search */}
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
          <SearchBar />
        </div>
      </div>

      {/* Filters + grid */}
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
            <MarketplaceFilters />
          </aside>

          <div
            className={`lg:col-span-3 ${isRTL ? "lg:col-start-1 lg:row-start-1" : ""}`}
          >
            <div
              className={`flex justify-between items-center mb-6 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ color: getColor("mutedText") }}
            >
              <span>
                {platesData.length} {t("marketplace.results_count")}
              </span>
              <span>{t("marketplace.sorted_by")}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {platesData.map((plate) => (
                <PlateCard
                  key={plate.id}
                  id={plate.id}
                  emirate={plate.emirate}
                  code={plate.code}
                  price={plate.price}
                  tier={plate.tier}
                  views={plate.views}
                  rating={plate.rating}
                />
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <Link
                href={`/${locale}/auctions`}
                className="inline-flex items-center justify-center h-[42px] px-8 rounded-full border text-sm font-semibold transition-colors"
                style={{
                  borderColor: getColor("border"),
                  backgroundColor: getColor("surface"),
                  color: getColor("primaryText"),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = getColor("primary");
                  e.currentTarget.style.color = getColor("primary");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = getColor("border");
                  e.currentTarget.style.color = getColor("primaryText");
                }}
              >
                {t("marketplace.load_more")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
