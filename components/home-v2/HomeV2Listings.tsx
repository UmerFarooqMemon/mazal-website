"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import {
  default as HomeV2PlateCard,
  mapListingToHomeV2Plate,
} from "@/components/home-v2/HomeV2PlateCard";
import { useLocale } from "@/context/LocaleContext";
import type { HomeV2Plate } from "@/components/home-v2/HomeV2PlateCard";
import {
  getMarketWatchingListings,
  getTrendingListings,
} from "@/services/marketplace";

function useHomepageListings(loader: typeof getMarketWatchingListings) {
  const { locale } = useLocale();
  const [plates, setPlates] = useState<HomeV2Plate[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    loader(locale)
      .then((response) => {
        if (!active) return;
        setHasError(false);
        setPlates(
          (response.data.listings || []).map(mapListingToHomeV2Plate),
        );
      })
      .catch(() => {
        if (!active) return;
        setPlates([]);
        setHasError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loader, locale]);

  return { plates, loading, hasError };
}

function PlateGridSection({
  badge,
  badgeIcon,
  title,
  subtitle,
  plates,
  loading,
  hasError,
  seeAll,
}: {
  badge: string;
  badgeIcon: string;
  title: string;
  subtitle?: string;
  plates: HomeV2Plate[];
  loading: boolean;
  hasError: boolean;
  seeAll?: boolean;
}) {
  const { locale, t } = useLocale();
  const isRTL = locale === "ar";

  return (
    <section className="bg-[#f2faef]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2">
              <HomeV2Icon src={badgeIcon} size={14} />
              <span className="text-xs font-medium tracking-[0.6px] text-[#152e2b] uppercase">
                {badge}
              </span>
            </div>
            <h2 className="font-serif text-3xl tracking-tight text-[#081123] sm:text-4xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-3 text-lg leading-6 text-[#545e6f]">{subtitle}</p>
            ) : null}
          </div>
          {seeAll ? (
            <Link
              href={`/${locale}/marketplace`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#152e2b] hover:underline"
            >
              {t("home.trending_see_all")}
              <span aria-hidden>{isRTL ? "←" : "→"}</span>
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-[#545e6f]">
            {t("common.loading")}
          </div>
        ) : hasError ? (
          <div className="py-10 text-center text-sm text-[#545e6f]">
            {t("common.error_submission")}
          </div>
        ) : plates.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#545e6f]">
            {t("common.no_results")}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plates.map((plate) => (
              <HomeV2PlateCard key={plate.id} plate={plate} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function HomeV2Watching() {
  const { t } = useLocale();
  const { plates, loading, hasError } = useHomepageListings(
    getMarketWatchingListings,
  );

  return (
    <PlateGridSection
      badge={t("home.v2_watching_badge")}
      badgeIcon="/home-v2/icon-trending.svg"
      title={t("home.trending_title")}
      subtitle={t("home.v2_watching_subtitle")}
      plates={plates}
      loading={loading}
      hasError={hasError}
    />
  );
}

export function HomeV2Trending() {
  const { t } = useLocale();
  const { plates, loading, hasError } =
    useHomepageListings(getTrendingListings);

  return (
    <PlateGridSection
      badge={t("home.trending_badge")}
      badgeIcon="/home-v2/icon-trending.svg"
      title={t("home.v2_trending_plates_title")}
      plates={plates}
      loading={loading}
      hasError={hasError}
      seeAll
    />
  );
}
