"use client";

import { useLocale } from "@/context/LocaleContext";
import { ListingInlineStatusBadge } from "@/components/marketplace/ListingStatusBadge";
import type { AuctionKind, AuctionListing, AuctionListingStatus } from "./types";

export const AUCTION_STATUS_STYLES: Record<
  AuctionListingStatus,
  { bg: string; color: string; dot?: string }
> = {
  scheduled: { bg: "#FFF1E6", color: "#C45C1A" },
  live: { bg: "#FEE2E2", color: "#DC2626", dot: "#EF4444" },
  closed: { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  upcoming: { bg: "#EDE9FE", color: "#7C3AED", dot: "#8B5CF6" },
  starting_soon: { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
  paused: { bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
};

export function AuctionKindBadge({ kind }: { kind: AuctionKind }) {
  const { t } = useLocale();
  const scheduled = kind === "scheduled";

  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: scheduled ? "#FFF1E6" : "#DCFCE7",
        color: scheduled ? "#C45C1A" : "#15803D",
      }}
    >
      {scheduled ? t("auctions.badge_scheduled") : t("auctions.badge_open")}
    </span>
  );
}

export function AuctionLiveStatusBadge({
  status,
}: {
  status: AuctionListingStatus;
}) {
  const { t } = useLocale();
  if (status === "scheduled") return null;

  const statusStyle = AUCTION_STATUS_STYLES[status];

  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
      style={{
        backgroundColor: statusStyle.bg,
        color: statusStyle.color,
      }}
    >
      {statusStyle.dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === "live" ? "animate-pulse" : ""
          }`}
          style={{ backgroundColor: statusStyle.dot }}
        />
      )}
      {t(`auctions.status_${status}`)}
    </span>
  );
}

export default function AuctionStatusBadges({
  auction,
  includeMarketplace = true,
  className = "flex flex-wrap items-center gap-2",
}: {
  auction: AuctionListing;
  includeMarketplace?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {includeMarketplace ? (
        <ListingInlineStatusBadge
          status={auction.marketplaceStatus}
          previouslySold={auction.previouslySold}
        />
      ) : null}
      <AuctionKindBadge kind={auction.kind} />
      <AuctionLiveStatusBadge status={auction.status} />
    </div>
  );
}
