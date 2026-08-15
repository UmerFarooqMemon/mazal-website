"use client";

import PurchaseCheckout from "@/components/checkout/PurchaseCheckout";

/** Direct / negotiated listing purchase. Uses `/purchases` APIs only. */
export default function MarketplaceCheckout({
  listingId,
}: {
  listingId: string;
}) {
  return <PurchaseCheckout listingId={listingId} flow="marketplace" />;
}
