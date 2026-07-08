"use client";
import { useLocale } from "@/context/LocaleContext";

export default function PlateHero() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="flex flex-col gap-6">
      {/* Large Plate Display Card */}
      <div className="bg-[#F3F4F8] border border-gray-200 rounded-2xl p-12 md:p-16 flex items-center justify-center shadow-sm">
        <div className="text-center">
          <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">
            DUBAI
          </div>
          <div
            className={`flex items-center justify-center gap-8 text-8xl md:text-9xl font-serif font-bold text-[#0A3B9E] leading-none ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span>M</span>
            <span className="text-gray-300 font-light text-5xl">|</span>
            <span>7</span>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Escrow Protected */}
        <div
          className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${isRTL ? "text-right" : "text-left"}`}
        >
          <div
            className={`flex items-center gap-2 text-[#0A3B9E] mb-1 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h4 className="font-semibold text-sm text-[#041443]">
            {t("listings.escrow_protected_title")}
          </h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {t("listings.escrow_protected_desc")}
          </p>
        </div>

        {/* Card 2: Decision Window */}
        <div
          className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${isRTL ? "text-right" : "text-left"}`}
        >
          <div
            className={`flex items-center gap-2 text-[#0A3B9E] mb-1 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h4 className="font-semibold text-sm text-[#041443]">
            {t("listings.window_title")}
          </h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {t("listings.window_desc")}
          </p>
        </div>

        {/* Card 3: Seller Rating */}
        <div
          className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${isRTL ? "text-right" : "text-left"}`}
        >
          <div
            className={`flex items-center gap-2 text-[#0A3B9E] mb-1 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h4 className="font-semibold text-sm text-[#041443]">
            {t("listings.seller_rating_title")}
          </h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {t("listings.seller_rating_desc")}
          </p>
        </div>

        {/* Card 4: Views */}
        <div
          className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${isRTL ? "text-right" : "text-left"}`}
        >
          <div
            className={`flex items-center gap-2 text-[#0A3B9E] mb-1 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h4 className="font-semibold text-sm text-[#041443]">
            {t("listings.views_title")}
          </h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {t("listings.views_desc")}
          </p>
        </div>
      </div>
    </div>
  );
}
