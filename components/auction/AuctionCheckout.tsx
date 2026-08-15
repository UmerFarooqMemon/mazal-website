"use client";

import PurchaseCheckout from "@/components/checkout/PurchaseCheckout";

/** Winning-bid custody pay. Uses `/purchases` APIs, not private deals. */
export default function AuctionCheckout({ listingId }: { listingId: string }) {
  return <PurchaseCheckout listingId={listingId} flow="auction" />;
}
