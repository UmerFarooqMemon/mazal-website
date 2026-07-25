export interface MarketplaceApiResponse<T> {
  status?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface MarketplaceSeller {
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  completed_deals: number;
  emirates_id_verified: boolean;
}

export interface MarketplaceListingPreview {
  image_url?: string;
  style?: string;
}

export interface MarketplaceAuctionBidSummary {
  id: number;
  amount: number | string;
  bidder?: { id: number | null; name: string };
}

export interface MarketplaceAuctionRegistration {
  id: number;
  listing_id: number;
  status: string;
  status_label?: string;
  deposit_amount: number | string;
  deposit_status: string;
  deposit_status_label?: string;
  deposit_held_at?: string | null;
  deposit_released_at?: string | null;
  no_show_penalty_amount?: number | string | null;
  no_show_marked_at?: string | null;
  registered_at?: string | null;
  user?: { id: number; name: string };
  listing?: MarketplaceListingCard | null;
  created_at?: string;
  updated_at?: string;
}

export interface MarketplaceAuction {
  starts_at: string;
  ends_at: string;
  reserve_price: number | string;
  starting_price?: number | string;
  outcome?: string | null;
  outcome_label?: string | null;
  closed_at?: string | null;
  is_registration_open?: boolean;
  is_bidding_open?: boolean;
  current_high_bid?: number | string | null;
  bid_count?: number;
  registration_count?: number;
  min_next_bid?: number | string;
  min_bid_increment?: number | string;
  registration_deposit?: number | string;
  no_show_penalty?: number | string;
  viewer_registration?: MarketplaceAuctionRegistration | null;
  winning_bid?: MarketplaceAuctionBidSummary | null;
}

export interface MarketplaceReveal {
  id: number;
  status: string;
  status_label?: string;
  payment_status?: string;
  fee_amount: number | string;
  revealed_at: string | null;
  decision_expires_at: string | null;
  decision_window_hours: number;
  seconds_remaining: number;
  is_active: boolean;
  credited_to_purchase: boolean;
  can_confirm_payment?: boolean;
  can_proceed?: boolean;
}

export interface MarketplaceRevealCodeScreen {
  unlocked: boolean;
  plate_code?: string | null;
  plate_digits?: string | null;
  display_plate?: string;
  masked_hint?: string;
  decision_expires_at?: string | null;
  seconds_remaining?: number;
  can_proceed?: boolean;
}

export interface MarketplaceRevealActions {
  can_initiate: boolean;
  can_confirm_payment: boolean;
  can_proceed: boolean;
  can_make_offer: boolean;
}

export interface MarketplaceRevealScreen {
  listing_id: number;
  title: string;
  emirate: string;
  emirate_label: string;
  asking_price: number | string;
  hide_code: boolean;
  code_hidden: boolean;
  reveal_fee_amount: number | string;
  decision_window_hours: number;
  reveal: MarketplaceReveal | null;
  code_screen: MarketplaceRevealCodeScreen;
  actions: MarketplaceRevealActions;
  listing?: MarketplaceListingDetail;
  credit_applied?: number;
  message?: string;
}

export type MarketplaceBoostTier = "diamond" | "gold" | "silver";

export interface MarketplaceListingCard {
  id: number;
  listing_type: string;
  listing_type_label: string;
  status: string;
  title: string;
  emirate: string;
  emirate_label: string;
  plate_type?: string | null;
  plate_type_label?: string | null;
  plate_code?: string | null;
  plate_digits?: string | null;
  plate_design?: string | null;
  display_plate: string;
  digit_count: number;
  asking_price: number;
  hide_code: boolean;
  code_hidden: boolean;
  view_count: number;
  watcher_count: number;
  offer_count: number;
  previously_sold: boolean;
  /** Boost / featured tier shown on marketplace cards (Figma: Diamond / Gold / Silver). */
  boost_tier?: string | null;
  featured_tier?: string | null;
  tier?: string | null;
  seller: MarketplaceSeller;
  is_watchlisted?: boolean;
  preview?: MarketplaceListingPreview | null;
  published_at: string;
}

export interface MarketplaceListingDetail extends MarketplaceListingCard {
  description?: string | null;
  auction?: MarketplaceAuction | null;
  reveal?: MarketplaceReveal | null;
  reveal_screen_url?: string | null;
  can_make_offer?: boolean;
  is_owner?: boolean;
  sold_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MarketplaceOffer {
  id: number;
  listing_id: number;
  amount: number;
  message?: string | null;
  status: string;
  status_label: string;
  decision_note?: string | null;
  buyer?: { id: number; name: string };
  listing?: {
    id: number;
    title: string;
    status: string;
    display_plate: string;
    asking_price: number | string;
  };
  responded_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MarketplacePurchasePayment {
  id: number;
  amount: number | string;
  method: string;
  status: string;
  status_label?: string;
  payment_reference?: string | null;
  custody_instructions?: string | null;
  has_evidence?: boolean;
}

export interface MarketplacePurchaseAddons {
  include_delivery: boolean;
  include_fitting: boolean;
  delivery_fee_amount: number | string;
  fitting_fee_amount: number | string;
  addons_total: number | string;
  delivery_address?: string | null;
  delivery_notes?: string | null;
}

export interface MarketplacePurchaseInvoice {
  id: number;
  purchase_id: number;
  invoice_number: string;
  currency: string;
  subtotal: number | string;
  reveal_credit_amount: number | string;
  total_fees: number | string;
  total_amount: number | string;
  line_items?: unknown[];
  issued_at: string;
  download_url?: string;
}

export interface MarketplacePurchase {
  id: number;
  listing_id: number;
  offer_id?: number | null;
  status: string;
  status_label?: string;
  agreed_price: number | string;
  reveal_credit_amount?: number | string;
  fee_snapshot?: Record<string, unknown>;
  total_fees?: number | string;
  total_due: number | string;
  seller_net?: number | string;
  currency: string;
  can_gift?: boolean;
  gifted_to?: { id: number; name: string } | null;
  addons?: MarketplacePurchaseAddons;
  buyer?: { id: number; name: string };
  seller?: { id: number; name: string };
  listing?: {
    id: number;
    title: string;
    status: string;
    display_plate: string;
    asking_price: number | string;
  };
  payments?: MarketplacePurchasePayment[];
  invoice?: MarketplacePurchaseInvoice | null;
  funded_at?: string | null;
  transfer_started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MarketplaceGift {
  id: number;
  purchase_id: number;
  status: string;
  status_label?: string;
  recipient_name: string;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  message?: string | null;
  invitation_code?: string;
  expires_at?: string | null;
  accepted_at?: string | null;
  declined_at?: string | null;
  cancelled_at?: string | null;
  sender?: { id: number; name: string };
  recipient?: { id: number; name: string } | null;
  purchase?: {
    id: number;
    status: string;
    listing_id: number;
    display_plate: string;
    agreed_price: number | string;
  };
  created_at: string;
  updated_at?: string;
}

export interface MarketplaceAuctionBid {
  id: number;
  listing_id: number;
  amount: number | string;
  is_winning?: boolean;
  bidder?: { id: number | null; name: string };
  created_at: string;
}

export interface MarketplacePurchaseAddonCatalogItem {
  key: string;
  label: string;
  description: string;
  amount: number | string;
  requires_address: boolean;
}

export interface UpdatePurchaseAddonsPayload {
  include_delivery: boolean;
  include_fitting: boolean;
  delivery_address?: string;
  delivery_notes?: string;
}

export interface CreateGiftPayload {
  recipient_name: string;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  recipient_user_id?: number | null;
  message?: string;
}

export interface MarketplaceWatchlistItem {
  id: number;
  category_id: number | null;
  listing: MarketplaceListingCard;
  created_at: string;
}

export interface MarketplaceWatchlistCategory {
  id: number;
  name: string;
  items: MarketplaceWatchlistItem[];
}

export interface MarketplaceSearchFilters {
  emirates?: { key: string; label: string }[];
  listing_types?: { key: string; label: string }[];
  price_ranges?: {
    key: string;
    label: string;
    min: number;
    max: number;
  }[];
  sort_options?: { key: string; label: string }[];
}

export interface MarketplacePagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface MarketplaceSearchParams {
  emirate?: string;
  listing_type?: string;
  plate_code?: string;
  digit_count?: number;
  plate_digits?: string;
  price_range?: string;
  price_min?: number;
  price_max?: number;
  q?: string;
  sort?: string;
  per_page?: number;
  page?: number;
}

export interface MarketplaceNotificationSettings {
  notify_watchlist: boolean;
  notify_price_drop: boolean;
}

export interface CreateListingPayload {
  listing_type: "direct" | "auction" | "spot";
  title: string;
  emirate: string;
  plate_variant?: string;
  plate_type?: string;
  plate_code?: string;
  plate_digits: string;
  plate_design?: string;
  asking_price: number;
  description?: string;
  hide_code?: boolean;
  status?: "draft" | "active";
  auction_starts_at?: string | null;
  auction_ends_at?: string | null;
  auction_reserve_price?: number | null;
  previously_sold?: boolean;
}

export interface UpdateListingPayload {
  title?: string;
  asking_price?: number;
  description?: string;
  hide_code?: boolean;
  status?: "draft" | "active" | "cancelled";
  auction_starts_at?: string | null;
  auction_ends_at?: string | null;
  auction_reserve_price?: number | null;
  previously_sold?: boolean;
}

const EMIRATE_UI_TO_API: Record<string, string> = {
  Dubai: "dubai",
  "Abu Dhabi": "abu_dhabi",
  Sharjah: "sharjah",
  Ajman: "ajman",
  RAK: "ras_al_khaimah",
  "Ras Al Khaimah": "ras_al_khaimah",
};

const LISTING_TYPE_UI_TO_API: Record<string, string> = {
  Direct: "direct",
  Auction: "auction",
  Spot: "spot",
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function marketplaceRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: BodyInit | null;
    locale?: string;
    contentType?: string | null;
    auth?: "required" | "optional";
  } = {},
): Promise<MarketplaceApiResponse<T>> {
  const authMode = options.auth ?? "optional";
  const token = getToken();

  if (authMode === "required" && !token) {
    throw new Error("Please login to continue.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  headers["Accept-Language"] = options.locale === "ar" ? "ar" : "en";

  // Let the browser set multipart boundary when body is FormData.
  if (options.contentType && !(options.body instanceof FormData)) {
    headers["Content-Type"] = options.contentType;
  }

  const response = await fetch(`/api/marketplace${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  const responseType = response.headers.get("content-type") || "";
  if (!responseType.includes("application/json")) {
    throw new Error("Unexpected response from server.");
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Request failed.");
  }

  return payload;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function mapEmirateToApi(value: string) {
  if (!value || value === "All") return undefined;
  return EMIRATE_UI_TO_API[value] || value.toLowerCase().replace(/\s+/g, "_");
}

export function mapListingTypeToApi(value: string) {
  if (!value) return undefined;
  return LISTING_TYPE_UI_TO_API[value] || value.toLowerCase();
}

function normalizeBoostTier(
  value?: string | null,
): MarketplaceBoostTier | undefined {
  if (!value) return undefined;
  const key = value.trim().toLowerCase();
  if (key === "diamond" || key === "gold" || key === "silver") return key;
  return undefined;
}

export function mapListingToPlateCard(listing: MarketplaceListingCard) {
  let plateCode = listing.plate_code || "";
  let plateDigits = listing.plate_digits || "";

  if (!plateDigits && listing.display_plate) {
    const match = listing.display_plate.match(/^([A-Za-z]+)\s*[-|]?\s*(\d+)$/);
    if (match) {
      plateCode = plateCode || match[1].toUpperCase();
      plateDigits = match[2];
    } else if (/^\d+$/.test(listing.display_plate.trim())) {
      plateDigits = listing.display_plate.trim();
    } else {
      plateDigits = listing.display_plate.trim();
    }
  }

  const code =
    plateCode && plateDigits
      ? `${plateCode} | ${plateDigits}`
      : listing.display_plate;

  // Figma marketplace cards show boost tier (Diamond / Gold / Silver), not listing type.
  const tier =
    normalizeBoostTier(listing.boost_tier) ||
    normalizeBoostTier(listing.featured_tier) ||
    normalizeBoostTier(listing.tier) ||
    "diamond";

  return {
    id: listing.id,
    emirate: listing.emirate_label?.toUpperCase() || listing.emirate,
    emirateKey: listing.emirate,
    code,
    plate_code: plateCode,
    plate_digits: plateDigits,
    plate_type: listing.plate_type || undefined,
    plate_design: listing.plate_design || undefined,
    price: listing.asking_price,
    type: listing.listing_type_label?.toUpperCase() || listing.listing_type,
    tier,
    views: listing.view_count,
    rating: listing.seller?.rating ?? 0,
    previouslySold: listing.previously_sold,
    isFavorite: listing.is_watchlisted,
    hideCode: listing.hide_code || listing.code_hidden,
    imageUrl: listing.preview?.image_url,
  };
}

// 1. Search Listings
export function searchListings(
  params: MarketplaceSearchParams,
  locale: string,
) {
  return marketplaceRequest<{
    listings: MarketplaceListingCard[];
    similar_listings: MarketplaceListingCard[];
    pagination: MarketplacePagination;
    filters: MarketplaceSearchFilters;
  }>(
    `/listings${buildQuery(params as Record<string, string | number | undefined>)}`,
    { locale },
  );
}

// 2. Trending Listings
export function getTrendingListings(locale: string) {
  return marketplaceRequest<{ listings: MarketplaceListingCard[] }>(
    "/listings/trending",
    { locale },
  );
}

// 3. Get Listing Detail
export function getListingDetail(id: string | number, locale: string) {
  return marketplaceRequest<{ listing: MarketplaceListingDetail }>(
    `/listings/${id}`,
    { locale },
  );
}

// 4. Similar Listings
export function getSimilarListings(id: string | number, locale: string) {
  return marketplaceRequest<{ listings: MarketplaceListingCard[] }>(
    `/listings/${id}/similar`,
    { locale },
  );
}

// 5. My Listings
export function getMyListings(locale: string) {
  return marketplaceRequest<{ listings: MarketplaceListingDetail[] }>(
    "/my-listings",
    { locale, auth: "required" },
  );
}

// 6. Create Listing
export function createListing(payload: CreateListingPayload, locale: string) {
  return marketplaceRequest<{ listing: MarketplaceListingDetail }>("/listings", {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

// 7. Update Listing
export function updateListing(
  id: string | number,
  payload: UpdateListingPayload,
  locale: string,
) {
  return marketplaceRequest<{ listing: MarketplaceListingDetail }>(
    `/listings/${id}`,
    {
      method: "PATCH",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify(payload),
    },
  );
}

// 8. Cancel Listing
export function cancelListing(id: string | number, locale: string) {
  return marketplaceRequest<null>(`/listings/${id}`, {
    method: "DELETE",
    locale,
    auth: "required",
  });
}

// 9. Get Watchlist
export function getWatchlist(locale: string) {
  return marketplaceRequest<{
    categories: MarketplaceWatchlistCategory[];
    uncategorized: MarketplaceWatchlistItem[];
  }>("/watchlist", { locale, auth: "required" });
}

// 10. Create Watchlist Category
export function createWatchlistCategory(name: string, locale: string) {
  return marketplaceRequest<{
    category: { id: number; name: string; user_id: number };
  }>("/watchlist/categories", {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify({ name }),
  });
}

// 11. Update Watchlist Category
export function updateWatchlistCategory(
  id: string | number,
  name: string,
  locale: string,
) {
  return marketplaceRequest<{ category: { id: number; name: string } }>(
    `/watchlist/categories/${id}`,
    {
      method: "PATCH",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify({ name }),
    },
  );
}

// 12. Delete Watchlist Category
export function deleteWatchlistCategory(id: string | number, locale: string) {
  return marketplaceRequest<null>(`/watchlist/categories/${id}`, {
    method: "DELETE",
    locale,
    auth: "required",
  });
}

// 13. Add to Watchlist
export function addToWatchlist(
  listingId: number,
  locale: string,
  categoryId?: number | null,
) {
  return marketplaceRequest<{
    item: { id: number; listing_id: number; category_id: number | null };
  }>("/watchlist/items", {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify({
      listing_id: listingId,
      category_id: categoryId ?? null,
    }),
  });
}

// 14. Remove from Watchlist
export function removeFromWatchlist(
  listingId: string | number,
  locale: string,
) {
  return marketplaceRequest<null>(`/watchlist/items/${listingId}`, {
    method: "DELETE",
    locale,
    auth: "required",
  });
}

// 15. Get Reveal Screen
export function getRevealStatus(listingId: string | number, locale: string) {
  return marketplaceRequest<MarketplaceRevealScreen>(
    `/listings/${listingId}/reveal`,
    { locale, auth: "required" },
  );
}

// 16. Initiate Reveal
export function initiateReveal(listingId: string | number, locale: string) {
  return marketplaceRequest<MarketplaceRevealScreen & { message?: string }>(
    `/listings/${listingId}/reveal`,
    {
      method: "POST",
      locale,
      auth: "required",
    },
  );
}

// 17. Confirm Reveal Payment
export function confirmRevealPayment(
  listingId: string | number,
  locale: string,
  paymentReference?: string,
) {
  return marketplaceRequest<MarketplaceRevealScreen>(
    `/listings/${listingId}/reveal/confirm`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify({
        payment_reference: paymentReference,
      }),
    },
  );
}

// 18. Proceed After Reveal
export function proceedAfterReveal(listingId: string | number, locale: string) {
  return marketplaceRequest<
    MarketplaceRevealScreen & { credit_applied?: number; message?: string }
  >(`/listings/${listingId}/reveal/proceed`, {
    method: "POST",
    locale,
    auth: "required",
  });
}

// 19. Submit Offer
export function submitOffer(
  listingId: string | number,
  payload: { amount: number; message?: string },
  locale: string,
) {
  return marketplaceRequest<{ offer: MarketplaceOffer }>(
    `/listings/${listingId}/offers`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify(payload),
    },
  );
}

// 20. Get Listing Offers (Seller)
export function getListingOffers(listingId: string | number, locale: string) {
  return marketplaceRequest<{ offers: MarketplaceOffer[] }>(
    `/listings/${listingId}/offers`,
    { locale, auth: "required" },
  );
}

// 21. My Offers (Buyer)
export function getMyOffers(locale: string) {
  return marketplaceRequest<{ offers: MarketplaceOffer[] }>("/my-offers", {
    locale,
    auth: "required",
  });
}

// 40. Get Notification Settings
export function getNotificationSettings(locale: string) {
  return marketplaceRequest<MarketplaceNotificationSettings>(
    "/notification-settings",
    { locale, auth: "required" },
  );
}

// 41. Update Notification Settings
export function updateNotificationSettings(
  payload: Partial<MarketplaceNotificationSettings>,
  locale: string,
) {
  return marketplaceRequest<MarketplaceNotificationSettings>(
    "/notification-settings",
    {
      method: "PATCH",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify(payload),
    },
  );
}

// 22. Accept Offer (Seller)
export function acceptOffer(offerId: string | number, locale: string) {
  return marketplaceRequest<{ offer: MarketplaceOffer }>(
    `/offers/${offerId}/accept`,
    {
      method: "POST",
      locale,
      auth: "required",
    },
  );
}

// 23. Reject Offer (Seller)
export function rejectOffer(
  offerId: string | number,
  locale: string,
  reason?: string,
) {
  return marketplaceRequest<{ offer: MarketplaceOffer }>(
    `/offers/${offerId}/reject`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify({ reason }),
    },
  );
}

// 24. Withdraw Offer (Buyer)
export function withdrawOffer(offerId: string | number, locale: string) {
  return marketplaceRequest<{ offer: MarketplaceOffer }>(
    `/offers/${offerId}/withdraw`,
    {
      method: "POST",
      locale,
      auth: "required",
    },
  );
}

// 25. Start Purchase From Accepted Offer
export function startPurchaseFromOffer(
  offerId: string | number,
  locale: string,
) {
  return marketplaceRequest<{ purchase: MarketplacePurchase }>(
    `/offers/${offerId}/purchase`,
    {
      method: "POST",
      locale,
      auth: "required",
    },
  );
}

// 26. Get Purchase
export function getPurchase(purchaseId: string | number, locale: string) {
  return marketplaceRequest<{ purchase: MarketplacePurchase }>(
    `/purchases/${purchaseId}`,
    { locale, auth: "required" },
  );
}

// 27. My Purchases / Sales
export function getMyPurchases(
  locale: string,
  role: "buyer" | "seller" = "buyer",
) {
  return marketplaceRequest<{ purchases: MarketplacePurchase[] }>(
    `/purchases${buildQuery({ role })}`,
    { locale, auth: "required" },
  );
}

// 28. Confirm Purchase Payment (Fake Local)
export function confirmPurchasePayment(
  purchaseId: string | number,
  paymentId: string | number,
  locale: string,
  paymentReference?: string,
) {
  return marketplaceRequest<{ purchase: MarketplacePurchase }>(
    `/purchases/${purchaseId}/payments/${paymentId}/confirm`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify({
        payment_reference: paymentReference,
      }),
    },
  );
}

// 29. Submit Bank Transfer Evidence
export function submitPurchasePaymentEvidence(
  purchaseId: string | number,
  paymentId: string | number,
  locale: string,
  payload: { payment_reference?: string; evidence?: File | Blob | null },
) {
  const formData = new FormData();
  if (payload.payment_reference) {
    formData.append("payment_reference", payload.payment_reference);
  }
  if (payload.evidence) {
    formData.append("evidence", payload.evidence);
  }

  return marketplaceRequest<{ purchase: MarketplacePurchase }>(
    `/purchases/${purchaseId}/payments/${paymentId}/submission`,
    {
      method: "POST",
      locale,
      auth: "required",
      body: formData,
    },
  );
}

// 30. Get Purchase Add-ons Catalog
export function getPurchaseAddons(locale: string) {
  return marketplaceRequest<{
    currency: string;
    addons: MarketplacePurchaseAddonCatalogItem[];
  }>("/purchase-addons", { locale, auth: "required" });
}

// 31. Update Purchase Add-ons
export function updatePurchaseAddons(
  purchaseId: string | number,
  payload: UpdatePurchaseAddonsPayload,
  locale: string,
) {
  return marketplaceRequest<{ purchase: MarketplacePurchase }>(
    `/purchases/${purchaseId}/addons`,
    {
      method: "PATCH",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify(payload),
    },
  );
}

// 32. Create Gift From Purchase
export function createGiftFromPurchase(
  purchaseId: string | number,
  payload: CreateGiftPayload,
  locale: string,
) {
  return marketplaceRequest<{ gift: MarketplaceGift }>(
    `/purchases/${purchaseId}/gifts`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify(payload),
    },
  );
}

// 33. My Gifts
export function getMyGifts(
  locale: string,
  role: "sent" | "received" = "sent",
) {
  return marketplaceRequest<{ gifts: MarketplaceGift[] }>(
    `/gifts${buildQuery({ role })}`,
    { locale, auth: "required" },
  );
}

// 34. Get Gift
export function getGift(giftId: string | number, locale: string) {
  return marketplaceRequest<{ gift: MarketplaceGift }>(`/gifts/${giftId}`, {
    locale,
    auth: "required",
  });
}

// 35. Accept Gift
export function acceptGift(invitationCode: string, locale: string) {
  return marketplaceRequest<{ gift: MarketplaceGift }>("/gifts/accept", {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify({ invitation_code: invitationCode }),
  });
}

// 36. Decline Gift
export function declineGift(giftId: string | number, locale: string) {
  return marketplaceRequest<{ gift: MarketplaceGift }>(
    `/gifts/${giftId}/decline`,
    {
      method: "POST",
      locale,
      auth: "required",
    },
  );
}

// 37. Cancel Gift
export function cancelGift(giftId: string | number, locale: string) {
  return marketplaceRequest<{ gift: MarketplaceGift }>(
    `/gifts/${giftId}/cancel`,
    {
      method: "POST",
      locale,
      auth: "required",
    },
  );
}

// 38. Get Purchase Invoice
export function getPurchaseInvoice(
  purchaseId: string | number,
  locale: string,
) {
  return marketplaceRequest<{ invoice: MarketplacePurchaseInvoice }>(
    `/purchases/${purchaseId}/invoice`,
    { locale, auth: "required" },
  );
}

// 39. Download Purchase Invoice PDF
export async function downloadPurchaseInvoice(
  purchaseId: string | number,
  locale: string,
): Promise<Blob> {
  const token = getToken();
  if (!token) {
    throw new Error("Please login to continue.");
  }

  const response = await fetch(
    `/api/marketplace/purchases/${purchaseId}/invoice/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": locale === "ar" ? "ar" : "en",
      },
    },
  );

  const responseType = response.headers.get("content-type") || "";
  if (!response.ok) {
    if (responseType.includes("application/json")) {
      const payload = await response.json();
      throw new Error(payload?.message || payload?.error || "Download failed.");
    }
    throw new Error("Failed to download invoice.");
  }

  return response.blob();
}

// 42. Get Auction State
export function getAuctionState(listingId: string | number, locale: string) {
  return marketplaceRequest<{
    listing_id: number;
    auction: MarketplaceAuction;
  }>(`/listings/${listingId}/auction`, { locale });
}

// 43. List Auction Bids
export function getAuctionBids(listingId: string | number, locale: string) {
  return marketplaceRequest<{ bids: MarketplaceAuctionBid[] }>(
    `/listings/${listingId}/auction/bids`,
    { locale },
  );
}

// 44. Register For Auction
export function registerForAuction(listingId: string | number, locale: string) {
  return marketplaceRequest<{ registration: MarketplaceAuctionRegistration }>(
    `/listings/${listingId}/auction/register`,
    {
      method: "POST",
      locale,
      auth: "required",
    },
  );
}

// 45. Confirm Auction Deposit (Fake Local)
export function confirmAuctionDeposit(
  listingId: string | number,
  registrationId: string | number,
  locale: string,
  paymentReference?: string,
) {
  return marketplaceRequest<{ registration: MarketplaceAuctionRegistration }>(
    `/listings/${listingId}/auction/registrations/${registrationId}/confirm-deposit`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify({
        payment_reference: paymentReference,
      }),
    },
  );
}

// 46. Place Auction Bid
export function placeAuctionBid(
  listingId: string | number,
  amount: number,
  locale: string,
) {
  return marketplaceRequest<{
    bid: MarketplaceAuctionBid;
    auction: MarketplaceAuction;
  }>(`/listings/${listingId}/auction/bids`, {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify({ amount }),
  });
}

// 47. My Auction Registrations
export function getMyAuctionRegistrations(locale: string) {
  return marketplaceRequest<{
    registrations: MarketplaceAuctionRegistration[];
  }>("/my-auction-registrations", { locale, auth: "required" });
}
