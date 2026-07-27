"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import type { MarketplaceAuction } from "@/services/marketplace";
import { placeAuctionBid } from "@/services/marketplace";

interface BidInputProps {
  listingId: string | number;
  auction: MarketplaceAuction;
  onBidPlaced?: (auction: MarketplaceAuction) => void;
}

function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function BidInput({
  listingId,
  auction,
  onBidPlaced,
}: BidInputProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const minBid =
    toNumber(auction.min_next_bid) ||
    toNumber(auction.current_high_bid) + toNumber(auction.min_bid_increment) ||
    1;
  const [amount, setAmount] = useState(minBid);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAmount(minBid);
  }, [minBid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await placeAuctionBid(listingId, amount, locale);
      onBidPlaced?.(response.data.auction);
      setAmount(toNumber(response.data.auction.min_next_bid) || amount);
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
          type="number"
          min={minBid}
          step={toNumber(auction.min_bid_increment) || 1}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
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
          disabled={submitting || !auction.is_bidding_open}
          className="rounded-xl shrink-0"
        >
          {submitting
            ? t("common.loading") || "Loading..."
            : t("auctions.add_deposit_cta")}
        </Button>
      </div>
      {error && (
        <p className="text-sm" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}
    </form>
  );
}
