"use client";
import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PlateCard from "../marketplace/PlateCard";
import {
  getSimilarListings,
  mapListingToPlateCard,
} from "@/services/marketplace";

interface SimilarPlatesProps {
  listingId: string | number;
}

export default function SimilarPlates({ listingId }: SimilarPlatesProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const [plates, setPlates] = useState<
    ReturnType<typeof mapListingToPlateCard>[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getSimilarListings(listingId, locale)
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
  }, [listingId, locale]);

  if (!loading && plates.length === 0) {
    return null;
  }

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

      {loading ? (
        <div className="text-sm py-8" style={{ color: getColor("mutedText") }}>
          {t("common.loading") || "Loading..."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              previouslySold={plate.previouslySold}
              imageUrl={plate.imageUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
