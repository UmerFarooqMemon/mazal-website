export type NotificationType =
  | "bid"
  | "offer"
  | "auction"
  | "escrow"
  | "kyc"
  | "wallet"
  | "listing"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  titleKey: string;
  bodyKey: string;
  href?: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = "mazal_notifications";
export const NOTIFICATIONS_CHANGED_EVENT = "notifications-changed";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function seedNotifications(): AppNotification[] {
  return [
    {
      id: "n1",
      type: "bid",
      titleKey: "notifications.seed_bid_title",
      bodyKey: "notifications.seed_bid_body",
      href: "/auctions",
      createdAt: hoursAgo(0.5),
      read: false,
    },
    {
      id: "n2",
      type: "offer",
      titleKey: "notifications.seed_offer_title",
      bodyKey: "notifications.seed_offer_body",
      href: "/marketplace",
      createdAt: hoursAgo(2),
      read: false,
    },
    {
      id: "n3",
      type: "escrow",
      titleKey: "notifications.seed_escrow_title",
      bodyKey: "notifications.seed_escrow_body",
      href: "/private-deal",
      createdAt: hoursAgo(5),
      read: false,
    },
    {
      id: "n4",
      type: "auction",
      titleKey: "notifications.seed_auction_title",
      bodyKey: "notifications.seed_auction_body",
      href: "/auctions",
      createdAt: hoursAgo(10),
      read: false,
    },
    {
      id: "n5",
      type: "wallet",
      titleKey: "notifications.seed_wallet_title",
      bodyKey: "notifications.seed_wallet_body",
      href: "/wallet",
      createdAt: hoursAgo(18),
      read: true,
    },
    {
      id: "n6",
      type: "kyc",
      titleKey: "notifications.seed_kyc_title",
      bodyKey: "notifications.seed_kyc_body",
      href: "/kyc",
      createdAt: hoursAgo(26),
      read: true,
    },
    {
      id: "n7",
      type: "listing",
      titleKey: "notifications.seed_listing_title",
      bodyKey: "notifications.seed_listing_body",
      href: "/marketplace",
      createdAt: hoursAgo(40),
      read: false,
    },
    {
      id: "n8",
      type: "system",
      titleKey: "notifications.seed_system_title",
      bodyKey: "notifications.seed_system_body",
      createdAt: hoursAgo(72),
      read: true,
    },
  ];
}

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

function readStore(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedNotifications();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as AppNotification[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = seedNotifications();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    const seeded = seedNotifications();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeStore(items: AppNotification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emitChange();
}

export function getNotifications(): AppNotification[] {
  return readStore().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export function markNotificationRead(id: string, read = true): AppNotification[] {
  const next = readStore().map((item) =>
    item.id === id ? { ...item, read } : item,
  );
  writeStore(next);
  return next.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function toggleNotificationRead(id: string): AppNotification[] {
  const current = readStore().find((item) => item.id === id);
  if (!current) return getNotifications();
  return markNotificationRead(id, !current.read);
}

export function markAllNotificationsRead(): AppNotification[] {
  const next = readStore().map((item) => ({ ...item, read: true }));
  writeStore(next);
  return next.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
