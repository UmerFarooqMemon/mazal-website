"use client";

import { use, useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import AuctionPageHero from "@/components/auction/AuctionPageHero";
import AuctionDetailCard from "@/components/auction/AuctionDetailCard";
import LiveBidRoom from "@/components/auction/LiveBidRoom";
import {
  mapDetailToAuctionListing,
  mapToAuctionSummary,
} from "@/components/auction/mappers";
import type { AuctionListing } from "@/components/auction/types";
import {
  auctionCheckoutPath,
  rememberCheckoutIntent,
} from "@/lib/checkout-intent";
import {
  getAuctionState,
  getListingDetail,
  getMyPurchases,
  canTransactListing,
  isListingReserved,
  isListingSold,
  type MarketplaceAuction,
  type MarketplaceListingStatus,
} from "@/services/marketplace";

function mergeAuctionState(
  next: MarketplaceAuction,
  prev: MarketplaceAuction | null,
): MarketplaceAuction {
  return {
    ...prev,
    ...next,
    viewer_registration:
      next.viewer_registration ?? prev?.viewer_registration ?? null,
    viewer_is_highest_bidder:
      next.viewer_is_highest_bidder ?? prev?.viewer_is_highest_bidder,
    can_place_bid: next.can_place_bid ?? prev?.can_place_bid,
  };
}

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ auctionId: string }>;
}) {
  const { auctionId } = use(params);
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const { user } = useAuth();
  const [auction, setAuction] = useState<AuctionListing | null>(null);
  const [auctionState, setAuctionState] = useState<MarketplaceAuction | null>(
    null,
  );
  const [listingStatus, setListingStatus] =
    useState<MarketplaceListingStatus | string>("active");
  const [isOwner, setIsOwner] = useState(false);
  const [winnerPurchaseId, setWinnerPurchaseId] = useState<number | null>(null);
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
        const listingAuction = listing.auction ?? null;
        const stateAuction = auctionResponse?.data.auction ?? listingAuction;
        const apiAuction =
          stateAuction && listingAuction
            ? mergeAuctionState(stateAuction, listingAuction)
            : stateAuction;

        setAuctionState(apiAuction);
        setListingStatus(listing.status);
        setIsOwner(
          Boolean(listing.is_owner) ||
            (user?.id != null &&
              listing.seller?.id != null &&
              Number(user.id) === Number(listing.seller.id)),
        );
        setAuction(mapDetailToAuctionListing(listing));
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load auction.",
        );
        setAuction(null);
        setAuctionState(null);
        setIsOwner(false);
        setListingStatus("active");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [auctionId, locale, user?.id]);

  const isWinner =
    user?.id != null &&
    auctionState?.winning_bid?.bidder?.id != null &&
    Number(user.id) === Number(auctionState.winning_bid.bidder.id);
  const winnerNeedsPayment =
    !isOwner &&
    isWinner &&
    String(auctionState?.outcome || "") === "sold_pending_payment";

  useEffect(() => {
    if (!winnerNeedsPayment) {
      setWinnerPurchaseId(null);
      return;
    }

    let active = true;
    getMyPurchases(locale, "buyer")
      .then((response) => {
        if (!active) return;
        const purchases = response.data.purchases || [];
        const match = purchases.find((purchase) => {
          const listingId = purchase.listing_id ?? purchase.listing?.id;
          const status = String(purchase.status || "").toLowerCase();
          return (
            Number(listingId) === Number(auctionId) &&
            status !== "cancelled" &&
            status !== "canceled"
          );
        });
        setWinnerPurchaseId(match?.id ?? null);
      })
      .catch(() => {
        if (active) setWinnerPurchaseId(null);
      });

    return () => {
      active = false;
    };
  }, [auctionId, locale, winnerNeedsPayment]);

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
  const showBidRoom = Boolean(auctionState) && (isBiddingOpen || isOwner);
  const canBid = canTransactListing(listingStatus);
  const bidDisabledReason = isListingReserved(listingStatus)
    ? t("listings.listing_reserved_message")
    : isListingSold(listingStatus)
      ? t("listings.listing_sold_message")
      : undefined;

  const handleAuctionUpdated = (nextAuction: MarketplaceAuction) => {
    setAuctionState((prev) => mergeAuctionState(nextAuction, prev));
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
        status:
          nextAuction.is_bidding_open === false || nextAuction.outcome
            ? "closed"
            : prev.status,
      };
    });
    if (nextAuction.is_bidding_open === false || nextAuction.outcome) {
      setListingStatus((prev) =>
        prev === "sold" || prev === "reserved" ? prev : "reserved",
      );
    }
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
          <AuctionDetailCard
            auction={auction}
            payHref={
              winnerNeedsPayment && winnerPurchaseId
                ? auctionCheckoutPath(locale, auctionId)
                : null
            }
            onPayClick={
              winnerNeedsPayment && winnerPurchaseId
                ? () =>
                    rememberCheckoutIntent("auction", auctionId, {
                      role: "buyer",
                      purchaseId: String(winnerPurchaseId),
                      price:
                        Number(auctionState?.winning_bid?.amount) ||
                        auction.currentBid,
                    })
                : undefined
            }
          />

          {showBidRoom && auctionState && (
            <LiveBidRoom
              listingId={auctionId}
              auction={auctionState}
              summary={mapToAuctionSummary(
                auctionState,
                auctionState.viewer_registration,
              )}
              canBid={canBid}
              bidDisabledReason={bidDisabledReason}
              isOwner={isOwner}
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
