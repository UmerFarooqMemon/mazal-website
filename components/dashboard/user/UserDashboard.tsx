"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Eye,
  FileBadge,
  LayoutList,
  Search,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui";
import {
  getMyListings,
  getWatchlist,
  removeFromWatchlist,
  type MarketplaceListingCard,
} from "@/services/marketplace";
import { normalizeAcceptLanguage } from "@/lib/api-config";
import DashboardListingsPanel, {
  type DashboardListingRow,
  type MarketplaceStatus,
  type PrivateDealRow,
} from "./DashboardListingsPanel";
import DashboardCertificatesPanel, {
  type CertificateRow,
} from "./DashboardCertificatesPanel";
import DashboardWatchlistPanel from "./DashboardWatchlistPanel";
import DashboardCollectionPanel, {
  type CollectionRow,
} from "./DashboardCollectionPanel";
import DashboardWalletPanel from "./DashboardWalletPanel";
import DashboardBoostOverlay from "./DashboardBoostOverlay";
import RateSellerModal from "./RateSellerModal";
import type { CollectionMode, DashboardView, ListingDealTab } from "./types";
import {
  DASH_BG,
  DASH_BORDER,
  DASH_BTN,
  DASH_GREEN,
  DASH_GREEN_DARK,
  DASH_ICON_BORDER,
  DASH_MUTED,
  DASH_SURFACE,
  DASH_TEXT,
} from "./theme";

const FALLBACK_MARKETPLACE: DashboardListingRow[] = [
  {
    id: "m1",
    plate_code: "A",
    plate_digits: "7",
    emirate: "dubai",
    askingPrice: 450000,
    offerLabel: "Highest Offer",
    offerAmount: 450000,
    status: "awaiting_offer",
    href: "#",
    boostTier: "SILVER",
  },
  {
    id: "m2",
    plate_code: "KK",
    plate_digits: "87897",
    emirate: "dubai",
    askingPrice: 450000,
    offerLabel: "Accepted Offer",
    offerAmount: 445000,
    status: "awaiting_payment",
    href: "#",
    boostTier: "GOLD",
  },
  {
    id: "m3",
    plate_code: "B",
    plate_digits: "12",
    emirate: "dubai",
    askingPrice: 450000,
    offerLabel: "Highest Offer",
    offerAmount: 450000,
    status: "in_transit",
    href: "#",
    boostTier: "DIAMOND",
  },
  {
    id: "m4",
    plate_code: "C",
    plate_digits: "99",
    emirate: "dubai",
    askingPrice: 450000,
    offerLabel: "Highest Offer",
    offerAmount: 450000,
    status: "completed",
    href: "#",
    boostTier: "SILVER",
  },
];

const FALLBACK_PRIVATE: PrivateDealRow[] = [
  {
    id: "p1",
    plate_code: "D",
    plate_digits: "5",
    emirate: "dubai",
    askingPrice: 450000,
    status: "pending_transfer",
    showTransferCta: true,
    href: "#",
  },
  {
    id: "p2",
    plate_code: "E",
    plate_digits: "88",
    emirate: "dubai",
    askingPrice: 450000,
    status: "pending_purchase",
    href: "#",
  },
  {
    id: "p3",
    plate_code: "F",
    plate_digits: "21",
    emirate: "dubai",
    askingPrice: 450000,
    status: "awaiting_payment",
    href: "#",
  },
  {
    id: "p4",
    plate_code: "G",
    plate_digits: "9",
    emirate: "dubai",
    askingPrice: 450000,
    status: "completed",
    href: "#",
  },
];

function mapListingStatus(status: string): MarketplaceStatus {
  const s = status.toLowerCase();
  if (/(complete|sold|closed|done)/.test(s)) return "completed";
  if (/(transit|delivery|ship)/.test(s)) return "in_transit";
  if (/(payment|escrow|paid)/.test(s)) return "awaiting_payment";
  return "awaiting_offer";
}

function matchesQuery(
  query: string,
  code?: string | null,
  digits?: string | null,
) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return `${code || ""} ${digits || ""}`.toLowerCase().includes(q);
}

export default function UserDashboard() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const [view, setView] = useState<DashboardView>("listings");
  const [listingTab, setListingTab] = useState<ListingDealTab>("marketplace");
  const [collectionMode, setCollectionMode] = useState<CollectionMode>("list");
  const [search, setSearch] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [marketplaceRows, setMarketplaceRows] =
    useState<DashboardListingRow[]>(FALLBACK_MARKETPLACE);
  const [watchlist, setWatchlist] = useState<MarketplaceListingCard[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [collection, setCollection] = useState<CollectionRow[]>([]);
  const [certFilter, setCertFilter] = useState<"All" | "Pending" | "Issued">(
    "All",
  );
  const [rateOpen, setRateOpen] = useState(false);
  const [boostListing, setBoostListing] = useState<DashboardListingRow | null>(
    null,
  );
  const [stats, setStats] = useState({
    listings: 4,
    certificates: 5,
    watchlist: 10,
    collection: 15,
    wallet: 1,
  });

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getMyListings(locale),
      getWatchlist(locale),
      fetch("/api/number-plates", {
        headers: {
          Accept: "application/json",
          "Accept-Language": normalizeAcceptLanguage(locale),
          ...(typeof window !== "undefined" && token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
      }).then((r) => r.json()),
    ]).then(([listingsRes, watchRes, platesRes]) => {
      if (!active) return;
      const nextStats = { ...stats };

      if (listingsRes.status === "fulfilled") {
        const listings = listingsRes.value.data?.listings || [];
        if (listings.length) {
          nextStats.listings = listings.length;
          setMarketplaceRows(
            listings.map((listing) => ({
              id: listing.id,
              plate_code: listing.plate_code || undefined,
              plate_digits: String(listing.plate_digits || ""),
              emirate: listing.emirate,
              plateType: listing.plate_type || undefined,
              plateDesign: listing.plate_design || undefined,
              preview: listing.preview,
              askingPrice: Number(listing.asking_price) || 0,
              offerLabel: t("dashboard.highest_offer"),
              offerAmount: Number(listing.asking_price) || 0,
              status: mapListingStatus(listing.status),
              href: `/${locale}/listings/${listing.id}`,
              listingPlan: listing.listing_plan ?? null,
              boostTier:
                listing.boost_tier ||
                listing.featured_tier ||
                listing.tier ||
                listing.listing_plan?.name ||
                null,
            })),
          );
        }
      }

      if (watchRes.status === "fulfilled") {
        const data = watchRes.value.data;
        const categorized = (data?.categories || []).flatMap(
          (cat) => cat.items || [],
        );
        const uncategorized = data?.uncategorized || [];
        const items = [...categorized, ...uncategorized]
          .map((item) => item.listing)
          .filter(Boolean);
        if (items.length) {
          nextStats.watchlist = items.length;
          setWatchlist(items);
        }
      }

      if (platesRes.status === "fulfilled") {
        const result = platesRes.value;
        const list: Array<Record<string, unknown>> =
          result?.data?.number_plates ||
          (Array.isArray(result?.data) ? result.data : []) ||
          [];
        if (Array.isArray(list) && list.length) {
          nextStats.certificates = list.length;
          nextStats.collection = list.length;
          setCertificates(
            list.map((req) => {
              const status = String(req.status || "").toLowerCase();
              const issued = ["completed", "approved", "issued"].includes(
                status,
              );
              return {
                id: (req.id as string | number) || String(Math.random()),
                emirate: String(
                  req.emirate_label || req.emirate || "dubai",
                ),
                plate_code: String(req.plate_code || ""),
                plate_digits: String(req.plate_digits || ""),
                status: issued ? "Issued" : "Pending",
                askingPrice: Number(req.price || req.asking_price || 450000),
                preview: req.preview,
              };
            }),
          );
          setCollection(
            list.map((req) => ({
              id: (req.id as string | number) || String(Math.random()),
              plate_code: String(req.plate_code || ""),
              plate_digits: String(req.plate_digits || ""),
              emirate: String(req.emirate_label || req.emirate || "dubai"),
              plateType: req.plate_type as string | undefined,
              plateDesign: req.plate_design as string | undefined,
              preview: req.preview,
              addedAt: String(req.created_at || ""),
              valuatedAt: String(
                req.valuated_at || req.updated_at || req.created_at || "",
              ),
            })),
          );
        }
      }

      setStats(nextStats);
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, t, token]);

  const query = submittedQuery;

  const filteredListings = useMemo(
    () =>
      marketplaceRows.filter((row) =>
        matchesQuery(query, row.plate_code, row.plate_digits),
      ),
    [marketplaceRows, query],
  );
  const filteredWatchlist = useMemo(
    () =>
      watchlist.filter((row) =>
        matchesQuery(query, row.plate_code, row.plate_digits),
      ),
    [watchlist, query],
  );
  const filteredCertificates = useMemo(
    () =>
      certificates.filter((row) =>
        matchesQuery(query, row.plate_code, row.plate_digits),
      ),
    [certificates, query],
  );
  const filteredCollection = useMemo(
    () =>
      collection.filter((row) =>
        matchesQuery(query, row.plate_code, row.plate_digits),
      ),
    [collection, query],
  );

  const cards = [
    {
      key: "listings" as const,
      label: t("dashboard.stat_listing"),
      value: stats.listings,
      icon: LayoutList,
    },
    {
      key: "certificates" as const,
      label: t("dashboard.stat_valuation_certificate"),
      value: stats.certificates,
      icon: FileBadge,
    },
    {
      key: "watchlist" as const,
      label: t("dashboard.stat_watchlist"),
      value: stats.watchlist,
      icon: Eye,
    },
    {
      key: "collection" as const,
      label: t("dashboard.stat_collection"),
      value: stats.collection,
      icon: Bookmark,
    },
    {
      key: "wallet" as const,
      label: t("dashboard.stat_wallet"),
      value: stats.wallet,
      icon: Wallet,
    },
  ];

  const selectView = (next: DashboardView) => {
    setView(next);
    if (next !== "collection") setCollectionMode("list");
    if (next === "listings") setListingTab("marketplace");
  };

  const runSearch = () => {
    setSubmittedQuery(search);
  };

  const handleRemoveWatch = async (listingId: number) => {
    try {
      await removeFromWatchlist(listingId, locale);
      setWatchlist((prev) => prev.filter((item) => item.id !== listingId));
      setStats((prev) => ({
        ...prev,
        watchlist: Math.max(0, prev.watchlist - 1),
      }));
      toast.success(t("marketplace.removed_from_watchlist") || "Removed.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove from watchlist.",
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: DASH_BG }}>
      <section
        className="border-b bg-white"
        style={{ borderColor: DASH_BORDER }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-6 pb-10 pt-10">
          <h1 className="font-serif text-[36px] font-normal leading-10 tracking-[-0.02em] text-[#081123]">
            {t("common.dashboard") || "Dashboard"}
          </h1>
          <p className="max-w-xl text-base leading-6" style={{ color: DASH_MUTED }}>
            {t("dashboard.page_subtitle")}
          </p>
          <form
            className="mt-4 flex h-[62px] items-center gap-3 rounded-2xl border bg-[#fbfaf7] px-3"
            style={{ borderColor: DASH_BORDER }}
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
          >
            <Search className="h-4 w-4 shrink-0 text-[#545e6f]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("dashboard.search_placeholder")}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#081123] outline-none placeholder:text-[#545e6f]"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Search className="h-4 w-4" />}
              className="h-9 rounded-full px-5 text-sm font-medium"
              style={{ background: DASH_BTN }}
            >
              {t("dashboard.search")}
            </Button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] space-y-12 px-6 pb-16 pt-10">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon;
            const active = view === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => selectView(card.key)}
                className="flex min-h-[144px] flex-col rounded-2xl border bg-white p-5 text-start transition-shadow hover:shadow-sm"
                style={{
                  borderColor: active ? DASH_GREEN : DASH_BORDER,
                  backgroundColor: DASH_SURFACE,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] border"
                    style={{ borderColor: DASH_ICON_BORDER }}
                  >
                    <Icon className="h-6 w-6 text-black" strokeWidth={1.6} />
                  </div>
                  <p
                    className="text-[30px] font-semibold leading-[38px] tabular-nums"
                    style={{ color: DASH_GREEN_DARK }}
                  >
                    {card.value}
                  </p>
                </div>
                <p
                  className="mt-auto pt-7 font-serif text-[17px] font-semibold leading-8"
                  style={{ color: DASH_TEXT }}
                >
                  {card.label}
                </p>
              </button>
            );
          })}
        </div>

        {view === "listings" && (
          <DashboardListingsPanel
            tab={listingTab}
            onTabChange={setListingTab}
            marketplaceRows={filteredListings}
            privateRows={FALLBACK_PRIVATE}
            onRateSeller={() => setRateOpen(true)}
            onBoost={(row) => setBoostListing(row)}
          />
        )}
        {view === "certificates" && (
          <DashboardCertificatesPanel
            rows={filteredCertificates}
            filter={certFilter}
            onFilterChange={setCertFilter}
          />
        )}
        {view === "watchlist" && (
          <DashboardWatchlistPanel
            items={filteredWatchlist}
            onRemove={handleRemoveWatch}
          />
        )}
        {view === "collection" && (
          <DashboardCollectionPanel
            mode={collectionMode}
            onModeChange={setCollectionMode}
            rows={filteredCollection}
          />
        )}
        {view === "wallet" && <DashboardWalletPanel />}
      </div>

      <RateSellerModal open={rateOpen} onClose={() => setRateOpen(false)} />
      <DashboardBoostOverlay
        listing={boostListing}
        onClose={() => setBoostListing(null)}
      />
    </div>
  );
}
