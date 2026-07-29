import type { PlatePreviewConfig } from "@/lib/plate-preview";

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

/**
 * Listings carry the same render config as the number-plate options endpoint
 * (background image + overlay positions), so the plate can be drawn exactly as
 * the API describes it instead of guessing from plate_type / plate_design.
 */
export interface MarketplaceListingPreview extends PlatePreviewConfig {
  image_url?: string;
  style?: string;
}

export interface MarketplaceAuctionBidSummary {
  id: number;
  amount: number | string;
  bidder?: { id: number | null; name: string };
}

export interface MarketplaceAuctionProviderTransaction {
  id: number;
  provider: string;
  status: string;
  tran_ref?: string | null;
  amount?: number | string;
  currency?: string;
  redirect_url?: string | null;
  initiated_at?: string | null;
  processed_at?: string | null;
}

export type AuctionDepositApiMethod =
  | "card"
  | "bank_transfer"
  | "managers_check"
  | "cash_collection";

export interface MarketplaceAuctionBankInstructions {
  method?: string;
  configured?: boolean;
  recipient?: string;
  notice?: string;
  reference?: string;
  amount?: number | string;
  account_holder_name?: string | null;
  bank_name?: string | null;
  iban?: string | null;
  swift_bic?: string | null;
  cheque_payee?: string | null;
  collection_location?: string | null;
  collection_address?: string | null;
  provider?: string;
}

export interface MarketplaceAuctionDepositMethod {
  key: AuctionDepositApiMethod | string;
  label: string;
  offline?: boolean;
  instructions?: MarketplaceAuctionBankInstructions | Record<string, unknown>;
}

export interface MarketplaceAuctionRegistration {
  id: number;
  listing_id: number;
  status: string;
  status_label?: string;
  deposit_amount: number | string;
  deposit_status: string;
  deposit_status_label?: string;
  deposit_method?: AuctionDepositApiMethod | string | null;
  deposit_method_label?: string | null;
  deposit_details?: Record<string, unknown> | null;
  deposit_held_at?: string | null;
  deposit_released_at?: string | null;
  deposit_submitted_at?: string | null;
  deposit_rejected_at?: string | null;
  deposit_rejection_reason?: string | null;
  has_evidence?: boolean;
  evidence_url?: string | null;
  custody_instructions?: MarketplaceAuctionBankInstructions | null;
  no_show_penalty_amount?: number | string | null;
  no_show_marked_at?: string | null;
  registered_at?: string | null;
  provider_transaction?: MarketplaceAuctionProviderTransaction | null;
  paytabs_configured?: boolean;
  user?: { id: number; name: string };
  listing?:
    | MarketplaceListingCard
    | {
        id: number;
        title?: string;
        display_plate?: string;
        auction_outcome?: string | null;
      }
    | null;
  created_at?: string;
  updated_at?: string;
}

export interface MarketplaceAuction {
  // Open (untimed) auctions publish without a schedule.
  starts_at: string | null;
  ends_at: string | null;
  reserve_price?: number | string | null;
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
  status_label?: string;
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
  asking_price: number | string;
  hide_code: boolean;
  code_hidden: boolean;
  view_count: number;
  watcher_count: number;
  trending_score?: number;
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
  start_date?: string | null;
  end_date?: string | null;
  is_scheduled?: boolean;
  auction?: MarketplaceAuction | null;
}

export interface MarketplaceListingPlan {
  id: number | null;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  currency: string;
  duration_days?: number | null;
  features: string[];
  is_featured?: boolean;
  is_free?: boolean;
  requires_payment?: boolean;
  sort_order?: number;
}

export interface MarketplaceListingPlanSummary {
  id: number | null;
  name: string;
  price: string | null;
  duration_days?: number | null;
  is_free?: boolean;
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
  listing_plan?: MarketplaceListingPlanSummary | null;
  plan_payment_status?:
    | "not_required"
    | "pending"
    | "paid"
    | "failed"
    | string;
  needs_plan_payment?: boolean;
  has_ownership_document?: boolean;
}

export interface MarketplaceOffer {
  id: number;
  listing_id: number;
  amount: number;
  message?: string | null;
  status: string;
  status_label: string;
  decision_note?: string | null;
  initiated_by?: "buyer" | "seller" | string;
  parent_offer_id?: number | null;
  is_seller_counter?: boolean;
  is_final?: boolean;
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

export interface MarketplaceCounterOfferQuota {
  limit: number;
  used: number;
  remaining: number;
  can_counter: boolean;
  can_negotiate: boolean;
  has_pending_final: boolean;
}

export interface MarketplaceListingPlanTransaction {
  id: number;
  listing_id: number;
  listing_plan_id?: number | null;
  provider: string;
  status: string;
  tran_ref?: string | null;
  amount: string;
  currency: string;
  redirect_url?: string | null;
  initiated_at?: string | null;
  processed_at?: string | null;
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
  asking_price: number | string;
  description?: string;
  hide_code?: boolean;
  status?: "draft" | "pending_approval" | "pending_plan_payment";
  auction_starts_at?: string | null;
  auction_ends_at?: string | null;
  auction_reserve_price?: number | null;
  previously_sold?: boolean;
  listing_plan_id?: number | string | null;
  ownership_document?: File | Blob | null;
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

export function toMarketplaceNumber(
  value: number | string | null | undefined,
): number {
  if (value == null || value === "") return 0;
  const parsed =
    typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function resolveListingAskingPrice(
  listing: Pick<MarketplaceListingCard, "asking_price"> & {
    auction?: MarketplaceAuction | null;
  },
): number {
  const askingPrice = toMarketplaceNumber(listing.asking_price);
  if (askingPrice > 0) return askingPrice;

  const auction = listing.auction;
  if (!auction) return askingPrice;

  return (
    toMarketplaceNumber(auction.starting_price) ||
    toMarketplaceNumber(auction.reserve_price) ||
    toMarketplaceNumber(auction.current_high_bid)
  );
}

type HiddenCodeSource = {
  hide_code?: boolean | number | string | null;
  code_hidden?: boolean | number | string | null;
};

export function isHiddenPlateCode(
  listing: HiddenCodeSource | null | undefined,
): boolean {
  if (!listing) return false;
  const flag = (value: unknown) =>
    value === true || value === 1 || value === "1" || value === "true";
  // code_hidden is viewer-specific (false after reveal payment).
  // hide_code is the listing setting and stays true after reveal — only
  // fall back to it when code_hidden is absent from the payload.
  if (listing.code_hidden != null) {
    return flag(listing.code_hidden);
  }
  return flag(listing.hide_code);
}

/**
 * Splits `display_plate` into code + digits. Hidden listings arrive masked
 * (e.g. "A •••"), so the digits part may be mask glyphs rather than numbers.
 */
function splitDisplayPlate(displayPlate?: string | null) {
  const raw = String(displayPlate || "").trim();
  if (!raw) return { code: "", digits: "" };

  const match = raw.match(/^([A-Za-z]+)?\s*[-|]?\s*(.*)$/);
  if (!match) return { code: "", digits: raw };

  // Plate codes are at most 3 letters; longer prefixes are emirate names
  // (e.g. "Dubai • • •"), which must not be mistaken for a code.
  const prefix = match[1] || "";
  const isCode = prefix.length > 0 && prefix.length <= 3;

  return {
    code: isCode ? prefix.toUpperCase() : "",
    digits: (isCode ? match[2] : raw.slice(prefix.length)).trim(),
  };
}

type PlateSource = HiddenCodeSource & {
  plate_code?: string | null;
  plate_digits?: string | null;
  display_plate?: string | null;
  title?: string | null;
};

/**
 * Resolves plate code + digits for display.
 * Title digits are only used when the code is currently hidden from the
 * viewer (code_hidden) — those listings null out plate_digits and mask
 * display_plate, but title still ends with the real number (e.g.
 * "dubai A 433"). Normal / revealed listings keep using plate_code /
 * plate_digits / display_plate only.
 */
export function resolvePlateParts(listing?: PlateSource | null) {
  if (!listing) return { code: "", digits: "" };

  const fromDisplay = splitDisplayPlate(listing.display_plate);
  const code = listing.plate_code || fromDisplay.code;

  if (!isHiddenPlateCode(listing)) {
    return {
      code,
      digits: listing.plate_digits || fromDisplay.digits,
    };
  }

  const titleDigits = String(listing.title || "").match(/(\d+)\s*$/)?.[1] || "";

  return {
    code,
    digits: listing.plate_digits || titleDigits || fromDisplay.digits,
  };
}

/**
 * Returns the listing's plate render config, or null when the payload only has
 * the legacy `{ image_url, style }` shape — those cannot be rendered as a plate
 * and must fall back to the options lookup.
 */
export function resolveListingPreview(
  listing?: { preview?: MarketplaceListingPreview | null } | null,
): PlatePreviewConfig | null {
  const preview = listing?.preview;
  if (!preview) return null;

  const hasBackground = Boolean(
    preview.background_image?.url || preview.background_image_url,
  );

  return hasBackground ? preview : null;
}

export function mapListingToPlateCard(listing: MarketplaceListingCard) {
  const { code: plateCode, digits: plateDigits } = resolvePlateParts(listing);

  const hideCode = isHiddenPlateCode(listing);

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
    price: resolveListingAskingPrice(listing),
    type: listing.listing_type_label?.toUpperCase() || listing.listing_type,
    tier,
    views: listing.view_count,
    rating: listing.seller?.rating ?? 0,
    previouslySold: listing.previously_sold,
    isFavorite: listing.is_watchlisted,
    hideCode,
    preview: resolveListingPreview(listing),
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
  if (payload.ownership_document) {
    const formData = new FormData();
    formData.append("listing_type", payload.listing_type);
    formData.append("title", payload.title);
    formData.append("emirate", payload.emirate);
    formData.append("plate_digits", payload.plate_digits);
    formData.append("asking_price", String(payload.asking_price));
    if (payload.plate_variant) formData.append("plate_variant", payload.plate_variant);
    if (payload.plate_type) formData.append("plate_type", payload.plate_type);
    if (payload.plate_code) formData.append("plate_code", payload.plate_code);
    if (payload.plate_design) formData.append("plate_design", payload.plate_design);
    if (payload.description) formData.append("description", payload.description);
    if (payload.hide_code != null) {
      formData.append("hide_code", payload.hide_code ? "1" : "0");
    }
    if (payload.status) formData.append("status", payload.status);
    if (payload.auction_starts_at) {
      formData.append("auction_starts_at", payload.auction_starts_at);
    }
    if (payload.auction_ends_at) {
      formData.append("auction_ends_at", payload.auction_ends_at);
    }
    if (payload.auction_reserve_price != null) {
      formData.append(
        "auction_reserve_price",
        String(payload.auction_reserve_price),
      );
    }
    if (
      payload.listing_plan_id !== undefined &&
      payload.listing_plan_id !== null &&
      payload.listing_plan_id !== ""
    ) {
      formData.append("listing_plan_id", String(payload.listing_plan_id));
    }
    if (payload.previously_sold != null) {
      formData.append("previously_sold", payload.previously_sold ? "1" : "0");
    }
    formData.append("ownership_document", payload.ownership_document);

    return marketplaceRequest<{ listing: MarketplaceListingDetail }>(
      "/listings",
      {
        method: "POST",
        locale,
        auth: "required",
        body: formData,
      },
    );
  }

  const { ownership_document: _file, ...jsonPayload } = payload;
  return marketplaceRequest<{ listing: MarketplaceListingDetail }>("/listings", {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify(jsonPayload),
  });
}

/** Public catalogue of listing plans (Free option when free_listings_enabled). */
export function getListingPlans(locale: string) {
  return marketplaceRequest<{
    free_listings_enabled: boolean;
    payment_required_for_paid_plans?: boolean;
    checkout_hint?: string;
    listing_plans: MarketplaceListingPlan[];
  }>("/listing-plans", { locale });
}

/** PayTabs checkout for a listing waiting on plan payment. */
export function createListingPlanCheckout(
  listingId: string | number,
  locale: string,
) {
  return marketplaceRequest<{
    redirect_url: string;
    transaction?: MarketplaceListingPlanTransaction;
    listing?: MarketplaceListingDetail;
  }>(`/listings/${listingId}/listing-plan/paytabs/checkout`, {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify({}),
  });
}

/** Download ownership document (seller only) — returns blob URL helper via fetch. */
export async function downloadOwnershipDocument(
  listingId: string | number,
  locale: string,
) {
  const token = getToken();
  if (!token) throw new Error("Please login to continue.");

  const response = await fetch(
    `/api/marketplace/listings/${listingId}/ownership-document`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": locale === "ar" ? "ar" : "en",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to download ownership document.");
  }

  return response.blob();
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
  payload: { amount: number; message?: string; is_final?: boolean },
  locale: string,
) {
  return marketplaceRequest<{
    offer: MarketplaceOffer;
    counter_offer_quota?: MarketplaceCounterOfferQuota;
  }>(`/listings/${listingId}/offers`, {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

// 20. Get Listing Offers (Seller)
export function getListingOffers(listingId: string | number, locale: string) {
  return marketplaceRequest<{
    offers: MarketplaceOffer[];
    counter_offer_limit?: number;
  }>(`/listings/${listingId}/offers`, { locale, auth: "required" });
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

/** Seller counter-offer → creates a new pending offer initiated_by=seller. */
export function counterOffer(
  offerId: string | number,
  payload: { amount: number; message?: string; is_final?: boolean },
  locale: string,
) {
  return marketplaceRequest<{
    offer: MarketplaceOffer;
    counter_offer_quota?: MarketplaceCounterOfferQuota;
  }>(`/offers/${offerId}/counter`, {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

/** Seller final counter (locks further negotiation). */
export function finalOffer(
  offerId: string | number,
  payload: { amount: number; message?: string },
  locale: string,
) {
  return marketplaceRequest<{
    offer: MarketplaceOffer;
    counter_offer_quota?: MarketplaceCounterOfferQuota;
  }>(`/offers/${offerId}/final`, {
    method: "POST",
    locale,
    auth: "required",
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

/** End negotiation without accepting (typical after a final offer). */
export function endNegotiation(
  offerId: string | number,
  locale: string,
  reason?: string,
) {
  return marketplaceRequest<{ offer: MarketplaceOffer }>(
    `/offers/${offerId}/end-negotiation`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify({ reason }),
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

// 45. Confirm Auction Deposit (Fake Local — requires MARKETPLACE_FAKE_AUCTION_DEPOSITS)
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

// 45b. PayTabs Auction Deposit Checkout (production)
export function createAuctionDepositCheckout(
  listingId: string | number,
  registrationId: string | number,
  locale: string,
) {
  return marketplaceRequest<{
    redirect_url: string;
    transaction?: MarketplaceAuctionProviderTransaction;
    registration?: MarketplaceAuctionRegistration;
  }>(
    `/listings/${listingId}/auction/registrations/${registrationId}/paytabs/checkout`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify({}),
    },
  );
}

// 45c. Auction deposit methods catalog (card + offline)
export function getAuctionDepositMethods(
  listingId: string | number,
  registrationId: string | number,
  locale: string,
) {
  return marketplaceRequest<{
    methods: MarketplaceAuctionDepositMethod[];
    bank_instructions: MarketplaceAuctionBankInstructions;
    deposit_amount?: number | string;
    reference?: string;
  }>(
    `/listings/${listingId}/auction/registrations/${registrationId}/deposit/methods`,
    { locale, auth: "required" },
  );
}

// 45d. Bank transfer instructions (MAZAL_CUSTODY_*)
export function getAuctionBankInstructions(
  listingId: string | number,
  registrationId: string | number,
  locale: string,
) {
  return marketplaceRequest<{
    bank_instructions: MarketplaceAuctionBankInstructions;
  }>(
    `/listings/${listingId}/auction/registrations/${registrationId}/deposit/bank-instructions`,
    { locale, auth: "required" },
  );
}

// 45e. Submit bank transfer proof (multipart)
export function submitAuctionBankProof(
  listingId: string | number,
  registrationId: string | number,
  locale: string,
  payload: {
    payment_reference: string;
    notes?: string;
    evidence: File;
  },
) {
  const formData = new FormData();
  formData.append("payment_reference", payload.payment_reference);
  if (payload.notes) formData.append("notes", payload.notes);
  formData.append("evidence", payload.evidence);

  return marketplaceRequest<{ registration: MarketplaceAuctionRegistration }>(
    `/listings/${listingId}/auction/registrations/${registrationId}/deposit/proof`,
    {
      method: "POST",
      locale,
      auth: "required",
      body: formData,
    },
  );
}

// 45f. Submit manager's check deposit
export function submitAuctionManagersCheck(
  listingId: string | number,
  registrationId: string | number,
  locale: string,
  payload: {
    check_number: string;
    collection_date: string;
    collection_time: string;
    notes?: string;
  },
) {
  return marketplaceRequest<{ registration: MarketplaceAuctionRegistration }>(
    `/listings/${listingId}/auction/registrations/${registrationId}/deposit/managers-check`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify(payload),
    },
  );
}

// 45g. Submit cash collection deposit
export function submitAuctionCashCollection(
  listingId: string | number,
  registrationId: string | number,
  locale: string,
  payload: {
    collection_date: string;
    collection_time: string;
    notes?: string;
  },
) {
  return marketplaceRequest<{ registration: MarketplaceAuctionRegistration }>(
    `/listings/${listingId}/auction/registrations/${registrationId}/deposit/cash-collection`,
    {
      method: "POST",
      locale,
      auth: "required",
      contentType: "application/json",
      body: JSON.stringify(payload),
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
