"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount } from "@/components/ui";
import {
  awardAuctionBid,
  MarketplaceRequestError,
  toMarketplaceNumber,
  type MarketplaceAuction,
  type MarketplaceAuctionBid,
} from "@/services/marketplace";
import AuctionAwardDialog from "./AuctionAwardDialog";

export default function AuctionBidsList({
  listingId,
  bids,
  loading,
  isOwner,
  onAwarded,
}: {
  listingId: string | number;
  bids: MarketplaceAuctionBid[];
  loading?: boolean;
  isOwner?: boolean;
  onAwarded?: (auction: MarketplaceAuction) => void;
}) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const [pendingBid, setPendingBid] = useState<MarketplaceAuctionBid | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const confirmAward = async () => {
    if (!pendingBid) return;
    setSubmitting(true);
    try {
      const response = await awardAuctionBid(listingId, pendingBid.id, locale);
      toast.success(
        response.message ||
          t("auctions.award_success") ||
          "Auction awarded and bidding closed.",
      );
      onAwarded?.(response.data.auction);
      setPendingBid(null);
    } catch (error) {
      const message =
        error instanceof MarketplaceRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : t("auctions.award_failed") || "Failed to award bid.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm" style={{ color: getColor("mutedText") }}>
        {t("common.loading") || "Loading..."}
      </p>
    );
  }

  if (bids.length === 0) {
    return (
      <p className="text-sm" style={{ color: getColor("mutedText") }}>
        {t("auctions.be_first_to_bid")}
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {bids.map((bid) => {
          const showAward = Boolean(isOwner && bid.can_award);
          return (
            <li
              key={bid.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm"
              style={{ borderColor: getColor("border") }}
            >
              <div className="min-w-0">
                <p style={{ color: getColor("secondaryText") }}>
                  {bid.bidder?.name || "—"}
                </p>
                {bid.is_winning && (
                  <p
                    className="mt-0.5 text-[11px] font-medium uppercase tracking-wide"
                    style={{ color: getColor("success") }}
                  >
                    {t("auctions.winning_bid")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="font-semibold"
                  style={{ color: getColor("primaryText") }}
                >
                  <DirhamAmount
                    amount={toMarketplaceNumber(bid.amount)}
                    weight="bold"
                  />
                </span>
                {showAward && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="h-8 rounded-full px-3 text-xs"
                    onClick={() => setPendingBid(bid)}
                  >
                    {t("auctions.award_and_close")}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <AuctionAwardDialog
        bid={pendingBid}
        submitting={submitting}
        onConfirm={confirmAward}
        onClose={() => {
          if (!submitting) setPendingBid(null);
        }}
      />
    </>
  );
}
