"use client";
import Link from "next/link";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { useLocale } from "@/context/LocaleContext";
import { Button, DirhamAmount } from "@/components/ui";

// Mock data for upcoming auctions
const upcomingAuctions = [
  {
    id: 2,
    emirate: "ABU DHABI",
    plate_code: "1",
    plate_digits: "88",
    code: "1 | 88",
    title: "Abu Dhabi · 1 88",
    time: "Tonight 21:00",
    price: 4800000,
  },
  {
    id: 3,
    emirate: "ABU DHABI",
    plate_code: "13",
    plate_digits: "9",
    code: "13 | 9",
    title: "Abu Dhabi · 13 9",
    time: "Fri 22 Jun, 20:00",
    price: 2200000,
  },
  {
    id: 4,
    emirate: "DUBAI",
    plate_code: "K",
    plate_digits: "55",
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

function PlatePreview({
  emirate,
  plate_code,
  plate_digits,
}: {
  emirate: string;
  plate_code: string;
  plate_digits: string;
}) {
  return (
    <div className="w-27.5 sm:w-35 shrink-0 overflow-hidden">
      <NumberPlateDisplay
        plate_code={plate_code}
        plate_digits={plate_digits}
        emirate={emirate}
        plateVariant="private_new_colorful"
        crop="compact"
        scaleFontToWidth
        wrapperClassName="w-full overflow-hidden"
      />
    </div>
  );
}

export default function UpcomingAuctionRow() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="flex flex-col gap-4 w-full">
      {upcomingAuctions.map((auction) => (
        <div
          key={auction.id}
          className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow w-full ${isRTL ? "rtl" : "ltr"}`}
        >
          {/* Mobile Layout - Vertical Stack */}
          <div className="flex flex-col sm:hidden gap-3">
            {/* Top Row: Plate Image + Details */}
            <div
              className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {/* Plate Image */}
              <PlatePreview
                emirate={auction.emirate}
                plate_code={auction.plate_code}
                plate_digits={auction.plate_digits}
              />

              {/* Details */}
              <div
                className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}
              >
                <div className="font-medium text-[#041443] text-sm truncate">
                  {auction.title}
                </div>
                <div
                  className={`text-xs text-gray-400 flex items-center gap-1 mt-0.5 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="truncate">{auction.time}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Price + Button */}
            <div
              className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div className={isRTL ? "text-left" : "text-right"}>
                <div className="text-[10px] text-gray-400 font-medium">
                  {t("auctions.opening_bid")}
                </div>
                <div className="text-base font-bold text-[#041443]">
                  <DirhamAmount amount={auction.price} weight="bold" />
                </div>
              </div>
              <Link href={`/${locale}/auctions/${auction.id}/register`}>
                <Button
                  variant="primary"
                  size="sm"
                  className="px-4 py-2 text-xs whitespace-nowrap rounded-full"
                >
                  {t("auctions.pre_register")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Layout - Horizontal Row */}
          <div
            className={`hidden sm:flex items-center gap-4 lg:gap-6 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {/* Plate Image */}
            <PlatePreview
              emirate={auction.emirate}
              plate_code={auction.plate_code}
              plate_digits={auction.plate_digits}
            />

            {/* Auction Details */}
            <div
              className={`grow min-w-0 ${isRTL ? "text-right" : "text-left"}`}
            >
              <div className="font-medium text-[#041443] truncate">
                {auction.title}
              </div>
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
                <span className="truncate">{auction.time}</span>
              </div>
            </div>

            {/* Price and Register Button */}
            <div
              className={`flex items-center gap-4 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div className={isRTL ? "text-left" : "text-right"}>
                <div className="text-[10px] text-gray-400 font-medium">
                  {t("auctions.opening_bid")}
                </div>
                <div className="text-lg font-bold text-[#041443] whitespace-nowrap">
                  <DirhamAmount amount={auction.price} weight="bold" />
                </div>
              </div>
              <Link href={`/${locale}/auctions/${auction.id}/register`}>
                <Button
                  variant="primary"
                  size="sm"
                  className="px-5 py-1.5 whitespace-nowrap rounded-full"
                >
                  {t("auctions.pre_register")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
