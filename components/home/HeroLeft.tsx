"use client";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";

export default function HeroLeft() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  // Use proper locale-based formatter for Arabic statistics
  const formatStatNumber = (value: string | number): string => {
    if (typeof value === "number") {
      return new Intl.NumberFormat("en-US").format(value);
    }
    if (value.toString().includes("B")) {
      return locale === "ar"
        ? value.toString().replace("B", " مليار")
        : value.toString();
    }
    return value.toString();
  };

  return (
    <div
      className={`flex flex-col justify-center ${isRTL ? "items-end text-right" : "items-start text-left"}`}
    >
      {/* Badge */}
      <div
        className={`inline-flex items-center gap-2 bg-[#EEF2F8] text-[#0A3B9E] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 w-fit border border-[#0A3B9E]/10 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        {t("home.hero_badge")}
      </div>

      {/* Main Title */}
      <h1 className="text-5xl md:text-7xl font-serif text-[#041443] leading-[1.1] mb-6">
        {t("home.hero_title_1")} <br />
        {/* ✅ Gradient Text: "with trust built in." */}
        <span className="bg-linear-to-r from-[#041443] via-[#0A3B9E] to-[#0A3B9E] bg-clip-text text-transparent">
          {t("home.hero_title_2")}
        </span>
      </h1>

      {/* Subtext */}
      <p className="text-lg md:text-xl text-gray-500 mb-8 font-sans max-w-lg leading-relaxed">
        {t("home.hero_subtitle")}
      </p>

      {/* Buttons */}
      <div
        className={`flex flex-wrap gap-4 mb-12 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <Link href={`/${locale}/marketplace`}>
          <Button
            variant="primary"
            size="lg"
            className="flex items-center gap-2"
          >
            {t("home.hero_browse")}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          className="bg-white border-gray-200 text-gray-800 hover:bg-gray-50 shadow-sm"
        >
          {t("home.hero_offer")}
        </Button>
      </div>

      {/* Statistics - WITH CORRECT ARABIC FORMATTING */}
      <div
        className={`grid grid-cols-3 gap-8 max-w-md border-t pt-8 border-gray-200 ${isRTL ? "text-right" : "text-left"}`}
      >
        <div>
          <div className="text-2xl font-bold text-[#041443]">
            {locale === "ar" ? "مليار 2.4" : "AED 2.4B"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {t("home.hero_stats_plates")}
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#041443]">
            {formatStatNumber(12400)}+
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {t("home.hero_stats_bidders")}
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#041443]">1%</div>
          <div className="text-xs text-gray-500 mt-1">
            {t("home.hero_stats_fee")}
          </div>
        </div>
      </div>
    </div>
  );
}
