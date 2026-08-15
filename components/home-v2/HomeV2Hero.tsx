"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import { mapListingToHomeV2Plate } from "@/components/home-v2/HomeV2PlateCard";
import { useLocale } from "@/context/LocaleContext";
import {
  fetchHomepageStatsClient,
  type HomepageStats,
} from "@/services/homepage";
import {
  getFeaturedAuctionListings,
  type MarketplaceListingCard,
} from "@/services/marketplace";

export default function HomeV2Hero() {
  const { locale, t } = useLocale();
  const isRTL = locale === "ar";
  const [listings, setListings] = useState<MarketplaceListingCard[]>([]);
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pauseAutoplay, setPauseAutoplay] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 1023px)").matches
      : true,
  );
  const swipeStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const resumeTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    getFeaturedAuctionListings(locale)
      .then((response) => {
        if (!active) return;
        setListings(response.data.listings || []);
        setActiveIndex(0);
      })
      .catch(() => {
        if (active) setListings([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    fetchHomepageStatsClient(locale)
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active) setStats(null);
      });

    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMobile || listings.length < 2 || pauseAutoplay) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % listings.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isMobile, listings.length, pauseAutoplay]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current != null) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  const goToSlide = (index: number) => {
    if (listings.length < 2) return;
    const next = (index + listings.length) % listings.length;
    setActiveIndex(next);
  };

  const pauseThenResumeAutoplay = () => {
    setPauseAutoplay(true);
    if (resumeTimer.current != null) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      setPauseAutoplay(false);
      resumeTimer.current = null;
    }, 8000);
  };

  const onSwipeStart = (clientX: number) => {
    swipeStartX.current = clientX;
    didSwipe.current = false;
  };

  const onSwipeEnd = (clientX: number) => {
    const startX = swipeStartX.current;
    swipeStartX.current = null;
    if (startX == null || listings.length < 2) return;

    const deltaX = clientX - startX;
    const threshold = 40;
    if (Math.abs(deltaX) < threshold) return;

    didSwipe.current = true;
    if (!isMobile) pauseThenResumeAutoplay();
    const swipedNext = isRTL ? deltaX > 0 : deltaX < 0;
    goToSlide(activeIndex + (swipedNext ? 1 : -1));
  };

  const featuredListing = listings[activeIndex];
  const featuredPlate = featuredListing
    ? mapListingToHomeV2Plate(featuredListing)
    : null;
  const featuredHref = featuredListing
    ? `/${locale}/listings/${featuredListing.id}`
    : `/${locale}/auctions`;
  const digitPattern =
    featuredListing?.digit_count === 1
      ? t("home.hero_single_digit")
      : `${featuredListing?.digit_count ?? 0} ${t("home.digits")}`;

  return (
    <section className="overflow-hidden bg-[var(--color-background)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] px-3.5 py-1.5">
            <HomeV2Icon src="/home-v2/icon-shield.svg" size={14} />
            <span className="text-xs font-medium tracking-[0.6px] text-[var(--color-primary)] uppercase">
              {t("home.hero_badge")}
            </span>
          </div>

          <h1 className="font-serif text-5xl leading-[1.02] font-semibold tracking-[-0.03em] text-[var(--color-primary)] sm:text-6xl lg:text-[72px] lg:leading-[1.02]">
            {t("home.hero_title_1")}
            <br />
            <span className="bg-linear-to-r from-[var(--color-btn-primary)] to-[var(--color-btn-primary-hover)] bg-clip-text text-transparent">
              {t("home.hero_title_2")}
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-7 text-[var(--color-muted-text)]">
            {t("home.hero_subtitle")}
          </p>

          <div className="pt-2">
            <Link
              href={`/${locale}/marketplace`}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[var(--color-btn-primary)] to-[var(--color-btn-primary-hover)] px-6 py-3 text-sm font-medium text-[var(--color-text-light)] shadow-[0_30px_60px_-25px_rgba(1,15,81,0.35)] transition-opacity hover:opacity-90"
            >
              {t("home.hero_browse")}
              <HomeV2Icon
                src="/home-v2/icon-arrow-light.svg"
                size={16}
                className={isRTL ? "-scale-x-100" : ""}
              />
            </Link>
          </div>

          <div className="flex max-w-lg gap-6 border-t border-[var(--color-border)]/80 pt-6 sm:gap-10">
            <div>
              <div className="font-serif text-2xl font-semibold tracking-tight text-[var(--color-primary)]">
                {stats?.plates_transacted.display ?? "—"}
              </div>
              <div className="mt-1 text-xs text-[var(--color-muted-text)]">
                {t("home.hero_stats_plates")}
              </div>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold tracking-tight text-[var(--color-primary)]">
                {stats?.verified_bidders.display ?? "—"}
              </div>
              <div className="mt-1 text-xs text-[var(--color-muted-text)]">
                {t("home.hero_stats_bidders")}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:pl-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_95%,transparent)] p-6 shadow-[0_30px_60px_rgba(21,46,43,0.2)] sm:p-8">
            <p className="mb-4 text-xs tracking-[0.6px] text-[var(--color-muted-text)] uppercase">
              {t("home.v2_hero_card_label")}
            </p>

            {loading ? (
              <div className="flex min-h-72 items-center justify-center text-sm text-[var(--color-muted-text)]">
                {t("common.loading")}
              </div>
            ) : !featuredListing || !featuredPlate ? (
              <div className="flex min-h-72 items-center justify-center text-center text-sm text-[var(--color-muted-text)]">
                {t("common.no_results")}
              </div>
            ) : (
              <div
                className="touch-pan-y"
                onPointerDown={(event) => {
                  if (event.pointerType === "mouse") return;
                  onSwipeStart(event.clientX);
                }}
                onPointerUp={(event) => {
                  if (event.pointerType === "mouse") return;
                  onSwipeEnd(event.clientX);
                }}
                onPointerCancel={() => {
                  swipeStartX.current = null;
                }}
                onClickCapture={(event) => {
                  if (!didSwipe.current) return;
                  event.preventDefault();
                  event.stopPropagation();
                  didSwipe.current = false;
                }}
              >
                <div
                  className={
                    listings.length > 1
                      ? "flex items-center gap-2 lg:block"
                      : undefined
                  }
                >
                  {listings.length > 1 ? (
                    <button
                      type="button"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_4px_12px_rgba(21,46,43,0.16)] lg:hidden"
                      onClick={() =>
                        goToSlide(activeIndex + (isRTL ? 1 : -1))
                      }
                      aria-label="Previous"
                    >
                      <HomeV2Icon
                        src="/home-v2/icon-arrow-dark.svg"
                        size={14}
                        className="-scale-x-100"
                      />
                    </button>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <NumberPlateDisplay
                      plate_code={featuredPlate.code}
                      plate_digits={featuredPlate.digits}
                      emirate={featuredPlate.emirate}
                      preview={featuredPlate.preview}
                      plateType={featuredPlate.plateType}
                      plateDesign={featuredPlate.plateDesign}
                      crop="card"
                      hideCode={featuredPlate.hideCode}
                      scaleFontToWidth
                      fontScaleMultiplier={2.3}
                    />
                  </div>
                  {listings.length > 1 ? (
                    <button
                      type="button"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_4px_12px_rgba(21,46,43,0.16)] lg:hidden"
                      onClick={() =>
                        goToSlide(activeIndex + (isRTL ? -1 : 1))
                      }
                      aria-label="Next"
                    >
                      <HomeV2Icon
                        src="/home-v2/icon-arrow-dark.svg"
                        size={14}
                      />
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-[var(--color-muted-text)]">
                      {t("home.hero_asking")}
                    </div>
                    <div className="font-serif text-[length:clamp(1.35rem,5vw,1.875rem)] font-semibold tracking-tight text-[var(--color-text-dark)]">
                      <DirhamAmount amount={featuredPlate.price} weight="bold" />
                    </div>
                  </div>
                  <Link
                    href={featuredHref}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-text-light)] transition-opacity hover:opacity-90"
                  >
                    {t("home.hero_view")}
                    <HomeV2Icon
                      src="/home-v2/icon-arrow-light.svg"
                      size={16}
                      className={isRTL ? "-scale-x-100" : ""}
                    />
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { value: digitPattern, label: t("home.hero_pattern") },
                    {
                      value: featuredPlate.views.toLocaleString(
                        locale === "ar" ? "ar-AE" : "en-US",
                      ),
                      label: t("home.hero_views"),
                    },
                    {
                      value: `${featuredPlate.rating.toFixed(1)}★`,
                      label: t("home.hero_seller"),
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center justify-center rounded-md bg-[rgba(21,46,43,0.02)] p-3 text-center"
                    >
                      <div className="font-serif text-base font-semibold tracking-tight text-[var(--color-primary)]">
                        {stat.value}
                      </div>
                      <div className="text-xs text-[var(--color-muted-text)]">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div
                  className="mx-auto mt-5 flex justify-center gap-2"
                  aria-label={t("home.v2_hero_card_label")}
                >
                  {listings.map((listing, index) => (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === activeIndex
                          ? "w-5 bg-[var(--color-primary)]"
                          : "w-2 bg-[var(--color-border)]"
                      }`}
                      aria-label={`${index + 1}`}
                      aria-current={index === activeIndex ? "true" : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {stats?.live_auction.is_live ? (
            <Link
              href={`/${locale}/auctions`}
              className="rounded-xl border border-[color-mix(in_srgb,var(--color-error)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_8%,white)] p-4 transition-opacity hover:opacity-90 sm:p-[17px]"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--color-error)] opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-[var(--color-error)]" />
                </span>
                <span className="text-xs font-semibold tracking-[0.6px] text-[var(--color-text-dark)] uppercase">
                  {`${t("home.v2_hero_live_prefix")} · ${stats.live_auction.trades_count} ${t("home.v2_hero_trades")}`}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-serif text-lg font-semibold tracking-tight text-[var(--color-text-dark)]">
                  {`${t("home.v2_hero_label_auctioning")} : ${stats.live_auction.plates_count} ${t("home.v2_hero_plates")}`}
                </span>
                <span className="font-serif text-lg font-semibold tracking-tight text-[var(--color-primary)]">
                  {`${t("home.v2_hero_label_value")}: ${stats.live_auction.total_value_display}`}
                </span>
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
