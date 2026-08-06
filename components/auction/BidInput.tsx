"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import { formatPriceInput } from "@/lib/card-input";
import type { MarketplaceAuction } from "@/services/marketplace";
import { placeAuctionBid } from "@/services/marketplace";

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
  const minBid =
    toNumber(auction.min_next_bid) ||
    toNumber(auction.current_high_bid) + toNumber(auction.min_bid_increment) ||
    1;
  const [amountInput, setAmountInput] = useState(() =>
    formatPriceInput(String(minBid))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAmountInput(formatPriceInput(String(minBid)));
  }, [minBid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBid) return;
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

    try {
      const response = await placeAuctionBid(listingId, amount, locale);
      onBidPlaced?.(response.data.auction);
      const nextMinBid = toNumber(response.data.auction.min_next_bid) || amount;
      setAmountInput(formatPriceInput(String(nextMinBid)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid.");
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
          disabled={!canBid}
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none disabled:opacity-60"
          style={{
            borderColor: getColor("border"),
            color: getColor("primaryText"),
            backgroundColor: getColor("surface"),
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={submitting || !auction.is_bidding_open || !canBid}
          className="rounded-xl shrink-0"
        >
          {submitting
            ? t("common.loading") || "Loading..."
            : t("auctions.add_deposit_cta")}
        </Button>
      </div>
      {disabledReason && !canBid && (
        <p className="text-xs" style={{ color: getColor("mutedText") }}>
          {disabledReason}
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
