"use client";
import Link from "next/link";
import { useLocale } from "../../context/LocaleContext";
import PlateCard from "../marketplace/PlateCard";

// Define a helper object to map raw data to translation keys
const getTranslatedData = (locale: "en" | "ar") => ({
  emirates: {
    DUBAI: locale === "en" ? "Dubai" : "دبي",
    "ABU DHABI": locale === "en" ? "Abu Dhabi" : "أبوظبي",
    SHARJAH: locale === "en" ? "Sharjah" : "الشارقة",
    AJMAN: locale === "en" ? "Ajman" : "عجمان",
    "RAS AL KHAIMAH": locale === "en" ? "RAK" : "رأس الخيمة",
  },
  sellers: {
    "Al Marwan": locale === "en" ? "Al Marwan" : "آل مروان",
    "Capital Plates": locale === "en" ? "Capital Plates" : "كابيتال بليتس",
    "Sharjah Auto": locale === "en" ? "Sharjah Auto" : "الشارقة أوتو",
    "MindF Motors": locale === "en" ? "MindF Motors" : "مايند إف موتورز",
    "Plate House": locale === "en" ? "Plate House" : "بلات هاوس",
    "Northern Plates": locale === "en" ? "Northern Plates" : "نورثرن بليتس",
    "Ajman Plates": locale === "en" ? "Ajman Plates" : "عجمان بليتس",
  },
  types: {
    DIRECT: locale === "en" ? "DIRECT" : "مباشر",
    AUCTION: locale === "en" ? "AUCTION" : "مزاد",
    SPOT: locale === "en" ? "SPOT" : "فوري",
  },
});

// Updated trending plates with raw data (will be translated dynamically)
const trendingPlates = [
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
    code: "T | 8",
    price: 6200000,
    type: "AUCTION",
    views: 6004,
    seller: "Al Marwan",
    rating: 4.9,
  },
  {
    id: 4,
    emirate: "DUBAI",
    code: "K | 55",
    price: 680000,
    type: "AUCTION",
    views: 2210,
    seller: "Al Marwan",
    rating: 4.9,
  },
  {
    id: 5,
    emirate: "ABU DHABI",
    code: "13 | 9",
    price: 2200000,
    type: "AUCTION",
    views: 4022,
    seller: "Capital Plates",
    rating: 4.8,
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
];

export default function TrendingSection() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  // Get translated mapping
  const translated = getTranslatedData(locale as "en" | "ar");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-100">
      {/* Title and "See all" button */}
      <div
        className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 ${isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}`}
      >
        <div className={`${isRTL ? "text-right" : "text-left"}`}>
          <div
            className={`flex items-center gap-2 text-[#0A3B9E] text-xs font-semibold uppercase tracking-wider mb-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            {t("home.trending_badge")}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#041443]">
            {t("home.trending_title")}
          </h2>
        </div>
        <Link
          href={`/${locale}/marketplace`}
          className="text-[#0A3B9E] font-medium text-sm hover:underline flex items-center gap-1 whitespace-nowrap pb-1"
        >
          {t("home.trending_see_all")}{" "}
          <span className="text-lg leading-none">→</span>
        </Link>
      </div>

      {/* Card Network */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingPlates.map((plate) => (
          <PlateCard
            key={plate.id}
            id={plate.id}
            // Pass translated values
            emirate={
              translated.emirates[
                plate.emirate as keyof typeof translated.emirates
              ]
            }
            code={plate.code}
            price={plate.price}
            type={
              translated.types[plate.type as keyof typeof translated.types]
            }
            views={plate.views}
            seller={
              translated.sellers[
                plate.seller as keyof typeof translated.sellers
              ]
            }
            rating={plate.rating}
            isFavorite={plate.isFavorite}
            tier={
              plate.type === "AUCTION"
                ? "gold"
                : plate.isFavorite
                  ? "silver"
                  : "diamond"
            }
          />
        ))}
      </div>
    </section>
  );
}
