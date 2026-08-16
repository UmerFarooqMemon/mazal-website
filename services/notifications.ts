import { normalizeAcceptLanguage } from "@/lib/api-config";

export const NOTIFICATIONS_CHANGED_EVENT = "notifications-changed";

export type NotificationFilter = "all" | "read" | "unread";

export type NotificationIcon =
  | "gavel"
  | "tag"
  | "handshake"
  | "wallet"
  | "user"
  | "certificate"
  | "bell"
  | string;

export interface NotificationData {
  type?: string;
  listing_id?: number | string;
  offer_id?: number | string;
  auction_id?: number | string;
  purchase_id?: number | string;
  certificate_id?: number | string;
  valuation_id?: number | string;
  private_deal_id?: number | string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: number;
  type: string;
  icon: NotificationIcon;
  title: string;
  body: string;
  data: NotificationData;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  created_at_human: string;
}

export interface NotificationsListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  unread_count: number;
  filter: NotificationFilter | string;
}

export interface NotificationsListResult {
  items: AppNotification[];
  meta: NotificationsListMeta;
}

interface NotificationsApiResponse<T> {
  status?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

const LOCALES = ["en", "ar", "zh", "ru"];

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function formatError(payload: {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}) {
  if (payload.errors) {
    const first = Object.values(payload.errors).flat()[0];
    if (first) return first;
  }
  return payload.message || payload.error || "Request failed.";
}

export function emitNotificationsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

async function notificationsRequest<T>(
  path: string,
  options: {
    method?: string;
    locale?: string;
  } = {},
): Promise<NotificationsApiResponse<T>> {
  const token = getToken();
  if (!token) {
    throw new Error("Please login to continue.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Accept-Language": normalizeAcceptLanguage(options.locale),
  };

  const response = await fetch(`/api/notifications${path}`, {
    method: options.method || "GET",
    headers,
  });

  const responseType = response.headers.get("content-type") || "";
  if (!responseType.includes("application/json")) {
    throw new Error("Unexpected response from server.");
  }

  const payload = await response.json();
  if (!response.ok || payload.status === false) {
    throw new Error(formatError(payload));
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

function dataId(data: NotificationData | undefined, keys: string[]): string | null {
  if (!data) return null;
  for (const key of keys) {
    const value = data[key];
    if (value != null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return null;
}

function withLocale(path: string, locale: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const segments = normalized.split("/").filter(Boolean);
  if (segments[0] && LOCALES.includes(segments[0])) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }
  return `/${locale}${normalized}`;
}

function hrefFromActionUrl(
  actionUrl: string | null | undefined,
  locale: string,
): string | null {
  if (!actionUrl?.trim()) return null;
  const raw = actionUrl.trim();

  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      if (url.pathname.startsWith("/api")) return null;
      return withLocale(`${url.pathname}${url.search}`, locale);
    }
  } catch {
    return null;
  }

  if (raw.startsWith("/api")) return null;
  return withLocale(raw, locale);
}

export function getNotificationHref(
  notification: Pick<AppNotification, "type" | "action_url" | "data">,
  locale: string,
): string | undefined {
  const fromAction = hrefFromActionUrl(notification.action_url, locale);
  if (fromAction) return fromAction;

  const data = notification.data || {};
  const listingId = dataId(data, ["listing_id"]);
  const auctionId = dataId(data, ["auction_id"]);
  const offerId = dataId(data, ["offer_id"]);
  const certificateId = dataId(data, ["certificate_id", "valuation_id"]);

  switch (notification.type) {
    case "offer_received":
    case "offer_accepted":
    case "offer_countered":
      if (listingId) return `/${locale}/marketplace/${listingId}`;
      return `/${locale}/buyer/offers`;

    case "listing_approved":
    case "listing_rejected":
      if (listingId) return `/${locale}/listings/${listingId}`;
      return `/${locale}/marketplace`;

    case "auction_new_bid":
    case "auction_outbid":
    case "auction_won":
    case "auction_lost":
      if (auctionId) return `/${locale}/auctions/${auctionId}`;
      return `/${locale}/auctions`;

    case "kyc_approved":
    case "kyc_rejected":
    case "emirates_id_verified":
      return `/${locale}/kyc`;

    case "wallet_deposit_verified":
    case "wallet_cash_out_completed":
      return `/${locale}/wallet`;

    case "private_deal_payment_verified":
    case "private_deal_completed":
      return `/${locale}/private-deal`;

    case "purchase_created":
    case "purchase_partially_funded":
    case "purchase_payment_verified":
    case "purchase_payment_rejected":
    case "purchase_completed":
    case "purchase_cancelled": {
      const purchaseListingId = listingId || auctionId;
      if (auctionId) return `/${locale}/auctions/${auctionId}/checkout`;
      if (purchaseListingId) {
        return `/${locale}/listings/${purchaseListingId}/checkout`;
      }
      return `/${locale}/buyer/transactions`;
    }

    case "valuation_certificate_ready":
      if (certificateId) return `/${locale}/valuation/${certificateId}`;
      return `/${locale}/dashboard-certificates`;

    case "welcome":
      return `/${locale}/dashboard`;

    default:
      if (listingId) return `/${locale}/marketplace/${listingId}`;
      if (auctionId) return `/${locale}/auctions/${auctionId}`;
      if (offerId) return `/${locale}/buyer/offers`;
      return undefined;
  }
}

export function listNotifications(options: {
  locale?: string;
  filter?: NotificationFilter;
  perPage?: number;
  page?: number;
}) {
  const query = buildQuery({
    filter: options.filter,
    per_page: options.perPage,
    page: options.page,
  });

  return notificationsRequest<NotificationsListResult>(query, {
    locale: options.locale,
  });
}

export async function getUnreadCount(locale?: string): Promise<number> {
  const payload = await notificationsRequest<{ unread_count: number }>(
    "/unread-count",
    { locale },
  );
  return payload.data?.unread_count ?? 0;
}

export function markNotificationRead(id: number, locale?: string) {
  return notificationsRequest<AppNotification>(`/${id}/read`, {
    method: "POST",
    locale,
  });
}

export function markNotificationUnread(id: number, locale?: string) {
  return notificationsRequest<AppNotification>(`/${id}/unread`, {
    method: "POST",
    locale,
  });
}

export function markAllNotificationsRead(locale?: string) {
  return notificationsRequest<{ updated: number; unread_count: number }>(
    "/mark-all-read",
    { method: "POST", locale },
  );
}
