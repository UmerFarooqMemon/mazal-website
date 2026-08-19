"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  getAuctionBids,
  getAuctionState,
  toAuctionCapacityNumber,
} from "@/services/marketplace";
import { useOptionalAuctionCapacity } from "@/context/AuctionCapacityContext";

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
  const capacityState = useOptionalAuctionCapacity();
  const [auction, setAuction] = useState(initialAuction);
  const [bids, setBids] = useState<MarketplaceAuctionBid[]>([]);
  const [loadingBids, setLoadingBids] = useState(true);
  const onAuctionUpdatedRef = useRef(onAuctionUpdated);
  onAuctionUpdatedRef.current = onAuctionUpdated;

  const applyAuction = useCallback((nextAuction: MarketplaceAuction) => {
    setAuction((prev) => ({
      ...prev,
      ...nextAuction,
      viewer_registration:
        nextAuction.viewer_registration ?? prev.viewer_registration ?? null,
      viewer_is_highest_bidder:
        nextAuction.viewer_is_highest_bidder ?? prev.viewer_is_highest_bidder,
      can_place_bid: nextAuction.can_place_bid ?? prev.can_place_bid,
    }));
    onAuctionUpdatedRef.current?.(nextAuction);
  }, []);

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
        if (response.data.auction.viewer_auction_capacity) {
          capacityState?.applyCapacity(
            response.data.auction.viewer_auction_capacity,
          );
        }
      }
    } catch {
      // Keep the last known auction snapshot.
    }
    await refreshBids();
  }, [applyAuction, capacityState, listingId, locale, refreshBids]);

  useEffect(() => {
    setAuction(initialAuction);
  }, [initialAuction]);

  useEffect(() => {
    void refreshAuctionState();
    const interval = setInterval(() => {
      void refreshAuctionState();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshAuctionState]);

  const handleBidPlaced = (nextAuction: MarketplaceAuction) => {
    applyAuction(nextAuction);
    void refreshBids();
  };

  const remainingLimit = toAuctionCapacityNumber(
    capacityState?.capacity?.remaining_bidding_limit ??
      auction.viewer_auction_capacity?.remaining_bidding_limit,
  );
  const maxLimit = toAuctionCapacityNumber(
    capacityState?.capacity?.max_bidding_limit ??
      auction.viewer_auction_capacity?.max_bidding_limit,
  );
  const reservedAmount = toAuctionCapacityNumber(
    capacityState?.capacity?.reserved_amount ??
      auction.viewer_auction_capacity?.reserved_amount,
  );

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
            void refreshBids();
          }}
        />
      </div>

      <p className="text-xs" style={{ color: getColor("mutedText") }}>
        {t("auctions.summary_min_deposit")}:{" "}
        {summary.minimumDeposit.toLocaleString()}
        {maxLimit > 0 && (
          <>
            {" · "}
            {t("wallet.max_bidding_limit")}: {maxLimit.toLocaleString()} AED
          </>
        )}
        {remainingLimit > 0 && (
          <>
            {" · "}
            {t("auctions.remaining_bidding_limit")}:{" "}
            {remainingLimit.toLocaleString()} AED
          </>
        )}
        {reservedAmount > 0 && (
          <>
            {" · "}
            {t("wallet.reserved_amount")}: {reservedAmount.toLocaleString()} AED
          </>
        )}
      </p>
    </div>
  );
}
