"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { ListingInlineStatusBadge } from "@/components/marketplace/ListingStatusBadge";
import type { AuctionKind, AuctionListing, AuctionListingStatus } from "./types";

export function AuctionKindBadge({ kind }: { kind: AuctionKind }) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const scheduled = kind === "scheduled";

  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: scheduled
          ? `${getColor("warning")}22`
          : `${getColor("success")}22`,
        color: scheduled ? getColor("warning") : getColor("success"),
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
  const { getColor } = useTheme();
  if (status === "scheduled") return null;

  const styles: Record<
    AuctionListingStatus,
    { bg: string; color: string; dot?: string }
  > = {
    scheduled: {
      bg: `${getColor("warning")}22`,
      color: getColor("warning"),
    },
    live: {
      bg: `${getColor("error")}22`,
      color: getColor("error"),
      dot: getColor("error"),
    },
    closed: {
      bg: `${getColor("mutedText")}18`,
      color: getColor("mutedText"),
      dot: getColor("mutedText"),
    },
    upcoming: {
      bg: `${getColor("primary")}18`,
      color: getColor("primary"),
      dot: getColor("primary"),
    },
    starting_soon: {
      bg: `${getColor("success")}22`,
      color: getColor("success"),
      dot: getColor("success"),
    },
    paused: {
      bg: `${getColor("warning")}22`,
      color: getColor("warning"),
      dot: getColor("warning"),
    },
  };

  const statusStyle = styles[status];

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
