"use client";

import { use, useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import AuctionPageHero from "@/components/auction/AuctionPageHero";
import AuctionDetailCard from "@/components/auction/AuctionDetailCard";
import LiveBidRoom from "@/components/auction/LiveBidRoom";
import {
  mapDetailToAuctionListing,
  mapToAuctionSummary,
} from "@/components/auction/mappers";
import type { AuctionListing } from "@/components/auction/types";
import {
  getAuctionState,
  getListingDetail,
  canTransactListing,
  isListingReserved,
  isListingSold,
  type MarketplaceAuction,
  type MarketplaceListingStatus,
} from "@/services/marketplace";

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ auctionId: string }>;
}) {
  const { auctionId } = use(params);
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const [auction, setAuction] = useState<AuctionListing | null>(null);
  const [auctionState, setAuctionState] = useState<MarketplaceAuction | null>(
    null,
  );
  const [listingStatus, setListingStatus] =
    useState<MarketplaceListingStatus | string>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getListingDetail(auctionId, locale),
      getAuctionState(auctionId, locale).catch(() => null),
    ])
      .then(([listingResponse, auctionResponse]) => {
        if (!active) return;

        const listing = listingResponse.data.listing;
        const apiAuction =
          auctionResponse?.data.auction ?? listing.auction ?? null;

        setAuctionState(apiAuction);
        setListingStatus(listing.status);
        setAuction(mapDetailToAuctionListing(listing));
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load auction.",
        );
        setAuction(null);
        setAuctionState(null);
        setListingStatus("active");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [auctionId, locale]);

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  if (error || !auction) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: getColor("background") }}
      >
        <p style={{ color: getColor("mutedText") }}>
          {error || t("common.not_found") || "Auction not found."}
        </p>
      </div>
    );
  }

  const isBiddingOpen = auctionState?.is_bidding_open === true;
  const canBid = canTransactListing(listingStatus);
  const bidDisabledReason = isListingReserved(listingStatus)
    ? t("listings.listing_reserved_message")
    : isListingSold(listingStatus)
      ? t("listings.listing_sold_message")
      : undefined;

  const handleAuctionUpdated = (nextAuction: MarketplaceAuction) => {
    setAuctionState(nextAuction);
    setAuction((prev) => {
      if (!prev) return prev;
      const highBid =
        nextAuction.current_high_bid != null &&
        nextAuction.current_high_bid !== ""
          ? Number(nextAuction.current_high_bid)
          : null;
      const currentBid =
        highBid != null && Number.isFinite(highBid)
          ? highBid
          : Number(nextAuction.current_price) || prev.currentBid;
      const minBidIncrement =
        nextAuction.min_bid_increment != null &&
        nextAuction.min_bid_increment !== ""
          ? Number(nextAuction.min_bid_increment)
          : prev.minBidIncrement;

      return {
        ...prev,
        currentHighBid:
          highBid != null && Number.isFinite(highBid) ? highBid : null,
        currentBid: Number.isFinite(currentBid) ? currentBid : prev.currentBid,
        minBidIncrement: Number.isFinite(minBidIncrement)
          ? minBidIncrement
          : prev.minBidIncrement,
        currentBids: nextAuction.bid_count ?? prev.currentBids,
        endsAt: nextAuction.ends_at ?? prev.endsAt,
      };
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-5xl mx-auto">
          <AuctionPageHero />
        </div>
      </section>

      <section
        className="px-4 sm:px-6 lg:px-8 pb-16"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, #F2F8F3 40px, #F2F8F3 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <AuctionDetailCard auction={auction} />

          {isBiddingOpen && auctionState && (
            <LiveBidRoom
              listingId={auctionId}
              auction={auctionState}
              summary={mapToAuctionSummary(
                auctionState,
                auctionState.viewer_registration,
              )}
              canBid={canBid}
              bidDisabledReason={bidDisabledReason}
              onAuctionUpdated={handleAuctionUpdated}
            />
          )}

          <div>
            <h2
              className="text-[18px] sm:text-[20px] font-semibold mb-4"
              style={{ color: getColor("primaryText") }}
            >
              {t("auctions.plate_details_title")}
            </h2>
            <div
              className="rounded-2xl border bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
              style={{ borderColor: getColor("border") }}
            >
              <ul
                className="space-y-3 text-sm"
                style={{ color: getColor("secondaryText") }}
              >
                {[1, 2, 3].map((n) => (
                  <li key={n} className="flex items-start gap-2.5">
                    <span
                      className="mt-2 size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: getColor("primaryText") }}
                    />
                    <span>{t(`auctions.plate_details_${n}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
