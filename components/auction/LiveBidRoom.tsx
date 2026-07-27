"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import AuctionTimer from "./AuctionTimer";
import BidInput from "./BidInput";
import type { AuctionSummaryData } from "./types";
import type {
  MarketplaceAuction,
  MarketplaceAuctionBid,
} from "@/services/marketplace";
import { getAuctionBids } from "@/services/marketplace";

interface LiveBidRoomProps {
  listingId: string | number;
  auction: MarketplaceAuction;
  summary: AuctionSummaryData;
}

export default function LiveBidRoom({
  listingId,
  auction: initialAuction,
  summary,
}: LiveBidRoomProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const [auction, setAuction] = useState(initialAuction);
  const [bids, setBids] = useState<MarketplaceAuctionBid[]>([]);
  const [loadingBids, setLoadingBids] = useState(true);

  const refreshBids = useCallback(async () => {
    try {
      const response = await getAuctionBids(listingId, locale);
      setBids(response.data.bids || []);
    } catch {
      setBids([]);
    } finally {
      setLoadingBids(false);
    }
  }, [listingId, locale]);

  useEffect(() => {
    setAuction(initialAuction);
  }, [initialAuction]);

  useEffect(() => {
    refreshBids();
    const interval = setInterval(refreshBids, 15000);
    return () => clearInterval(interval);
  }, [refreshBids]);

  const handleBidPlaced = (nextAuction: MarketplaceAuction) => {
    setAuction(nextAuction);
    refreshBids();
  };

  return (
    <div
      className="rounded-2xl border bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5"
      style={{ borderColor: getColor("border") }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2
          className="text-[18px] font-semibold"
          style={{ color: getColor("primaryText") }}
        >
          {t("auctions.live_badge")}
        </h2>
        <AuctionTimer endsAt={auction.ends_at} />
      </div>

      <BidInput
        listingId={listingId}
        auction={auction}
        onBidPlaced={handleBidPlaced}
      />

      <div>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: getColor("primaryText") }}
        >
          {t("auctions.current_bids")}
        </h3>

        {loadingBids ? (
          <p className="text-sm" style={{ color: getColor("mutedText") }}>
            {t("common.loading") || "Loading..."}
          </p>
        ) : bids.length === 0 ? (
          <p className="text-sm" style={{ color: getColor("mutedText") }}>
            {t("common.no_results") || "No bids yet."}
          </p>
        ) : (
          <ul className="space-y-2">
            {bids.slice(0, 5).map((bid) => (
              <li
                key={bid.id}
                className="flex items-center justify-between text-sm rounded-xl border px-3 py-2"
                style={{ borderColor: getColor("border") }}
              >
                <span style={{ color: getColor("secondaryText") }}>
                  {bid.bidder?.name || "—"}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: getColor("primaryText") }}
                >
                  {typeof bid.amount === "number"
                    ? bid.amount.toLocaleString()
                    : bid.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs" style={{ color: getColor("mutedText") }}>
        {t("auctions.summary_min_deposit")}:{" "}
        {summary.minimumDeposit.toLocaleString()}
      </p>
    </div>
  );
}
