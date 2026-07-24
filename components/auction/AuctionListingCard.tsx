"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import type { AuctionListing, AuctionListingStatus } from "./types";

interface AuctionListingCardProps {
  auction: AuctionListing;
}

const STATUS_STYLES: Record<
  AuctionListingStatus,
  { bg: string; color: string; dot?: string }
> = {
  scheduled: { bg: "#FFF1E6", color: "#C45C1A" },
  live: { bg: "#FEE2E2", color: "#DC2626", dot: "#EF4444" },
  closed: { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  upcoming: { bg: "#EDE9FE", color: "#7C3AED", dot: "#8B5CF6" },
  starting_soon: { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
  paused: { bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
};

export default function AuctionListingCard({ auction }: AuctionListingCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const statusStyle = STATUS_STYLES[auction.status];
  const isTimedStart =
    auction.status === "scheduled" ||
    auction.status === "upcoming" ||
    auction.status === "starting_soon" ||
    auction.status === "paused";

  return (
    <Link
      href={`/${locale}/auctions/${auction.id}`}
      className="block bg-white rounded-[18px] border p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.07)] transition-shadow"
      style={{ borderColor: getColor("border") }}
    >
      <div
        className={`flex items-center justify-end gap-1.5 mb-3 text-[12px] ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ color: getColor("mutedText") }}
      >
        <Eye className="w-3.5 h-3.5" />
        <span>{auction.views.toLocaleString()}</span>
      </div>

      <div className="mb-4">
        <NumberPlateDisplay
          plate_code={auction.code}
          plate_digits={auction.digits}
          emirate={auction.emirate}
          plateVariant={auction.plateVariant}
          crop="card"
        />
      </div>

      <div
        className={`flex flex-wrap items-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: auction.kind === "scheduled" ? "#FFF1E6" : "#DCFCE7",
            color: auction.kind === "scheduled" ? "#C45C1A" : "#15803D",
          }}
        >
          {auction.kind === "scheduled"
            ? t("auctions.badge_scheduled")
            : t("auctions.badge_open")}
        </span>

        {auction.status !== "scheduled" && (
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
            }}
          >
            {statusStyle.dot && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusStyle.dot }}
              />
            )}
            {t(`auctions.status_${auction.status}`)}
          </span>
        )}
      </div>

      <div
        className={`flex items-end justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className={isRTL ? "text-right" : "text-left"}>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: getColor("mutedText") }}
          >
            {t("auctions.current_bid_label")}
          </div>
          <div
            className="text-[18px] sm:text-[20px] font-bold"
            style={{ color: getColor("primaryText") }}
          >
            <DirhamAmount amount={auction.currentBid} weight="bold" />
          </div>
        </div>

        <div className={isRTL ? "text-left" : "text-right"}>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: getColor("mutedText") }}
          >
            {isTimedStart ? t("auctions.starts_in") : t("auctions.ends_in")}
          </div>
          <div
            className="text-[13px] font-semibold tabular-nums"
            style={{ color: getColor("primaryText") }}
          >
            {isTimedStart ? auction.startsIn : auction.endsIn}
          </div>
        </div>
      </div>
    </Link>
  );
}
