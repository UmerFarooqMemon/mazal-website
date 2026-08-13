"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import { ListingInlineStatusBadge } from "@/components/marketplace/ListingStatusBadge";
import { formatCountdown } from "./mappers";
import type { AuctionListing } from "./types";
import {
  AuctionKindBadge,
  AuctionLiveStatusBadge,
} from "./AuctionStatusBadges";

interface AuctionListingCardProps {
  auction: AuctionListing;
}

export default function AuctionListingCard({ auction }: AuctionListingCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isTimedStart =
    auction.status === "scheduled" ||
    auction.status === "upcoming" ||
    auction.status === "starting_soon" ||
    auction.status === "paused";
  const countdownTarget = isTimedStart ? auction.startsAt : auction.endsAt;
  const [timeLabel, setTimeLabel] = useState(() =>
    countdownTarget ? formatCountdown(countdownTarget) : "—",
  );

  useEffect(() => {
    if (!countdownTarget) {
      setTimeLabel("—");
      return;
    }

    const update = () => setTimeLabel(formatCountdown(countdownTarget));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [countdownTarget]);

  return (
    <Link
      href={`/${locale}/auctions/${auction.id}`}
      data-listing-status={auction.marketplaceStatus}
      className="relative block bg-white rounded-[18px] border p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.07)] transition-shadow"
      style={{ borderColor: getColor("border") }}
    >
      <div
        className="flex items-center justify-end gap-1.5 mb-3 text-[12px]"
        style={{ color: getColor("mutedText") }}
      >
        <Eye className="w-3.5 h-3.5" />
        <span>{auction.views.toLocaleString()}</span>
      </div>

      <div className="relative mb-4">
        <NumberPlateDisplay
          plate_code={auction.code}
          plate_digits={auction.digits}
          emirate={auction.emirate}
          preview={auction.preview}
          plateVariant={auction.plateVariant}
          plateType={auction.plateType}
          plateDesign={auction.plateDesign}
          crop="card"
          hideCode={Boolean(auction.hideCode)}
          scaleFontToWidth
          fontScaleMultiplier={2.3}
        />
      </div>

      <div className="mb-4 min-h-6">
        <ListingInlineStatusBadge
          status={auction.marketplaceStatus}
          previouslySold={auction.previouslySold}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <AuctionKindBadge kind={auction.kind} />
        <AuctionLiveStatusBadge status={auction.status} />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: getColor("mutedText") }}
          >
            {auction.currentHighBid != null
              ? t("auctions.current_bid")
              : t("listings.asking_price")}
          </div>
          <div
            className="text-[18px] sm:text-[20px] font-bold"
            style={{ color: getColor("primaryText") }}
          >
            <DirhamAmount
              amount={
                auction.currentHighBid != null
                  ? auction.currentHighBid
                  : auction.askingPrice
              }
              weight="bold"
            />
          </div>
        </div>

        <div className="text-end">
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
            {timeLabel}
          </div>
        </div>
      </div>
    </Link>
  );
}
