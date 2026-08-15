"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Play, Plus, Star, Zap } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button, DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import ListingPlanBadge from "@/components/marketplace/ListingPlanBadge";
import type {
  MarketplaceListingPlanSummary,
  MarketplaceListingPreview,
} from "@/services/marketplace";
import type { ListingDealTab } from "./types";
import DashboardBoostOverlay from "./DashboardBoostOverlay";
import {
  dashPanel,
  useDashTheme,
} from "./theme";
import { rememberCheckoutIntent } from "@/lib/checkout-intent";

export type MarketplaceStatus =
  | "awaiting_offer"
  | "awaiting_payment"
  | "in_transit"
  | "completed";

export type PrivateDealStatus =
  | "pending_transfer"
  | "pending_purchase"
  | "awaiting_payment"
  | "completed";

export type DashboardListingRow = {
  id: string | number;
  listingId: number;
  plate_code?: string;
  plate_digits: string;
  emirate?: string;
  plateType?: string;
  plateDesign?: string;
  preview?: MarketplaceListingPreview | null;
  askingPrice: number;
  offerLabel: string;
  offerAmount: number;
  status: MarketplaceStatus;
  href: string;
  listingPlan?: MarketplaceListingPlanSummary | null;
  boostTier?: string | null;
  purchaseId?: number;
  checkoutFlow?: "marketplace" | "auction";
  canRateSeller?: boolean;
  isOwner?: boolean;
  averageRating?: number;
};

export type PrivateDealRow = {
  id: string | number;
  plate_code?: string;
  plate_digits: string;
  emirate?: string;
  plateType?: string;
  plateDesign?: string;
  preview?: MarketplaceListingPreview | null;
  askingPrice: number;
  status: PrivateDealStatus;
  showTransferCta?: boolean;
  href: string;
};

function tierPlan(
  plan?: MarketplaceListingPlanSummary | null,
  tier?: string | null,
): MarketplaceListingPlanSummary | null {
  if (plan?.name) return plan;
  if (!tier) return null;
  const name = tier.trim();
  if (!name || name.toLowerCase() === "free") return null;
  return {
    id: null,
    name,
    slug: name.toLowerCase(),
    price: null,
    is_free: false,
  };
}

function isDiamondPlan(
  plan?: MarketplaceListingPlanSummary | null,
  tier?: string | null,
): boolean {
  const haystack = [plan?.slug, plan?.name, tier]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes("diamond");
}

export default function DashboardListingsPanel({
  tab,
  onTabChange,
  marketplaceRows,
  auctionRows,
  privateRows,
  onRateSeller,
  onSeeOffers,
  onSeeBids,
}: {
  tab: ListingDealTab;
  onTabChange: (tab: ListingDealTab) => void;
  marketplaceRows: DashboardListingRow[];
  auctionRows: DashboardListingRow[];
  privateRows: PrivateDealRow[];
  onRateSeller: (row: DashboardListingRow) => void;
  onSeeOffers: (row: DashboardListingRow) => void;
  onSeeBids: (row: DashboardListingRow) => void;
}) {
  const { t, locale } = useLocale();
  const {
    DASH_BORDER,
    DASH_BTN,
    DASH_GREEN,
    DASH_MUTED,
    DASH_PILL,
    DASH_TAB,
    DASH_TEXT,
    DASH_SURFACE,
    DASH_ACCENT,
  } = useDashTheme();
  const isRTL = locale === "ar";
  const isAuctionTab = tab === "auction";
  const listingRows = isAuctionTab ? auctionRows : marketplaceRows;
  const [boostListingId, setBoostListingId] = useState<string | number | null>(
    null,
  );

  useEffect(() => {
    setBoostListingId(null);
  }, [tab]);

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

  return (
    <section
      className={dashPanel}
      style={{ borderColor: DASH_BORDER, backgroundColor: DASH_SURFACE }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-b px-[22px] py-6"
        style={{ borderColor: DASH_BORDER }}
      >
        <div className="flex flex-wrap gap-2.5">
          {(
            [
              { key: "marketplace" as const, label: t("dashboard.tab_marketplace") },
              { key: "auction" as const, label: t("dashboard.tab_auction") },
              { key: "private_deal" as const, label: t("dashboard.tab_private_deal") },
            ] as const
          ).map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onTabChange(item.key)}
                className="inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium"
                style={{
                  background: active ? DASH_TAB : DASH_SURFACE,
                  color: active ? "#ffffff" : DASH_TEXT,
                  borderColor: active ? "transparent" : DASH_BORDER,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <Link
          href={
            tab === "auction"
              ? `/${locale}/auctions/add`
              : tab === "private_deal"
                ? `/${locale}/private-deal`
                : `/${locale}/listings/create`
          }
        >
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            className="h-[38px] rounded-full px-5 py-0 text-sm font-medium"
            style={{ background: DASH_BTN }}
          >
            {t("dashboard.new_listing")}
          </Button>
        </Link>
      </div>

      {tab !== "private_deal" ? (
        <div className="divide-y" style={{ borderColor: DASH_BORDER }}>
          {listingRows.map((row) => {
            const plan = tierPlan(row.listingPlan, row.boostTier);
            const showBoost =
              !isAuctionTab &&
              row.isOwner !== false &&
              !isDiamondPlan(row.listingPlan, row.boostTier);
            const boostOpen = boostListingId === row.id;
            return (
              <div key={row.id}>
              <div
                className="flex flex-col gap-6 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-6 lg:py-6"
              >
                <div className="w-full max-w-[345px] shrink-0 text-start">
                  <NumberPlateDisplay
                    plate_code={row.plate_code}
                    plate_digits={row.plate_digits}
                    emirate={row.emirate}
                    preview={row.preview}
                    plateType={row.plateType}
                    plateDesign={row.plateDesign}
                    crop="card"
                    wrapperClassName="w-full overflow-hidden"
                  />
                  <p
                    className="mt-4 text-[26px] font-bold leading-8"
                    style={{ color: "#000000" }}
                  >
                    <DirhamAmount amount={row.askingPrice} weight="bold" />
                  </p>
                  {row.averageRating != null && row.averageRating > 0 && (
                    <p
                      className="mt-1.5 flex items-center gap-1 text-xs"
                      style={{ color: DASH_MUTED }}
                    >
                      <Star className="h-3 w-3" fill={DASH_ACCENT} color={DASH_ACCENT} />
                      {row.averageRating.toFixed(1)}
                    </p>
                  )}
                </div>

                <div className="flex flex-1 flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
                  {(plan || showBoost) && (
                    <div className="flex items-center gap-2.5">
                      {plan && (
                        <ListingPlanBadge
                          plan={plan}
                          className="!px-3 !py-1 !text-[16px] !leading-[26px]"
                        />
                      )}
                      {showBoost && (
                        <button
                          type="button"
                          onClick={() =>
                            setBoostListingId(boostOpen ? null : row.id)
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: DASH_GREEN }}
                          aria-label={t("dashboard.boost") || "Boost"}
                          aria-expanded={boostOpen}
                        >
                          <Zap className="h-3.5 w-3.5 text-white" fill="currentColor" />
                        </button>
                      )}
                    </div>
                  )}

                  <div
                    className="inline-flex items-center gap-7 rounded-xl border px-4 py-2.5"
                    style={{ borderColor: DASH_BORDER }}
                  >
                    <div className="text-start">
                      <p
                        className="text-[8px] font-medium uppercase leading-[10px] tracking-wide"
                        style={{ color: DASH_TEXT }}
                      >
                        {row.isOwner === false || row.status === "awaiting_payment"
                          ? t("dashboard.accepted_offer")
                          : t("dashboard.highest_offer")}
                      </p>
                      <p className="mt-1.5 text-lg font-bold leading-4 text-black">
                        {row.offerAmount.toLocaleString("en-AE")}
                      </p>
                    </div>
                    {row.isOwner !== false && (
                      <button
                        type="button"
                        onClick={() =>
                          isAuctionTab ? onSeeBids(row) : onSeeOffers(row)
                        }
                        className="inline-flex items-center gap-1 rounded-[5px] bg-[var(--color-primary-light)] px-1.5 py-1 text-[8px] font-medium whitespace-nowrap"
                        style={{ color: DASH_TEXT }}
                      >
                        {isAuctionTab
                          ? t("dashboard.see_all_bids")
                          : t("dashboard.see_all_offers")}
                        <ChevronRight
                          className={`h-2.5 w-2.5 ${isRTL ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {row.canRateSeller || row.status === "completed" ? (
                    <div className="flex flex-wrap items-center gap-2.5">
                      {row.canRateSeller && (
                        <button
                          type="button"
                          onClick={() => onRateSeller(row)}
                          className="inline-flex h-9 min-w-[120px] items-center justify-center rounded-xl px-4 text-xs font-medium"
                          style={{ backgroundColor: DASH_PILL, color: DASH_TEXT }}
                        >
                          {t("dashboard.rate_seller")}
                        </button>
                      )}
                      <div
                        className="inline-flex h-9 min-w-[147px] items-center justify-center rounded-xl px-4 text-xs font-medium"
                        style={{ backgroundColor: DASH_PILL, color: DASH_TEXT }}
                      >
                        {marketplaceStatusLabel(row.status)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2.5">
                      {row.isOwner === false &&
                        row.purchaseId &&
                        row.status === "awaiting_payment" && (
                          <Link
                            href={row.href}
                            onClick={() => {
                              if (!row.purchaseId) return;
                              rememberCheckoutIntent(
                                row.checkoutFlow || "marketplace",
                                row.listingId,
                                {
                                  role: "buyer",
                                  purchaseId: String(row.purchaseId),
                                  price: row.offerAmount,
                                },
                              );
                            }}
                            className="inline-flex h-9 min-w-[120px] items-center justify-center rounded-xl px-4 text-xs font-medium text-white"
                            style={{ background: DASH_BTN }}
                          >
                            {t("dashboard.pay_now") ||
                              t("private-deal.pay_now") ||
                              "Pay Now"}
                          </Link>
                        )}
                      <div
                        className="inline-flex h-9 min-w-[147px] items-center justify-center rounded-xl px-4 text-xs font-medium"
                        style={{ backgroundColor: DASH_PILL, color: DASH_TEXT }}
                      >
                        {marketplaceStatusLabel(row.status)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {boostOpen && (
                <DashboardBoostOverlay
                  listing={row}
                  onClose={() => setBoostListingId(null)}
                />
              )}
              </div>
            );
          })}

          {listingRows.length === 0 && (
            <div className="px-6 py-16 text-center text-sm" style={{ color: DASH_MUTED }}>
              {t("dashboard.no_listings")}
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: DASH_BORDER }}>
          {privateRows.map((row) => (
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
                  crop="card"
                  wrapperClassName="w-full overflow-hidden"
                />
                <p className="mt-4 text-[26px] font-bold leading-8 text-black">
                  <DirhamAmount amount={row.askingPrice} weight="bold" />
                </p>
              </div>

              <div className="flex flex-1 flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
                <div
                  className="inline-flex h-9 min-w-[147px] items-center justify-center rounded-xl px-4 text-xs font-medium"
                  style={{ backgroundColor: DASH_PILL, color: DASH_TEXT }}
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
                    style={{ background: DASH_BTN }}
                  >
                    <Play className="h-[15px] w-[15px]" />
                    {t("dashboard.plate_transfer")}
                  </Link>
                )}
              </div>
            </div>
          ))}

          {privateRows.length === 0 && (
            <div className="px-6 py-16 text-center text-sm" style={{ color: DASH_MUTED }}>
              {t("dashboard.no_listings")}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
