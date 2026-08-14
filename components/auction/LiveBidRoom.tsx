"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import AuctionTimer from "./AuctionTimer";
import BidInput from "./BidInput";
import AuctionBidsList from "./AuctionBidsList";
import type { AuctionSummaryData } from "./types";
import type {
  MarketplaceAuction,
  MarketplaceAuctionBid,
} from "@/services/marketplace";
import { getAuctionBids, getAuctionState } from "@/services/marketplace";

interface LiveBidRoomProps {
  listingId: string | number;
  auction: MarketplaceAuction;
  summary: AuctionSummaryData;
  canBid?: boolean;
  bidDisabledReason?: string;
  isOwner?: boolean;
  onAuctionUpdated?: (auction: MarketplaceAuction) => void;
}

export default function LiveBidRoom({
  listingId,
  auction: initialAuction,
  summary,
  canBid = true,
  bidDisabledReason,
  isOwner = false,
  onAuctionUpdated,
}: LiveBidRoomProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const [auction, setAuction] = useState(initialAuction);
  const [bids, setBids] = useState<MarketplaceAuctionBid[]>([]);
  const [loadingBids, setLoadingBids] = useState(true);

  const applyAuction = useCallback(
    (nextAuction: MarketplaceAuction) => {
      setAuction(nextAuction);
      onAuctionUpdated?.(nextAuction);
    },
    [onAuctionUpdated],
  );

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

  const refreshAuctionState = useCallback(async () => {
    try {
      const response = await getAuctionState(listingId, locale);
      if (response.data.auction) {
        applyAuction(response.data.auction);
      }
    } catch {
      // Keep the last known auction snapshot.
    }
    await refreshBids();
  }, [applyAuction, listingId, locale, refreshBids]);

  useEffect(() => {
    setAuction(initialAuction);
  }, [initialAuction]);

  useEffect(() => {
    refreshBids();
    const interval = setInterval(refreshBids, 15000);
    return () => clearInterval(interval);
  }, [refreshBids]);

  const handleBidPlaced = (nextAuction: MarketplaceAuction) => {
    applyAuction(nextAuction);
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
          {auction.is_bidding_open
            ? t("auctions.live_badge")
            : t("auctions.status_closed")}
        </h2>
        <AuctionTimer endsAt={auction.ends_at} onExpired={refreshAuctionState} />
      </div>

      {auction.is_bidding_open && !isOwner && (
        <BidInput
          listingId={listingId}
          auction={auction}
          onBidPlaced={handleBidPlaced}
          canBid={canBid}
          disabledReason={bidDisabledReason}
        />
      )}

      <div>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: getColor("primaryText") }}
        >
          {t("auctions.current_bids")}
        </h3>
        <AuctionBidsList
          listingId={listingId}
          bids={bids}
          loading={loadingBids}
          isOwner={isOwner}
          biddingOpen={
            auction.is_bidding_open === true && auction.outcome == null
          }
          onAwarded={(nextAuction) => {
            applyAuction(nextAuction);
            refreshBids();
          }}
        />
      </div>

      <p className="text-xs" style={{ color: getColor("mutedText") }}>
        {t("auctions.summary_min_deposit")}:{" "}
        {summary.minimumDeposit.toLocaleString()}
      </p>
    </div>
  );
}
