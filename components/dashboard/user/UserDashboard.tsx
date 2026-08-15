"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Eye,
  EyeOff,
  FileBadge,
  LayoutList,
  Search,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/hooks/useAuth";
import { Button, DirhamAmount } from "@/components/ui";
import {
  getMyListings,
  getMyPurchases,
  getWatchlist,
  removeFromWatchlist,
  resolveListingRating,
  toMarketplaceNumber,
  type MarketplaceListingCard,
  type MarketplaceListingDetail,
  type MarketplacePurchase,
} from "@/services/marketplace";
import { normalizeAcceptLanguage } from "@/lib/api-config";
import {
  auctionCheckoutPath,
  listingCheckoutPath,
} from "@/lib/checkout-intent";
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
import DashboardOffersPanel from "./DashboardOffersPanel";
import DashboardBidsPanel from "./DashboardBidsPanel";
import RateSellerModal from "./RateSellerModal";
import type { CollectionMode, DashboardView, ListingDealTab } from "./types";
import { useDashTheme } from "./theme";
import { useWallet } from "@/hooks/useWallet";

function isAuctionListing(listing: { listing_type?: string | null }) {
  return String(listing.listing_type || "").toLowerCase() === "auction";
}

function mapListingStatus(status: string): MarketplaceStatus {
  const s = status.toLowerCase();
  if (/(complete|sold|closed|done)/.test(s)) return "completed";
  if (/(transit|delivery|ship)/.test(s)) return "in_transit";
  if (/(payment|escrow|paid)/.test(s)) return "awaiting_payment";
  return "awaiting_offer";
}

function mapListingToDashboardRow(
  listing: MarketplaceListingDetail,
  locale: string,
  highestOfferLabel: string,
  asAuction: boolean,
): DashboardListingRow {
  const highBid =
    listing.auction?.current_high_bid ?? listing.auction?.winning_bid?.amount;
  const offerAmount = asAuction
    ? toMarketplaceNumber(highBid) ||
      toMarketplaceNumber(listing.asking_price) ||
      0
    : toMarketplaceNumber(listing.highest_offer?.amount);

  return {
    id: listing.id,
    listingId: listing.id,
    plate_code: listing.plate_code || undefined,
    plate_digits: String(listing.plate_digits || ""),
    emirate: listing.emirate,
    plateType: listing.plate_type || undefined,
    plateDesign: listing.plate_design || undefined,
    preview: listing.preview,
    askingPrice: toMarketplaceNumber(listing.asking_price) || 0,
    offerLabel: highestOfferLabel,
    offerAmount,
    status: mapListingStatus(listing.status),
    href: asAuction
      ? `/${locale}/auctions/${listing.id}`
      : `/${locale}/listings/${listing.id}`,
    listingPlan: listing.listing_plan ?? null,
    boostTier:
      listing.boost_tier ||
      listing.featured_tier ||
      listing.tier ||
      listing.listing_plan?.name ||
      null,
    isOwner: listing.is_owner !== false,
    averageRating: resolveListingRating(listing),
  };
}

function mapPurchaseStatus(status: string): MarketplaceStatus {
  const s = status.toLowerCase();
  if (s === "completed") return "completed";
  if (s === "custody_funded" || s === "transfer_in_progress") {
    return "in_transit";
  }
  if (s === "payment_pending" || s === "payment_verification") {
    return "awaiting_payment";
  }
  if (/(complete|sold|closed|done)/.test(s)) return "completed";
  if (/(transit|transfer|delivery)/.test(s) || s.includes("custody_funded")) {
    return "in_transit";
  }
  if (s.includes("funded") && !s.includes("pending")) return "in_transit";
  if (
    s === "payment_pending" ||
    s.includes("payment_verification") ||
    s.includes("awaiting")
  ) {
    return "awaiting_payment";
  }
  return "awaiting_offer";
}

function isCancelledPurchase(purchase: MarketplacePurchase) {
  const s = String(purchase.status || "").toLowerCase();
  return s === "cancelled" || s === "canceled";
}

function isAuctionPurchase(purchase: MarketplacePurchase) {
  const type = String(
    purchase.listing?.listing_type || "",
  ).toLowerCase();
  return type === "auction";
}

function extractPurchases(payload: unknown): MarketplacePurchase[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  if (Array.isArray(data.purchases)) {
    return data.purchases as MarketplacePurchase[];
  }
  if (Array.isArray(data.data)) {
    return data.data as MarketplacePurchase[];
  }
  return [];
}

/** Purchase nested listing: prefer plate_code / plate_digits; never title-digit fallback. */
function purchasePlateOverlays(listing?: MarketplacePurchase["listing"]) {
  const display = String(listing?.display_plate || "").trim();
  const displayMatch = display.match(/^([A-Za-z?]{1,3})\s+(.+)$/);
  const fromDisplayCode = displayMatch?.[1]?.toUpperCase() || "";
  const fromDisplayDigits = (displayMatch?.[2] || "").replace(/\s+/g, "");

  const code = String(listing?.plate_code || fromDisplayCode || "").trim();
  const digits = String(
    listing?.plate_digits || fromDisplayDigits || "",
  ).trim();

  return {
    plate_code: code || undefined,
    plate_digits: digits,
  };
}

function mapPurchaseToDashboardRow(
  purchase: MarketplacePurchase,
  locale: string,
  offerLabel: string,
): DashboardListingRow {
  const listing = purchase.listing;
  const { plate_code, plate_digits } = purchasePlateOverlays(listing);
  const asAuction = isAuctionPurchase(purchase);
  const listingId = listing?.id ?? purchase.listing_id;

  return {
    id: `purchase-${purchase.id}`,
    listingId,
    plate_code,
    plate_digits,
    emirate: listing?.emirate,
    plateType: listing?.plate_type || undefined,
    plateDesign: listing?.plate_design || undefined,
    preview: listing?.preview,
    askingPrice: toMarketplaceNumber(
      listing?.asking_price ?? purchase.agreed_price,
    ),
    offerLabel,
    offerAmount: toMarketplaceNumber(purchase.agreed_price),
    status: mapPurchaseStatus(purchase.status),
    href: (() => {
      const pending = mapPurchaseStatus(purchase.status) === "awaiting_payment";
      if (asAuction) {
        if (pending) return auctionCheckoutPath(locale, listingId);
        return `/${locale}/auctions/${listingId}`;
      }
      return listingCheckoutPath(locale, listingId);
    })(),
    purchaseId: purchase.id,
    checkoutFlow: asAuction ? "auction" : "marketplace",
    canRateSeller: Boolean(purchase.can_rate_seller),
    isOwner: false,
    averageRating:
      listing?.average_rating ??
      purchase.seller?.average_rating ??
      purchase.seller?.rating ??
      undefined,
  };
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
  const {
    DASH_BG,
    DASH_BORDER,
    DASH_BTN,
    DASH_GREEN,
    DASH_GREEN_DARK,
    DASH_ICON_BORDER,
    DASH_MUTED,
    DASH_SURFACE,
    DASH_TEXT,
  } = useDashTheme();
  const [view, setView] = useState<DashboardView>("listings");
  const [listingTab, setListingTab] = useState<ListingDealTab>("marketplace");
  const [collectionMode, setCollectionMode] = useState<CollectionMode>("list");
  const [search, setSearch] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [marketplaceRows, setMarketplaceRows] = useState<
    DashboardListingRow[]
  >([]);
  const [auctionRows, setAuctionRows] = useState<DashboardListingRow[]>([]);
  const [privateRows] = useState<PrivateDealRow[]>([]);
  const [watchlist, setWatchlist] = useState<MarketplaceListingCard[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [collection, setCollection] = useState<CollectionRow[]>([]);
  const [certFilter, setCertFilter] = useState<"All" | "Pending" | "Issued">(
    "All",
  );
  const [ratePurchaseId, setRatePurchaseId] = useState<number | null>(null);
  const [offersListing, setOffersListing] =
    useState<DashboardListingRow | null>(null);
  const [bidsListing, setBidsListing] = useState<DashboardListingRow | null>(
    null,
  );
  const [stats, setStats] = useState({
    listings: 0,
    certificates: 0,
    watchlist: 0,
    collection: 0,
  });
  const wallet = useWallet();
  const [walletHidden, setWalletHidden] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getMyListings(locale),
      getMyListings(locale, { listing_type: "auction" }),
      getMyPurchases(locale, "buyer"),
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
    ]).then(([listingsRes, auctionRes, purchasesRes, watchRes, platesRes]) => {
      if (!active) return;
      const nextStats = { ...stats };
      const offerLabel = t("dashboard.highest_offer");
      let marketplaceRows: DashboardListingRow[] = [];
      let auctionRows: DashboardListingRow[] = [];

      if (listingsRes.status === "fulfilled") {
        const listings = listingsRes.value.data?.listings || [];
        const marketplace = listings.filter(
          (listing) => !isAuctionListing(listing),
        );
        const auctionsFromAll = listings.filter(isAuctionListing);
        marketplaceRows = marketplace.map((listing) =>
          mapListingToDashboardRow(listing, locale, offerLabel, false),
        );
        auctionRows = auctionsFromAll.map((listing) =>
          mapListingToDashboardRow(listing, locale, offerLabel, true),
        );
      }

      if (auctionRes.status === "fulfilled") {
        const auctions = (auctionRes.value.data?.listings || []).filter(
          isAuctionListing,
        );
        if (auctions.length || listingsRes.status !== "fulfilled") {
          auctionRows = auctions.map((listing) =>
            mapListingToDashboardRow(listing, locale, offerLabel, true),
          );
        }
      }

      if (purchasesRes.status === "fulfilled") {
        const purchases = extractPurchases(purchasesRes.value.data).filter(
          (purchase) => purchase?.id && !isCancelledPurchase(purchase),
        );
        for (const purchase of purchases) {
          const row = mapPurchaseToDashboardRow(purchase, locale, offerLabel);
          if (isAuctionPurchase(purchase)) auctionRows.push(row);
          else marketplaceRows.push(row);
        }
      }

      setMarketplaceRows(marketplaceRows);
      setAuctionRows(auctionRows);
      nextStats.listings = marketplaceRows.length + auctionRows.length;

      if (watchRes.status === "fulfilled") {
        const data = watchRes.value.data;
        const categorized = (data?.categories || []).flatMap(
          (cat) => cat.items || [],
        );
        const uncategorized = data?.uncategorized || [];
        const items = [...categorized, ...uncategorized]
          .map((item) => item.listing)
          .filter(Boolean);
        nextStats.watchlist = items.length;
        setWatchlist(items);
      }

      if (platesRes.status === "fulfilled") {
        const result = platesRes.value;
        const list: Array<Record<string, unknown>> = Array.isArray(
          result?.data?.number_plates,
        )
          ? result.data.number_plates
          : Array.isArray(result?.data)
            ? result.data
            : [];
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
  const filteredAuctions = useMemo(
    () =>
      auctionRows.filter((row) =>
        matchesQuery(query, row.plate_code, row.plate_digits),
      ),
    [auctionRows, query],
  );
  const filteredPrivateRows = useMemo(
    () =>
      privateRows.filter((row) =>
        matchesQuery(query, row.plate_code, row.plate_digits),
      ),
    [privateRows, query],
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

  const listingCount =
    listingTab === "auction"
      ? filteredAuctions.length
      : listingTab === "private_deal"
        ? filteredPrivateRows.length
        : filteredListings.length;

  const cards = [
    {
      key: "listings" as const,
      label: t("dashboard.stat_listing"),
      value: listingCount,
      icon: LayoutList,
    },
    {
      key: "certificates" as const,
      label: t("dashboard.stat_valuation_certificate"),
      value: certificates.length,
      icon: FileBadge,
    },
    {
      key: "watchlist" as const,
      label: t("dashboard.stat_watchlist"),
      value: watchlist.length,
      icon: Eye,
    },
    {
      key: "collection" as const,
      label: t("dashboard.stat_collection"),
      value: collection.length,
      icon: Bookmark,
    },
    {
      key: "wallet" as const,
      label: t("dashboard.stat_wallet"),
      value: wallet.availableBalance,
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
        className="border-b"
        style={{ borderColor: DASH_BORDER, backgroundColor: DASH_BG }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-6 pb-10 pt-10">
          <h1
            className="font-serif text-[36px] font-normal leading-10 tracking-[-0.02em]"
            style={{ color: DASH_TEXT }}
          >
            {t("common.dashboard") || "Dashboard"}
          </h1>
          <p className="max-w-xl text-base leading-6" style={{ color: DASH_MUTED }}>
            {t("dashboard.page_subtitle")}
          </p>
          <form
            className="mt-4 flex h-[62px] items-center gap-3 rounded-full border px-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            style={{ borderColor: DASH_BORDER, backgroundColor: DASH_SURFACE }}
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
          >
            <Search className="h-4 w-4 shrink-0" style={{ color: DASH_MUTED }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("dashboard.search_placeholder")}
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{ color: DASH_TEXT }}
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
                className="flex min-h-[144px] min-w-0 flex-col overflow-hidden rounded-2xl border p-5 text-start transition-shadow hover:shadow-sm"
                style={{
                  borderColor: active ? DASH_GREEN : DASH_BORDER,
                  backgroundColor: DASH_SURFACE,
                }}
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] border"
                    style={{ borderColor: DASH_ICON_BORDER }}
                  >
                    <Icon className="h-6 w-6 text-black" strokeWidth={1.6} />
                  </div>
                  {card.key === "wallet" ? (
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                      {walletHidden ? (
                        <span
                          className="text-[22px] font-semibold tracking-widest"
                          style={{ color: DASH_GREEN_DARK }}
                        >
                          ••••
                        </span>
                      ) : (
                        <span
                          className="min-w-0 overflow-hidden text-end text-[length:clamp(0.7rem,1.05vw,1.125rem)] font-semibold leading-tight tabular-nums"
                          style={{ color: DASH_GREEN_DARK }}
                        >
                          <span className="block truncate">
                            <DirhamAmount
                              amount={Number(card.value)}
                              decimals={2}
                              weight="semibold"
                            />
                          </span>
                        </span>
                      )}
                      <span
                        role="button"
                        tabIndex={0}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: DASH_GREEN, color: "#ffffff" }}
                        aria-label={
                          walletHidden
                            ? t("wallet.show_balance")
                            : t("wallet.hide_balance")
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setWalletHidden((v) => !v);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            setWalletHidden((v) => !v);
                          }
                        }}
                      >
                        {walletHidden ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </div>
                  ) : (
                    <p
                      className="text-[30px] font-semibold leading-[38px] tabular-nums"
                      style={{ color: DASH_GREEN_DARK }}
                    >
                      {card.value}
                    </p>
                  )}
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
            auctionRows={filteredAuctions}
            privateRows={filteredPrivateRows}
            onRateSeller={(row) => {
              if (row.purchaseId) setRatePurchaseId(row.purchaseId);
            }}
            onSeeOffers={(row) => setOffersListing(row)}
            onSeeBids={(row) => setBidsListing(row)}
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
        {view === "wallet" && (
          <DashboardWalletPanel
            balanceHidden={walletHidden}
            onBalanceHiddenChange={setWalletHidden}
          />
        )}
      </div>

      <RateSellerModal
        open={ratePurchaseId != null}
        purchaseId={ratePurchaseId}
        onClose={() => setRatePurchaseId(null)}
        onRated={() => {
          setMarketplaceRows((prev) =>
            prev.map((row) =>
              row.purchaseId === ratePurchaseId
                ? { ...row, canRateSeller: false }
                : row,
            ),
          );
          setAuctionRows((prev) =>
            prev.map((row) =>
              row.purchaseId === ratePurchaseId
                ? { ...row, canRateSeller: false }
                : row,
            ),
          );
        }}
      />
      <DashboardOffersPanel
        listing={offersListing}
        onClose={() => setOffersListing(null)}
      />
      <DashboardBidsPanel
        listing={bidsListing}
        onClose={() => setBidsListing(null)}
        onAwarded={() => {
          setAuctionRows((prev) =>
            prev.map((row) =>
              row.listingId === bidsListing?.listingId
                ? { ...row, status: "awaiting_payment" }
                : row,
            ),
          );
        }}
      />
    </div>
  );
}
