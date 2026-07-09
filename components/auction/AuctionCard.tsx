"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";

// Helper function to format numbers consistently
function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function AuctionCard() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-[#D4AF37]/30 shadow-[0_8px_30px_rgb(0,0,0,0.05)] p-6">
      {/* Card Header */}
      <div
        className={`flex justify-between items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          {t("auctions.live_badge")}
        </span>
        <span className="text-[#041443] text-xs font-medium">
          {t("auctions.closes")} 00:42
        </span>
      </div>

      {/* ✅ Panel Box with Image instead of Text */}
      <Link href={`/${locale}/auctions/1`}>
        <div className="relative w-full aspect-2.5/1 rounded-xl mb-6 bg-white overflow-hidden hover:bg-gray-100 transition-colors cursor-pointer">
          <Image
            src="/home-new.png"
            alt="Live Auction Plate"
            fill
            className="object-contain"
          />
        </div>
      </Link>

      {/* Price and number of bidders */}
      <div
        className={`flex justify-between items-center ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className={isRTL ? "text-right" : "text-left"}>
          <div className="text-xs text-gray-400 font-medium">
            {t("auctions.current_bid")}
          </div>
          <div className="text-3xl font-bold text-[#041443]">
            AED {formatPrice(6200000)}
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 text-gray-500 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>23 {t("auctions.bidders")}</span>
        </div>
      </div>
    </div>
  );
}
