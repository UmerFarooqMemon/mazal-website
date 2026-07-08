"use client";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

// Mock data for upcoming auctions
const upcomingAuctions = [
  {
    id: 2,
    emirate: "ABU DHABI",
    code: "1 | 88",
    title: "Abu Dhabi · 1 88",
    time: "Tonight 21:00",
    price: 4800000,
  },
  {
    id: 3,
    emirate: "ABU DHABI",
    code: "13 | 9",
    title: "Abu Dhabi · 13 9",
    time: "Fri 22 Jun, 20:00",
    price: 2200000,
  },
  {
    id: 4,
    emirate: "DUBAI",
    code: "K | 55",
    title: "Dubai · K 55",
    time: "Sat 23 Jun, 21:00",
    price: 680000,
  },
];

// Helper function to format numbers consistently (English numerals only)
function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function UpcomingAuctionRow() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="flex flex-col gap-4 w-full">
      {upcomingAuctions.map((auction) => (
        <div
          key={auction.id}
          className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full ${isRTL ? "sm:flex-row-reverse" : ""}`}
        >
          {/* Small Plate Box */}
          <div className="bg-[#F3F4F8] border border-gray-200 rounded-lg py-3 px-6 min-w-35 flex items-center justify-center gap-2 shrink-0">
            <div className="text-center">
              <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                {auction.emirate}
              </div>
              <div className="flex items-center gap-1.5 text-xl font-serif font-bold text-[#0A3B9E] leading-none">
                {auction.code.split("|").map((part, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {part.trim()}
                    {i === 0 && (
                      <span className="text-gray-300 font-light text-sm">
                        |
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Auction Details */}
          <div className={`grow ${isRTL ? "text-right" : "text-left"}`}>
            <div className="font-medium text-[#041443]">{auction.title}</div>
            <div
              className={`text-xs text-gray-400 flex items-center gap-1.5 mt-0.5 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {auction.time}
            </div>
          </div>

          {/* Price and Register Button */}
          <div
            className={`flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className={isRTL ? "text-left" : "text-right"}>
              <div className="text-[10px] text-gray-400 font-medium">
                {t("auctions.opening_bid")}
              </div>
              <div className="text-lg font-bold text-[#041443]">
                AED {formatPrice(auction.price)}
              </div>
            </div>
            <Link
              href={`/${locale}/auctions/${auction.id}/register`}
              className="bg-[#0A3B9E] text-white px-5 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-800 transition whitespace-nowrap"
            >
              {t("auctions.pre_register")}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
