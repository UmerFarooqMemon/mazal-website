export type CheckoutFlow = "marketplace" | "auction";

export type CheckoutIntent = {
  role?: "buyer" | "seller";
  purchaseId?: string;
  price?: number;
};

const STORAGE_PREFIX = "mazal_checkout_v1";

function storageKey(flow: CheckoutFlow, listingId: string | number) {
  return `${STORAGE_PREFIX}:${flow}:${listingId}`;
}

export function listingCheckoutPath(
  locale: string,
  listingId: string | number,
) {
  return `/${locale}/listings/${listingId}/checkout`;
}

export function auctionCheckoutPath(
  locale: string,
  auctionId: string | number,
) {
  return `/${locale}/auctions/${auctionId}/checkout`;
}

export function rememberCheckoutIntent(
  flow: CheckoutFlow,
  listingId: string | number,
  intent: CheckoutIntent,
) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      storageKey(flow, listingId),
      JSON.stringify(intent),
    );
  } catch {
    // Ignore quota / private-mode failures; checkout can still resolve via API.
  }
}

export function readCheckoutIntent(
  flow: CheckoutFlow,
  listingId: string | number,
): CheckoutIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(flow, listingId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutIntent;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function stripUrlSearch() {
  if (typeof window === "undefined") return;
  const { pathname, search, hash } = window.location;
  if (!search) return;
  window.history.replaceState(null, "", `${pathname}${hash}`);
}
