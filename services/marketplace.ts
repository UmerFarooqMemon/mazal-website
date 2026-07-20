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

export interface MarketplaceAuction {
  starts_at: string;
  ends_at: string;
  reserve_price: number;
}

export interface MarketplaceReveal {
  id: number;
  status: string;
  fee_amount: number;
  revealed_at: string | null;
  decision_expires_at: string | null;
  decision_window_hours: number;
  seconds_remaining: number;
  is_active: boolean;
  credited_to_purchase: boolean;
}

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
  seller: MarketplaceSeller;
  is_watchlisted?: boolean;
  preview?: MarketplaceListingPreview | null;
  published_at: string;
}

export interface MarketplaceListingDetail extends MarketplaceListingCard {
  description?: string | null;
  auction?: MarketplaceAuction | null;
  reveal?: MarketplaceReveal | null;
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
  buyer?: { id: number; name: string };
  created_at: string;
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

  if (options.locale) {
    headers["Accept-Language"] = options.locale;
  }

  if (options.contentType) {
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

export function mapListingToPlateCard(listing: MarketplaceListingCard) {
  const code =
    listing.plate_code && listing.plate_digits
      ? `${listing.plate_code} | ${listing.plate_digits}`
      : listing.display_plate;

  return {
    id: listing.id,
    emirate: listing.emirate_label?.toUpperCase() || listing.emirate,
    code,
    price: listing.asking_price,
    type: listing.listing_type_label?.toUpperCase() || listing.listing_type,
    views: listing.view_count,
    rating: listing.seller?.rating ?? 0,
    previouslySold: listing.previously_sold,
    isFavorite: listing.is_watchlisted,
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

// 15. Get Reveal Status
export function getRevealStatus(listingId: string | number, locale: string) {
  return marketplaceRequest<{
    reveal_fee_amount: number;
    reveal: MarketplaceReveal | null;
    code_hidden: boolean;
  }>(`/listings/${listingId}/reveal`, { locale, auth: "required" });
}

// 16. Initiate Reveal
export function initiateReveal(listingId: string | number, locale: string) {
  return marketplaceRequest<{
    reveal: MarketplaceReveal;
    reveal_fee_amount: number;
    message: string;
  }>(`/listings/${listingId}/reveal`, {
    method: "POST",
    locale,
    auth: "required",
  });
}

// 17. Confirm Reveal Payment
export function confirmRevealPayment(
  listingId: string | number,
  locale: string,
  paymentReference?: string,
) {
  return marketplaceRequest<{
    reveal: MarketplaceReveal;
    listing: MarketplaceListingDetail;
  }>(`/listings/${listingId}/reveal/confirm`, {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify({
      payment_reference: paymentReference,
    }),
  });
}

// 18. Proceed After Reveal
export function proceedAfterReveal(listingId: string | number, locale: string) {
  return marketplaceRequest<{
    reveal: MarketplaceReveal;
    credit_applied: number;
    message: string;
  }>(`/listings/${listingId}/reveal/proceed`, {
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

// 22. Get Notification Settings
export function getNotificationSettings(locale: string) {
  return marketplaceRequest<MarketplaceNotificationSettings>(
    "/notification-settings",
    { locale, auth: "required" },
  );
}

// 23. Update Notification Settings
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
