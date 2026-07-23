"use client";

import Link from "next/link";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import { useLocale } from "@/context/LocaleContext";

export default function HomeV2Hero() {
  const { locale, t } = useLocale();

  return (
    <section className="overflow-hidden bg-[#f2faef]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(10,47,148,0.2)] bg-[rgba(10,47,148,0.05)] px-3.5 py-1.5">
            <HomeV2Icon src="/home-v2/icon-shield.svg" size={14} />
            <span className="text-xs font-medium tracking-[0.6px] text-[#152e2b] uppercase">
              {t("home.hero_badge")}
            </span>
          </div>

          <h1 className="font-serif text-5xl leading-[1.02] font-semibold tracking-[-0.03em] text-[#152e2b] sm:text-6xl lg:text-[72px] lg:leading-[1.02]">
            {t("home.hero_title_1")}
            <br />
            <span className="bg-linear-to-r from-[#152e2b] to-[#00664e] bg-clip-text text-transparent">
              {t("home.hero_title_2")}
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-7 text-[#545e6f]">
            {t("home.hero_subtitle")}
          </p>

          <div className="pt-2">
            <Link
              href={`/${locale}/marketplace`}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#152e2b] to-[#00664e] px-6 py-3 text-sm font-medium text-[#fbfaf6] shadow-[0_30px_60px_-25px_rgba(1,15,81,0.35)] transition-opacity hover:opacity-90"
            >
              {t("home.hero_browse")}
              <HomeV2Icon src="/home-v2/icon-arrow.svg" size={16} />
            </Link>
          </div>

          <div className="flex max-w-lg gap-6 border-t border-[#d9dee6]/80 pt-6 sm:gap-10">
            <div>
              <div className="font-serif text-2xl font-semibold tracking-tight text-[#152e2b]">
                {locale === "ar" ? "مليار 2.4" : "AED 2.4B"}
              </div>
              <div className="mt-1 text-xs text-[#545e6f]">
                {t("home.hero_stats_plates")}
              </div>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold tracking-tight text-[#152e2b]">
                12,400+
              </div>
              <div className="mt-1 text-xs text-[#545e6f]">
                {t("home.hero_stats_bidders")}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:pl-4">
          <div className="rounded-2xl border border-[#d9dee6] bg-white/95 p-6 shadow-[0_30px_60px_rgba(21,46,43,0.2)] sm:p-8">
            <p className="mb-4 text-xs tracking-[0.6px] text-[#545e6f] uppercase">
              {t("home.v2_hero_card_label")}
            </p>

            <NumberPlateDisplay
              plate_code="M"
              plate_digits="7"
              emirate="DUBAI"
              plateVariant="private_new_colorful"
              crop="card"
            />

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <div className="text-xs text-[#545e6f]">{t("home.hero_asking")}</div>
                <div className="font-serif text-3xl font-semibold tracking-tight text-[#081123]">
                  <DirhamAmount amount={12_500_000} weight="bold" />
                </div>
              </div>
              <Link
                href={`/${locale}/marketplace`}
                className="inline-flex items-center gap-1 rounded-full bg-[#152e2b] px-4 py-2 text-sm font-medium text-[#fbfaf6] transition-opacity hover:opacity-90"
              >
                {t("home.hero_view")}
                <HomeV2Icon src="/home-v2/icon-arrow.svg" size={16} />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { value: t("home.hero_single_digit"), label: t("home.hero_pattern") },
                { value: "8,421", label: t("home.hero_views") },
                { value: "4.9★", label: t("home.hero_seller") },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center rounded-md bg-[rgba(21,46,43,0.02)] p-3 text-center"
                >
                  <div className="font-serif text-base font-semibold tracking-tight text-[#152e2b]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#545e6f]">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-5 flex justify-center">
              <HomeV2Icon src="/home-v2/dots.svg" width={36} height={8} />
            </div>
          </div>

          <Link
            href={`/${locale}/auctions`}
            className="rounded-xl border border-[rgba(212,12,26,0.3)] bg-[#fff6f6] p-4 transition-opacity hover:opacity-90 sm:p-[17px]"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#d40c1a] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#d40c1a]" />
              </span>
              <span className="text-xs font-semibold tracking-[0.6px] text-[#2b1500] uppercase">
                {t("home.v2_hero_auction_label")}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-serif text-lg font-semibold tracking-tight text-[#081123]">
                {t("home.v2_hero_auctioning")}
              </span>
              <span className="font-serif text-lg font-semibold tracking-tight text-[#152e2b]">
                {t("home.v2_hero_auction_value")}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
