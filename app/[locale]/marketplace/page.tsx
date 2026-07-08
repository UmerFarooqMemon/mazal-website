"use client";
import { useLocale } from "@/context/LocaleContext";
import SearchBar from "../../../components/marketplace/SearchBar";
import MarketplaceFilters from "../../../components/marketplace/MarketplaceFilters";
import PlateCard from "../../../components/marketplace/PlateCard";

// Mock data matching the image
const platesData = [
  {
    id: 1,
    emirate: "DUBAI",
    code: "M | 7",
    price: 12500000,
    type: "DIRECT",
    views: 8421,
    seller: "Al Marwan",
    rating: 4.9,
  },
  {
    id: 2,
    emirate: "ABU DHABI",
    code: "1 | 88",
    price: 4800000,
    type: "AUCTION",
    views: 5210,
    seller: "Capital Plates",
    rating: 4.8,
  },
  {
    id: 3,
    emirate: "DUBAI",
    code: "AA | 999",
    price: 1850000,
    type: "DIRECT",
    views: 3104,
    seller: "MindF Motors",
    rating: 4.7,
    isBlurred: true,
  },
  {
    id: 4,
    emirate: "SHARJAH",
    code: "1 | 5",
    price: 920000,
    type: "DIRECT",
    views: 1880,
    seller: "Sharjah Auto",
    rating: 4.6,
    badge: "PREVIOUSLY SOLD",
  },
  {
    id: 5,
    emirate: "DUBAI",
    code: "K | 55",
    price: 680000,
    type: "AUCTION",
    views: 2210,
    seller: "Al Marwan",
    rating: 4.9,
  },
  {
    id: 6,
    emirate: "ABU DHABI",
    code: "5 | 777",
    price: 540000,
    type: "DIRECT",
    views: 1750,
    seller: "Capital Plates",
    rating: 4.8,
    isFavorite: true,
  },
  {
    id: 7,
    emirate: "DUBAI",
    code: "O | 2024",
    price: 285000,
    type: "SPOT",
    views: 941,
    seller: "Plate House",
    rating: 4.5,
  },
  {
    id: 8,
    emirate: "RAS AL KHAIMAH",
    code: "C | 11",
    price: 175000,
    type: "DIRECT",
    views: 612,
    seller: "Northern Plates",
    rating: 4.4,
  },
  {
    id: 9,
    emirate: "DUBAI",
    code: "P | 111",
    price: 410000,
    type: "DIRECT",
    views: 1120,
    seller: "MindF Motors",
    rating: 4.7,
    isBlurred: true,
  },
  {
    id: 10,
    emirate: "ABU DHABI",
    code: "13 | 9",
    price: 2200000,
    type: "AUCTION",
    views: 4022,
    seller: "Capital Plates",
    rating: 4.8,
  },
  {
    id: 11,
    emirate: "DUBAI",
    code: "T | 8",
    price: 6200000,
    type: "AUCTION",
    views: 6004,
    seller: "Al Marwan",
    rating: 4.9,
  },
  {
    id: 12,
    emirate: "AJMAN",
    code: "B | 44",
    price: 88000,
    type: "DIRECT",
    views: 304,
    seller: "Ajman Plates",
    rating: 4.3,
  },
];

export default function MarketplacePage() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* 1. Top Title */}
        <div className={`mb-8 ${isRTL ? "text-right" : "text-left"}`}>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#041443]">
            {t("marketplace.title")}
          </h1>
          <p className="text-gray-500 mt-2">{t("marketplace.subtitle")}</p>
        </div>

        {/* 2. Search bar */}
        <div className="mb-10">
          <SearchBar />
        </div>

        {/* 3. Filters and Results Grid - Reversed for RTL */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-4 gap-10 ${isRTL ? "rtl-grid" : ""}`}
        >
          {/* 
            Filters Sidebar:
            - English (LTR): Left side (col-start-1)
            - Arabic (RTL): Right side (col-start-4)
          */}
          <div
            className={`lg:col-span-1 ${isRTL ? "lg:col-start-4 lg:row-start-1" : "lg:col-start-1 lg:row-start-1"}`}
          >
            <div
              className={`flex items-center gap-2 text-sm font-semibold text-[#041443] mb-6 border-b pb-4 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              {t("marketplace.filters")}
            </div>
            <MarketplaceFilters />
          </div>

          {/* 
            Results Area:
            - English (LTR): Right side (col-start-2 to col-span-3)
            - Arabic (RTL): Left side (col-start-1 to col-span-3)
          */}
          <div
            className={`lg:col-span-3 ${isRTL ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-2 lg:row-start-1"}`}
          >
            {/* Results Header (Number and Order) */}
            <div
              className={`flex justify-between items-center mb-6 text-sm text-gray-500 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span>
                {platesData.length} {t("marketplace.results_count")}
              </span>
              <span className="flex items-center gap-1">
                {t("marketplace.sorted_by")}
              </span>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {platesData.map((plate) => (
                <PlateCard
                  key={plate.id}
                  id={plate.id}
                  emirate={plate.emirate}
                  code={plate.code}
                  price={plate.price}
                  type={plate.type as "DIRECT" | "AUCTION"}
                  views={plate.views}
                  seller={plate.seller}
                  rating={plate.rating}
                  isFavorite={plate.isFavorite}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
