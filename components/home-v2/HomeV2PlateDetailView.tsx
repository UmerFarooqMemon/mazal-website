"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import HomeV2PlateCard from "@/components/home-v2/HomeV2PlateCard";
import {
  getSimilarHomeV2Plates,
  type HomeV2PlateDetail,
} from "@/components/home-v2/plates-data";
import { useLocale } from "@/context/LocaleContext";

type HomeV2PlateDetailViewProps = {
  plate: HomeV2PlateDetail;
};

const LISTING_TYPE_KEYS = {
  direct: "listings.type_direct",
  auction: "listings.type_auction",
  spot: "listings.type_spot",
} as const;

export default function HomeV2PlateDetailView({
  plate,
}: HomeV2PlateDetailViewProps) {
  const { locale, t } = useLocale();
  const similar = getSimilarHomeV2Plates(plate);
  const emirateLabel = t("listings.emirate_dubai");
  const emirateDisplay = plate.emirate ?? "Dubai";
  const digitCount = plate.digits.length;
  const listingType = t(LISTING_TYPE_KEYS[plate.listingTypeKey]);

  const highlightCards = [
    {
      title: t("listings.escrow_protected_title"),
      body: t("listings.escrow_protected_desc"),
      icon: "/home-v2/icon-shield-check.svg",
    },
    {
      title: t("listings.window_title"),
      body: t("listings.window_desc"),
      icon: "/home-v2/icon-clock.svg",
    },
    {
      title: t("listings.seller_rating_title_dynamic").replace(
        "{rating}",
        plate.rating.toFixed(1),
      ),
      body: t("listings.seller_rating_desc_dynamic").replace(
        "{deals}",
        String(plate.sellerDeals),
      ),
      icon: "/home-v2/icon-star.svg",
    },
    {
      title: t("listings.views_title_dynamic").replace(
        "{views}",
        plate.views.toLocaleString("en-US"),
      ),
      body: t("listings.views_desc_dynamic")
        .replace("{watchers}", plate.watchers.toLocaleString("en-US"))
        .replace("{offers}", String(plate.activeOffers)),
      icon: "/home-v2/icon-eye.svg",
    },
  ];

  const digitsValue = t("listings.digits_value")
    .replace("{digits}", plate.digits)
    .replace("{count}", String(digitCount));

  const specRows = [
    { label: t("listings.emirate"), value: emirateLabel },
    { label: t("listings.code"), value: plate.code },
    { label: t("listings.digits"), value: digitsValue },
    { label: t("listings.type"), value: listingType },
  ];

  const description = t("listings.description_template")
    .replace("{emirate}", emirateLabel)
    .replace("{code}", plate.code)
    .replace("{digits}", plate.digits);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${emirateDisplay} ${plate.code} ${plate.digits}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("listings.link_copied"));
      }
    } catch {
      // User cancelled share
    }
  };

  const handleWatchlist = () => {
    toast.success(t("listings.added_to_watchlist"));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
      <nav
        className="mb-8 flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-[0.8px] text-[#7a8494] uppercase"
        aria-label="Breadcrumb"
      >
        <Link
          href={`/${locale}/marketplace`}
          className="transition-colors hover:text-[#152e2b]"
        >
          {t("listings.breadcrumb_marketplace")}
        </Link>
        <span>/</span>
        <span>{emirateLabel}</span>
        <span>/</span>
        <span className="text-[#545e6f]">{listingType}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)] lg:items-start lg:gap-10">
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-[#d9dee6] bg-white px-6 py-10 shadow-[0_1px_2px_rgba(1,15,81,0.06)] sm:px-10 sm:py-14">
            <NumberPlateDisplay
              plate_code={plate.code}
              plate_digits={plate.digits}
              emirate={emirateDisplay.toUpperCase()}
              plateVariant="private_new_colorful"
              crop="hero"
              wrapperClassName="mx-auto w-full max-w-xl overflow-hidden"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {highlightCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-[#e4e8ee] bg-white px-4 py-4"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <HomeV2Icon src={card.icon} size={16} />
                  <h3 className="text-sm font-semibold text-[#081123]">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs leading-5 text-[#545e6f]">{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-[#e4e8ee] bg-white p-6 shadow-[0_8px_28px_-12px_rgba(1,15,81,0.18)]">
            <div className="mb-6">
              <p className="mb-1 text-[10px] font-semibold tracking-[1px] text-[#7a8494] uppercase">
                {t("listings.asking_price")}
              </p>
              <div className="font-serif text-4xl font-semibold tracking-tight text-[#081123] sm:text-[42px]">
                <DirhamAmount amount={plate.price} weight="bold" />
              </div>
              <p className="mt-2 text-xs text-[#7a8494]">
                {t("listings.fees_breakdown")}
              </p>
            </div>

            <div className="mb-6 flex flex-col gap-3">
              <Link
                href={`/${locale}/marketplace`}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[#152e2b] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {t("listings.buy_escrow")}
              </Link>
              <Link
                href={`/${locale}/marketplace`}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#152e2b] bg-white px-4 text-sm font-medium text-[#081123] transition-colors hover:bg-[#f2faef]"
              >
                {t("listings.make_offer")}
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleWatchlist}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#d9dee6] bg-white text-sm font-medium text-[#081123] transition-colors hover:bg-[#f7f8fa]"
                >
                  <HomeV2Icon src="/home-v2/icon-heart.svg" size={16} />
                  {t("listings.watchlist")}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#d9dee6] bg-white text-sm font-medium text-[#081123] transition-colors hover:bg-[#f7f8fa]"
                >
                  <HomeV2Icon src="/home-v2/icon-share.svg" size={16} />
                  {t("listings.share")}
                </button>
              </div>
            </div>

            <dl className="divide-y divide-[#eef1f5] border-t border-[#eef1f5]">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <dt className="text-sm text-[#7a8494]">{row.label}</dt>
                  <dd className="text-sm font-medium text-[#081123]">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      <section className="mt-10 max-w-3xl lg:mt-12">
        <h2 className="mb-3 font-serif text-2xl tracking-tight text-[#081123]">
          {t("listings.description_heading")}
        </h2>
        <p className="text-sm leading-6 text-[#545e6f]">{description}</p>
      </section>

      {similar.length > 0 ? (
        <section className="mt-12 lg:mt-14">
          <div className="mb-6">
            <h2 className="font-serif text-2xl tracking-tight text-[#081123]">
              {t("listings.similar_title")}
            </h2>
            <p className="mt-1 text-sm text-[#545e6f]">
              {t("listings.similar_subtitle")}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <HomeV2PlateCard key={item.id} plate={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
