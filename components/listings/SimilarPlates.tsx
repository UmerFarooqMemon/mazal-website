"use client";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PlateCard from "../marketplace/PlateCard";

const similarPlates = [
  {
    id: 4,
    emirate: "SHARJAH",
    code: "1 | 5",
    price: 920000,
    type: "DIRECT" as const,
    views: 1880,
    seller: "Sharjah Auto",
    rating: 4.6,
  },
  {
    id: 10,
    emirate: "ABU DHABI",
    code: "13 | 9",
    price: 2200000,
    type: "AUCTION" as const,
    views: 4022,
    seller: "Capital Plates",
    rating: 4.8,
  },
  {
    id: 11,
    emirate: "DUBAI",
    code: "T | 8",
    price: 6200000,
    type: "AUCTION" as const,
    views: 6004,
    seller: "Al Marwan",
    rating: 4.9,
    previouslySold: true,
  },
];

export default function SimilarPlates() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  return (
    <div className={`mt-12 ${isRTL ? "text-right" : "text-left"}`}>
      <h2
        className="text-2xl font-serif font-bold mb-1"
        style={{ color: getColor("primaryText") }}
      >
        {t("listings.similar_title")}
      </h2>
      <p className="text-sm mb-6" style={{ color: getColor("mutedText") }}>
        {t("listings.similar_subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similarPlates.map((plate) => (
          <PlateCard
            key={plate.id}
            id={plate.id}
            emirate={plate.emirate}
            code={plate.code}
            price={plate.price}
            type={plate.type}
            views={plate.views}
            seller={plate.seller}
            rating={plate.rating}
            previouslySold={plate.previouslySold}
          />
        ))}
      </div>
    </div>
  );
}
