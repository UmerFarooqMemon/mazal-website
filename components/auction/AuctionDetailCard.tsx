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

  return (
    <div
      className="rounded-[24px] p-5 sm:p-7 md:p-8"
      style={{
        background:
          "linear-gradient(160deg, #F7F1E4 0%, #F3EADA 45%, #EFE4D2 100%)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <span
          className={`text-[11px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
            auction.status === "live"
              ? "bg-[#FEE2E2] text-[#DC2626]"
              : "bg-[#F3F4F6] text-[#6B7280]"
          }`}
        >
          {auction.status === "live" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
          )}
          {auction.status === "live"
            ? t("auctions.live_badge")
            : t(`auctions.status_${auction.status}`)}
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
          hideCode={Boolean(auction.hideCode)}
          scaleFontToWidth
          fontScaleMultiplier={2.3}
        />
      </div>

      <div className="bg-white rounded-[18px] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-8">
          <div className="flex items-start gap-2.5">
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

          <div className="flex items-start gap-2.5">
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

        <Link href={`/${locale}/auctions/${auction.id}/register`} className="shrink-0">
          <Button
            variant="primary"
            size="sm"
            className="h-9 px-4 text-xs rounded-full"
          >
            <Gavel className="w-4 h-4" strokeWidth={2} />
            <span className="ms-1.5">{t("auctions.add_deposit_cta")}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
