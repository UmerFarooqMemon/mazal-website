"use client";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import AuctionCard from "../../../components/auction/AuctionCard";
import UpcomingAuctionRow from "../../../components/auction/UpcomingAuctionRow";

export default function AuctionsPage() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ---- Part One: Title & Badge ---- */}
        <div
          className={`flex flex-col mb-16 ${isRTL ? "items-end" : "items-start"}`}
        >
          {/* Container for proper alignment */}
          <div className={`max-w-3xl ${isRTL ? "text-right" : "text-left"}`}>
            {/* Badge */}
            <div
              className={`flex items-center gap-2 text-[#0A3B9E] text-xs font-bold uppercase tracking-wider mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              {t("auctions.calendar_badge")}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#041443] leading-tight mb-4">
              {t("auctions.title")}
            </h1>

            {/* Subtitle */}
            <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
              {t("auctions.subtitle")}
            </p>
          </div>
        </div>

        {/* ---- Part Two: Live Now ---- */}
        <div
          className={`flex flex-col mb-16 ${isRTL ? "items-end" : "items-start"}`}
        >
          <h2
            className={`text-2xl font-serif font-bold text-[#041443] mb-6 ${isRTL ? "text-right w-full" : "text-left w-full"}`}
          >
            {t("auctions.live_now")}
          </h2>
          <AuctionCard />
        </div>

        {/* ---- Part Three: Upcoming (Full Width) ---- */}
        <div className="mb-8 w-full">
          <h2
            className={`text-2xl font-serif font-bold text-[#041443] mb-6 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("auctions.upcoming")}
          </h2>
          <UpcomingAuctionRow />
        </div>
      </div>
    </div>
  );
}
