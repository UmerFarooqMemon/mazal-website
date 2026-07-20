"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "../../context/LocaleContext";
import PlateCard from "../marketplace/PlateCard";
import {
  getTrendingListings,
  mapListingToPlateCard,
} from "@/services/marketplace";

export default function TrendingSection() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const [plates, setPlates] = useState<
    ReturnType<typeof mapListingToPlateCard>[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getTrendingListings(locale)
      .then((response) => {
        if (!active) return;
        setPlates((response.data.listings || []).map(mapListingToPlateCard));
      })
      .catch(() => {
        if (active) setPlates([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-100">
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

      {loading ? (
        <div className="text-sm text-gray-500 py-8 text-center">
          {t("common.loading") || "Loading..."}
        </div>
      ) : plates.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center">
          {t("common.no_results") || "No listings found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plates.map((plate) => (
            <PlateCard
              key={plate.id}
              id={plate.id}
              emirate={plate.emirate}
              code={plate.code}
              price={plate.price}
              type={plate.type}
              views={plate.views}
              rating={plate.rating}
              isFavorite={plate.isFavorite}
              previouslySold={plate.previouslySold}
              imageUrl={plate.imageUrl}
            />
          ))}
        </div>
      )}
    </section>
  );
}
