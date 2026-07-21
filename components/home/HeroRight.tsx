"use client";
import Link from "next/link";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";

export default function HeroRight() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  // Formatter for the large price (AED only)
  const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 0,
  });

  const formattedLargePriceParts = priceFormatter.format(12500000).split(" ");
  const largeCurrencySymbol = formattedLargePriceParts[0];
  const largeNumberPart = formattedLargePriceParts.slice(1).join(" ");

  const formattedAuctionPriceParts = priceFormatter.format(6200000).split(" ");
  const auctionCurrencySymbol = formattedAuctionPriceParts[0];
  const auctionNumberPart = formattedAuctionPriceParts.slice(1).join(" ");

  const formattedViews = new Intl.NumberFormat("en-US").format(8421);
  const formattedBidders = new Intl.NumberFormat("en-US").format(23);

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-end">
      <div
        className={`w-full flex flex-col items-end ${isRTL ? "items-start" : "items-end"}`}
      >
        {/* The Big Card */}
        <div className="w-full bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-6 border border-gray-100 z-10">
          <div
            className={`text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-4 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("home.hero_featured_label")}
          </div>

          <div className="mb-6">
            <NumberPlateDisplay
              plate_code="M"
              plate_digits="7"
              emirate="DUBAI"
              plateVariant="private_new_colorful"
              crop="card"
            />
          </div>

          <div
            className={`flex justify-between items-end mb-6 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className="text-xs text-gray-400 font-medium">
                {t("home.hero_asking")}
              </div>
              <div
                className={`flex text-2xl font-bold text-[#041443] items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : "flex-row justify-start"}`}
              >
                {isRTL ? (
                  <>
                    <span>{largeNumberPart}</span>
                    <span>{largeCurrencySymbol}</span>
                  </>
                ) : (
                  <>
                    <span>{largeCurrencySymbol}</span>
                    <span>{largeNumberPart}</span>
                  </>
                )}
              </div>
            </div>

            <Link href={`/${locale}/listings/1`}>
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-1 px-5 py-2.5 rounded-full"
              >
                {t("home.hero_view")}
                <span className="text-[10px]">{isRTL ? "←" : "→"}</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F3F4F8] rounded-lg p-3 text-center">
              <div className="text-xs font-medium text-gray-800">
                {t("home.hero_single_digit")}
              </div>
              <div className="text-[10px] text-gray-500">
                {t("home.hero_pattern")}
              </div>
            </div>
            <div className="bg-[#F3F4F8] rounded-lg p-3 text-center">
              <div className="text-xs font-medium text-gray-800">
                {formattedViews}
              </div>
              <div className="text-[10px] text-gray-500">
                {t("home.hero_views")}
              </div>
            </div>
            <div className="bg-[#F3F4F8] rounded-lg p-3 text-center">
              <div className="text-xs font-medium text-gray-800">4.9★</div>
              <div className="text-[10px] text-gray-500">
                {t("home.hero_seller")}
              </div>
            </div>
          </div>
        </div>

        {/* The small card */}
        <div className="w-full bg-[#EBDCCB]/50 backdrop-blur-sm border border-[#D4AF37]/20 rounded-xl p-4 mt-4 z-0 shadow-sm">
          <div
            className={`flex justify-between items-center mb-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-semibold text-gray-800">
                {t("home.hero_auction_label").replace("23", formattedBidders)}
              </span>
            </div>
            <span className="text-[10px] font-medium text-gray-600">
              {t("home.hero_closes")} 00:42
            </span>
          </div>
          <div
            className={`flex justify-between items-end ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className="text-sm font-medium text-[#041443]">
                {t("home.hero_dubai_t")}
              </div>
            </div>
            <div
              className={`flex text-base font-bold text-[#0A3B9E] items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : "flex-row justify-start"}`}
            >
              {isRTL ? (
                <>
                  <span>{auctionNumberPart}</span>
                  <span>{auctionCurrencySymbol}</span>
                </>
              ) : (
                <>
                  <span>{auctionCurrencySymbol}</span>
                  <span>{auctionNumberPart}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
