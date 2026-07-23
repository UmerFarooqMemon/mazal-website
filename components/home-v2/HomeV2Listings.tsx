"use client";

import Link from "next/link";
import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import HomeV2PlateCard from "@/components/home-v2/HomeV2PlateCard";
import {
  TRENDING_PLATES,
  WATCHING_PLATES,
} from "@/components/home-v2/plates-data";
import { useLocale } from "@/context/LocaleContext";
import type { HomeV2Plate } from "@/components/home-v2/HomeV2PlateCard";

function PlateGridSection({
  badge,
  badgeIcon,
  title,
  subtitle,
  plates,
  seeAll,
}: {
  badge: string;
  badgeIcon: string;
  title: string;
  subtitle?: string;
  plates: HomeV2Plate[];
  seeAll?: boolean;
}) {
  const { locale, t } = useLocale();

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
              <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plates.map((plate) => (
            <HomeV2PlateCard key={plate.id} plate={plate} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeV2Watching() {
  const { t } = useLocale();

  return (
    <PlateGridSection
      badge={t("home.v2_watching_badge")}
      badgeIcon="/home-v2/icon-trending.svg"
      title={t("home.trending_title")}
      subtitle={t("home.v2_watching_subtitle")}
      plates={WATCHING_PLATES}
    />
  );
}

export function HomeV2Trending() {
  const { t } = useLocale();

  return (
    <PlateGridSection
      badge={t("home.trending_badge")}
      badgeIcon="/home-v2/icon-trending.svg"
      title={t("home.v2_trending_plates_title")}
      plates={TRENDING_PLATES}
      seeAll
    />
  );
}
