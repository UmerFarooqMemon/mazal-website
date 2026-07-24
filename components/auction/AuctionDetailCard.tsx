"use client";

import Link from "next/link";
import { Clock, Gavel } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { Button, DirhamAmount } from "@/components/ui";
import DirhamSymbolIcon from "@/components/ui/DirhamSymbolIcon";
import type { AuctionListing } from "./types";

interface AuctionDetailCardProps {
  auction: AuctionListing;
}

export default function AuctionDetailCard({ auction }: AuctionDetailCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  return (
    <div
      className="rounded-[24px] p-5 sm:p-7 md:p-8"
      style={{
        background:
          "linear-gradient(160deg, #F7F1E4 0%, #F3EADA 45%, #EFE4D2 100%)",
      }}
    >
      <div
        className={`flex items-center justify-between gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span className="bg-[#FEE2E2] text-[#DC2626] text-[11px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
          {t("auctions.live_badge")}
        </span>
        <span
          className="text-[13px] font-medium"
          style={{ color: getColor("primaryText") }}
        >
          {t("auctions.current_bids")}: {auction.currentBids ?? 5}
        </span>
      </div>

      <div className="bg-white rounded-[20px] p-4 sm:p-8 mb-5 shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
        <NumberPlateDisplay
          plate_code={auction.code}
          plate_digits={auction.digits}
          emirate={auction.emirate}
          plateVariant={auction.plateVariant}
          crop="card"
        />
      </div>

      <div
        className={`bg-white rounded-[18px] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 ${isRTL ? "lg:flex-row-reverse" : ""}`}
      >
        <div
          className={`flex-1 flex flex-col sm:flex-row gap-4 sm:gap-8 ${isRTL ? "sm:flex-row-reverse" : ""}`}
        >
          <div className={`flex items-start gap-2.5 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
            <span
              className="mt-0.5 shrink-0 inline-flex"
              style={{ color: getColor("primary") }}
            >
              <DirhamSymbolIcon className="w-5 h-5" />
            </span>
            <div>
              <div
                className="text-[12px] mb-0.5"
                style={{ color: getColor("mutedText") }}
              >
                {t("auctions.current_price")}
              </div>
              <div
                className="text-[20px] sm:text-[22px] font-bold"
                style={{ color: getColor("success") }}
              >
                <DirhamAmount amount={auction.currentBid} weight="bold" />
              </div>
            </div>
          </div>

          <div className={`flex items-start gap-2.5 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
            <Clock
              className="w-5 h-5 mt-0.5 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <div>
              <div
                className="text-[12px] mb-0.5"
                style={{ color: getColor("mutedText") }}
              >
                {t("auctions.time_left")}
              </div>
              <div
                className="text-[20px] sm:text-[22px] font-bold tabular-nums"
                style={{ color: getColor("success") }}
              >
                {auction.timeLeft || "1m: 12 S"}
              </div>
            </div>
          </div>
        </div>

        <Link href={`/${locale}/auctions/${auction.id}/register`} className="shrink-0 w-full lg:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full lg:w-auto rounded-xl px-6"
            leftIcon={<Gavel className="w-4 h-4" />}
          >
            {t("auctions.add_deposit_cta")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
