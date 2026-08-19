"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import { formatPriceInput } from "@/lib/card-input";
import type { MarketplaceAuction } from "@/services/marketplace";
import {
  firstMarketplaceError,
  MarketplaceRequestError,
  placeAuctionBid,
  toAuctionCapacityNumber,
} from "@/services/marketplace";
import { useOptionalAuctionCapacity } from "@/context/AuctionCapacityContext";

interface BidInputProps {
  listingId: string | number;
  auction: MarketplaceAuction;
  onBidPlaced?: (auction: MarketplaceAuction) => void;
  /** When false, bidding is blocked (e.g. listing reserved/sold). */
  canBid?: boolean;
  disabledReason?: string;
}

function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseBidAmount(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export default function BidInput({
  listingId,
  auction,
  onBidPlaced,
  canBid = true,
  disabledReason,
}: BidInputProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const capacityState = useOptionalAuctionCapacity();
  const remainingLimit = toAuctionCapacityNumber(
    capacityState?.capacity?.remaining_bidding_limit,
  );
  const minNextBid = toNumber(auction.min_next_bid);
  const minIncrement = toNumber(auction.min_bid_increment);
  const hasHighBid =
    auction.current_high_bid != null && auction.current_high_bid !== "";
  const minBid = hasHighBid
    ? minNextBid ||
      toNumber(auction.current_high_bid) + minIncrement ||
      1
    : minNextBid + minIncrement || 1;
  const [amountInput, setAmountInput] = useState(() =>
    formatPriceInput(String(minBid))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consecutiveBidBlocked, setConsecutiveBidBlocked] = useState(false);

  const isHighestBidder =
    consecutiveBidBlocked || auction.viewer_is_highest_bidder === true;
  const apiBlocksBid = auction.can_place_bid === false || consecutiveBidBlocked;
  const allowBid = canBid && !apiBlocksBid;
  const blockReason = !canBid
    ? disabledReason
    : isHighestBidder
      ? t("auctions.highest_bidder_wait")
      : apiBlocksBid
        ? t("auctions.cannot_place_bid")
        : disabledReason;

  useEffect(() => {
    setAmountInput(formatPriceInput(String(minBid)));
  }, [minBid]);

  useEffect(() => {
    if (auction.can_place_bid === true) {
      setConsecutiveBidBlocked(false);
      setError(null);
    } else if (auction.viewer_is_highest_bidder === true) {
      setConsecutiveBidBlocked(true);
    }
  }, [auction.can_place_bid, auction.viewer_is_highest_bidder]);

  const bumpAmount = (direction: 1 | -1) => {
    if (!allowBid) return;
    const current = parseBidAmount(amountInput) || minBid;
    const next = current + direction;
    const clamped = Math.max(minBid, Math.round(next));
    setAmountInput(formatPriceInput(String(clamped)));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowBid) return;
    setSubmitting(true);
    setError(null);

    const amount = parseBidAmount(amountInput);
    if (amount < minBid) {
      setError(
        t("auctions.bid_too_low").replace(
          "{amount}",
          minBid.toLocaleString()
        )
      );
      setSubmitting(false);
      return;
    }

    if (remainingLimit > 0 && amount > remainingLimit) {
      setError(
        t("auctions.bid_exceeds_capacity").replace(
          "{amount}",
          remainingLimit.toLocaleString(),
        ),
      );
      setSubmitting(false);
      return;
    }

    try {
      const response = await placeAuctionBid(listingId, amount, locale);
      if (response.data.auction_capacity) {
        capacityState?.applyCapacity(response.data.auction_capacity);
      }
      void capacityState?.refresh();
      setConsecutiveBidBlocked(true);
      onBidPlaced?.({
        ...response.data.auction,
        viewer_is_highest_bidder:
          response.data.auction.viewer_is_highest_bidder ?? true,
        can_place_bid: response.data.auction.can_place_bid ?? false,
      });
      const nextMinBid = toNumber(response.data.auction.min_next_bid) || amount;
      setAmountInput(formatPriceInput(String(nextMinBid)));
    } catch (err) {
      const bidError =
        firstMarketplaceError(err, ["amount", "deposit", "bid"]) ||
        firstMarketplaceError(err);
      setError(
        bidError ||
          (err instanceof Error ? err.message : "Failed to place bid."),
      );
      if (
        err instanceof MarketplaceRequestError &&
        err.status === 422 &&
        bidError
      ) {
        setConsecutiveBidBlocked(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label
        className="text-sm font-medium"
        style={{ color: getColor("primaryText") }}
      >
        {t("auctions.current_bid_label")}
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={amountInput}
            onFocus={() => setAmountInput("")}
            onBlur={() => {
              if (!amountInput.trim()) {
                setAmountInput(formatPriceInput(String(minBid)));
              }
            }}
            onChange={(e) => setAmountInput(formatPriceInput(e.target.value))}
            disabled={!allowBid}
            className="w-full rounded-xl border py-2.5 pe-10 ps-4 text-sm outline-none disabled:opacity-60"
            style={{
              borderColor: getColor("border"),
              color: getColor("primaryText"),
              backgroundColor: getColor("surface"),
            }}
          />
          <div className="absolute inset-y-1 end-1 flex flex-col overflow-hidden rounded-lg border"
            style={{ borderColor: getColor("border") }}
          >
            <button
              type="button"
              disabled={!allowBid}
              onClick={() => bumpAmount(1)}
              className="flex h-1/2 w-7 items-center justify-center disabled:opacity-40"
              style={{ color: getColor("primaryText") }}
              aria-label="Increase bid"
            >
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              disabled={!allowBid || parseBidAmount(amountInput) <= minBid}
              onClick={() => bumpAmount(-1)}
              className="flex h-1/2 w-7 items-center justify-center border-t disabled:opacity-40"
              style={{
                color: getColor("primaryText"),
                borderColor: getColor("border"),
              }}
              aria-label="Decrease bid"
            >
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          </div>
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={submitting || !auction.is_bidding_open || !allowBid}
          className="rounded-xl shrink-0"
        >
          {submitting ? (
            t("common.loading") || "Loading..."
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <img
                src="/icons/bid-gavel.png"
                alt=""
                className="h-4 w-4 object-contain mix-blend-screen"
              />
              {t("auctions.place_bid") || "Bid"}
            </span>
          )}
        </Button>
      </div>
      {remainingLimit > 0 && allowBid && !error && (
        <p className="text-xs" style={{ color: getColor("mutedText") }}>
          {t("auctions.remaining_bidding_limit")}:{" "}
          {remainingLimit.toLocaleString()} AED
        </p>
      )}
      {blockReason && !allowBid && !error && (
        <p className="text-xs" style={{ color: getColor("mutedText") }}>
          {blockReason}
        </p>
      )}
      {error && (
        <p className="text-sm" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}
    </form>
  );
}
