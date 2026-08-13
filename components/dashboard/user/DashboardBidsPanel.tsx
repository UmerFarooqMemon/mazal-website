"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";
import AuctionBidsList from "@/components/auction/AuctionBidsList";
import {
  getAuctionBids,
  type MarketplaceAuction,
  type MarketplaceAuctionBid,
} from "@/services/marketplace";
import type { DashboardListingRow } from "./DashboardListingsPanel";
import { DASH_BTN, DASH_MUTED, DASH_TEXT } from "./theme";

export default function DashboardBidsPanel({
  listing,
  onClose,
  onAwarded,
}: {
  listing: DashboardListingRow | null;
  onClose: () => void;
  onAwarded?: (auction: MarketplaceAuction) => void;
}) {
  const { t, locale } = useLocale();
  const [bids, setBids] = useState<MarketplaceAuctionBid[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshBids = useCallback(async () => {
    if (!listing) return;
    setLoading(true);
    try {
      const response = await getAuctionBids(listing.listingId, locale);
      setBids(response.data.bids || []);
    } catch {
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [listing, locale]);

  useEffect(() => {
    refreshBids();
  }, [refreshBids]);

  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="relative w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 text-[#545e6f] hover:text-[#081123]"
          aria-label={t("common.close") || "Close"}
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          className="font-serif text-[28px] font-semibold leading-8"
          style={{ color: DASH_TEXT }}
        >
          {t("dashboard.see_all_bids")}
        </h2>
        <p className="mt-2 text-sm" style={{ color: DASH_MUTED }}>
          {listing.plate_code
            ? `${listing.plate_code} ${listing.plate_digits}`
            : listing.plate_digits}
        </p>

        <div className="mt-6 max-h-[360px] overflow-y-auto">
          <AuctionBidsList
            listingId={listing.listingId}
            bids={bids}
            loading={loading}
            isOwner={listing.isOwner !== false}
            onAwarded={(auction) => {
              refreshBids();
              onAwarded?.(auction);
            }}
          />
        </div>

        <Link href={`/${locale}/auctions/${listing.listingId}`} className="mt-6 block">
          <Button
            type="button"
            variant="primary"
            className="h-11 w-full rounded-full text-base font-medium"
            style={{ background: DASH_BTN }}
          >
            {t("dashboard.open_auction")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
