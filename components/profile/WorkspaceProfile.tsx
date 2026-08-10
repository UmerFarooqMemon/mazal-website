"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  LayoutList,
  Eye,
  Grid2x2,
  Wallet,
  Plus,
  Star,
  ChevronRight,
  Play,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import {
  getMyListings,
  getWatchlist,
  type MarketplaceListingCard,
} from "@/services/marketplace";
import { getWallet } from "@/services/wallet";

type DealTab = "marketplace" | "private_deal";

type MarketplaceStatus =
  | "awaiting_offer"
  | "awaiting_payment"
  | "in_transit"
  | "completed";

type PrivateDealStatus =
  | "pending_transfer"
  | "pending_purchase"
  | "awaiting_payment"
  | "completed";

type DashboardListingRow = {
  id: string | number;
  plate_code?: string;
  plate_digits: string;
  emirate?: string;
  plateType?: string;
  plateDesign?: string;
  plateVariant?: string;
  preview?: MarketplaceListingCard["preview"];
  askingPrice: number;
  offerLabel: string;
  offerAmount: number;
  status: MarketplaceStatus;
  href: string;
};

type PrivateDealRow = {
  id: string | number;
  plate_code?: string;
  plate_digits: string;
  emirate?: string;
  plateType?: string;
  plateDesign?: string;
  plateVariant?: string;
  preview?: MarketplaceListingCard["preview"];
  askingPrice: number;
  status: PrivateDealStatus;
  showTransferCta?: boolean;
  href: string;
};

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

function formatAmount(value: number) {
  return value.toLocaleString("en-AE");
}

export default function WorkspaceProfile() {
  const { t, locale } = useLocale();
  const { getColor, getGradient } = useTheme();
  const { user } = useAuth();
  const isRTL = locale === "ar";
  const [tab, setTab] = useState<DealTab>("marketplace");
  const [marketplaceRows, setMarketplaceRows] =
    useState<DashboardListingRow[]>(FALLBACK_MARKETPLACE);
  const [stats, setStats] = useState({
    listings: 15,
    certificates: 5,
    watchlist: 10,
    collection: 15,
    wallet: 1,
  });

  const displayName =
    user?.name?.split(" ")[0] ||
    t("dashboard.workspace_user_fallback") ||
    "Abdullah";

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getMyListings(locale),
      getWatchlist(locale),
      getWallet(locale),
      fetch("/api/number-plates", {
        headers: {
          Accept: "application/json",
          "Accept-Language": locale === "ar" ? "ar" : "en",
          ...(typeof window !== "undefined" &&
          localStorage.getItem("access_token")
            ? {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              }
            : {}),
        },
      }).then((r) => r.json()),
    ]).then(([listingsRes, watchRes, walletRes, platesRes]) => {
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
              offerLabel:
                listing.offer_count > 0
                  ? t("dashboard.highest_offer")
                  : t("dashboard.highest_offer"),
              offerAmount: Number(listing.asking_price) || 0,
              status: mapListingStatus(listing.status),
              href: `/${locale}/listings/${listing.id}`,
            })),
          );
        }
      }

      if (watchRes.status === "fulfilled") {
        const data = watchRes.value.data;
        const categorized = (data?.categories || []).reduce(
          (sum, cat) => sum + (cat.items?.length || 0),
          0,
        );
        const uncategorized = data?.uncategorized?.length || 0;
        const total = categorized + uncategorized;
        if (total > 0) nextStats.watchlist = total;
      }

      if (walletRes.status === "fulfilled") {
        nextStats.wallet = 1;
      }

      if (platesRes.status === "fulfilled") {
        const result = platesRes.value;
        const list =
          result?.data?.number_plates ||
          (Array.isArray(result?.data) ? result.data : []) ||
          [];
        if (Array.isArray(list) && list.length) {
          nextStats.certificates = list.length;
          nextStats.collection = list.length;
        }
      }

      setStats(nextStats);
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, t]);

  const marketplaceStatusLabel = (status: MarketplaceStatus) => {
    switch (status) {
      case "awaiting_payment":
        return t("dashboard.status_awaiting_payment");
      case "in_transit":
        return t("dashboard.status_in_transit");
      case "completed":
        return t("dashboard.status_completed");
      default:
        return t("dashboard.status_awaiting_offer");
    }
  };

  const privateStatusLabel = (status: PrivateDealStatus) => {
    switch (status) {
      case "pending_transfer":
        return t("dashboard.status_pending_transfer");
      case "pending_purchase":
        return t("dashboard.status_pending_purchase");
      case "awaiting_payment":
        return t("dashboard.status_awaiting_payment");
      default:
        return t("dashboard.status_completed");
    }
  };

  const quickStats = useMemo(
    () => [
      {
        key: "listings",
        label: t("dashboard.stat_listing"),
        value: stats.listings,
        href: `/${locale}/marketplace`,
        icon: LayoutList,
      },
      {
        key: "certificates",
        label: t("dashboard.stat_valuation_certificate"),
        value: stats.certificates,
        href: `/${locale}/dashboard-certificates`,
        icon: FileText,
      },
      {
        key: "watchlist",
        label: t("dashboard.stat_watchlist"),
        value: stats.watchlist,
        href: `/${locale}/buyer/watchlist`,
        icon: Eye,
      },
      {
        key: "collection",
        label: t("dashboard.stat_collection"),
        value: stats.collection,
        href: `/${locale}/portfolio`,
        icon: Grid2x2,
      },
      {
        key: "wallet",
        label: t("dashboard.stat_wallet"),
        value: stats.wallet,
        href: `/${locale}/wallet`,
        icon: Wallet,
      },
    ],
    [stats, locale, t],
  );

  const bg = getColor("background") || "#FBFAF7";
  const surface = getColor("surface") || "#FFFFFF";
  const primaryText = getColor("primaryText") || "#121212";
  const muted = getColor("mutedText") || "#8A8F98";
  const border = getColor("border") || "#E6E8EE";
  const primary = getColor("primary") || "#0E382C";
  const primaryBtn =
    getGradient("primaryButton") || getColor("primaryButton") || primary;

  const offerLabelFor = (row: DashboardListingRow) => {
    if (row.status === "awaiting_payment") {
      return t("dashboard.accepted_offer");
    }
    return row.offerLabel === "Accepted Offer"
      ? t("dashboard.accepted_offer")
      : t("dashboard.highest_offer");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      {/* Hero — Figma: 1440×181, content 1268×180, pt 40 */}
      <section
        className="border-b"
        style={{ borderColor: border, backgroundColor: bg }}
      >
        <div className="mx-auto flex min-h-[181px] max-w-[1280px] flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[294px] text-start">
            <p
              className="text-[11px] font-bold uppercase leading-4 tracking-[0.12em]"
              style={{ color: muted }}
            >
              {t("dashboard.workspace") || "USER DASHBOARD"}
            </p>
            <h1
              className="mt-2 font-serif text-[40px] font-bold leading-10 tracking-tight"
              style={{ color: primaryText }}
            >
              {displayName}
            </h1>
            <p
              className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5"
              style={{ color: muted }}
            >
              <span>
                32 {t("dashboard.deals_closed") || "deals closed"}
              </span>
              <span aria-hidden>•</span>
              <span className="inline-flex items-center gap-1">
                4.0
                <Star className="h-3.5 w-3.5 fill-current" />
              </span>
              <span aria-hidden>•</span>
              <span>{t("dashboard.verified_id") || "Verified Emirates ID"}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={<FileText className="h-4 w-4" />}
              className="h-[38px] rounded-full border px-[17px] py-0 text-sm font-medium"
            >
              {t("dashboard.export_pl") || "Export P&L"}
            </Button>
            <Link href={`/${locale}/listings/create`}>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="h-4 w-4" />}
                className="h-[38px] rounded-full px-5 py-0 text-sm font-medium"
              >
                {t("dashboard.new_listing") || "New listing"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content — Figma: 1280 container, px 24, pt 40, gap 48 to listings */}
      <div className="mx-auto max-w-[1280px] space-y-12 px-6 pb-16 pt-10">
        {/* Stats — Figma: 1232×146, cards 238.4×144, gap 10, pad 21 */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.key}
                href={stat.href}
                className="flex min-h-[144px] flex-col rounded-xl border p-[21px] transition-shadow hover:shadow-sm"
                style={{ backgroundColor: surface, borderColor: border }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${primary}12` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: primary }} />
                  </div>
                  <p
                    className="text-[32px] font-bold leading-[38px] tabular-nums"
                    style={{ color: primaryText }}
                  >
                    {stat.value}
                  </p>
                </div>
                <p
                  className="mt-auto pt-4 text-base font-medium leading-8 text-start"
                  style={{ color: primaryText }}
                >
                  {stat.label}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Marketplace / Private Deal — Figma: 1232×915 panel */}
        <section
          className="overflow-hidden rounded-xl border"
          style={{ backgroundColor: surface, borderColor: border }}
        >
          {/* Tab bar — Figma: h 105, pad 24/22, tabs h 56 */}
          <div
            className="flex flex-wrap gap-2.5 border-b px-[22px] py-6"
            style={{ borderColor: border }}
          >
            {(
              [
                {
                  key: "marketplace" as const,
                  label: t("dashboard.tab_marketplace"),
                },
                {
                  key: "private_deal" as const,
                  label: t("dashboard.tab_private_deal"),
                },
              ] as const
            ).map((item) => {
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className="inline-flex h-14 min-w-[133px] items-center justify-center rounded-full px-[23px] text-base font-semibold transition-colors"
                  style={
                    active
                      ? {
                          background: primaryBtn,
                          color: "#FFFFFF",
                        }
                      : {
                          backgroundColor: surface,
                          color: primaryText,
                          border: `1px solid ${border}`,
                        }
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {tab === "marketplace" ? (
            <div className="divide-y" style={{ borderColor: border }}>
              {marketplaceRows.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-6 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-[74px] lg:py-6"
                >
                  {/* Plate + price — Figma: 345×142 */}
                  <div className="w-full max-w-[345px] shrink-0 text-start">
                    <NumberPlateDisplay
                      plate_code={row.plate_code}
                      plate_digits={row.plate_digits}
                      emirate={row.emirate}
                      preview={row.preview}
                      plateType={row.plateType}
                      plateDesign={row.plateDesign}
                      plateVariant={row.plateVariant}
                      crop="card"
                      wrapperClassName="w-full overflow-hidden"
                    />
                    <p
                      className="mt-4 text-2xl font-semibold leading-8"
                      style={{ color: primaryText }}
                    >
                      AED {formatAmount(row.askingPrice)}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
                    {/* Offer block — Figma: 213×52 */}
                    <div className="inline-flex items-center gap-3 rounded-full border px-[18px] py-2.5"
                      style={{ borderColor: border }}
                    >
                      <div className="text-start">
                        <p
                          className="text-[10px] font-semibold uppercase leading-[10px] tracking-wide"
                          style={{ color: muted }}
                        >
                          {offerLabelFor(row)}
                        </p>
                        <p
                          className="mt-1.5 text-base font-semibold leading-4"
                          style={{ color: primaryText }}
                        >
                          {formatAmount(row.offerAmount)}
                        </p>
                      </div>
                      <Link
                        href={
                          row.href === "#"
                            ? `/${locale}/buyer/offers`
                            : row.href
                        }
                        className="inline-flex items-center gap-1 rounded-full border px-1.5 py-1 text-[10px] font-medium leading-[14px] whitespace-nowrap"
                        style={{ borderColor: border, color: primary }}
                      >
                        {t("dashboard.see_all_offers")}
                        <ChevronRight
                          className={`h-2.5 w-2.5 ${isRTL ? "rotate-180" : ""}`}
                        />
                      </Link>
                    </div>

                    {/* Status — Figma: 147×36 */}
                    <div
                      className="inline-flex h-9 min-w-[147px] items-center justify-center rounded-full px-4 text-sm font-medium"
                      style={{
                        backgroundColor: "#F0F1F4",
                        color: primaryText,
                      }}
                    >
                      {marketplaceStatusLabel(row.status)}
                    </div>
                  </div>
                </div>
              ))}

              {marketplaceRows.length === 0 && (
                <div
                  className="px-6 py-16 text-center text-sm"
                  style={{ color: muted }}
                >
                  {t("dashboard.no_listings")}
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: border }}>
              {FALLBACK_PRIVATE.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-6 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-16 lg:py-6"
                >
                  <div className="w-full max-w-[345px] shrink-0 text-start">
                    <NumberPlateDisplay
                      plate_code={row.plate_code}
                      plate_digits={row.plate_digits}
                      emirate={row.emirate}
                      preview={row.preview}
                      plateType={row.plateType}
                      plateDesign={row.plateDesign}
                      plateVariant={row.plateVariant}
                      crop="card"
                      wrapperClassName="w-full overflow-hidden"
                    />
                    <p
                      className="mt-4 text-2xl font-semibold leading-8"
                      style={{ color: primaryText }}
                    >
                      AED {formatAmount(row.askingPrice)}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
                    <div
                      className="inline-flex h-9 min-w-[147px] items-center justify-center rounded-full px-4 text-sm font-medium"
                      style={{
                        backgroundColor: "#F0F1F4",
                        color: primaryText,
                      }}
                    >
                      {privateStatusLabel(row.status)}
                    </div>

                    {row.showTransferCta && (
                      <Link
                        href={
                          row.href === "#"
                            ? `/${locale}/private-deal`
                            : row.href
                        }
                        className="inline-flex h-9 min-w-[172px] items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-white"
                        style={{ background: primaryBtn }}
                      >
                        <Play className="h-[15px] w-[15px]" />
                        {t("dashboard.plate_transfer")}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
