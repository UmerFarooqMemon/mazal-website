"use client";

import { useLocale } from "@/context/LocaleContext";
import {
  isListingReserved,
  isListingSold,
  type MarketplaceListingStatus,
} from "@/services/marketplace";

interface ListingStatusBadgeProps {
  status?: MarketplaceListingStatus | string | null;
  previouslySold?: boolean;
  className?: string;
  showSold?: boolean;
}

type ListingStatusTone = {
  label: string;
  style: { backgroundColor: string; color: string };
};

type ListingDetailStatusTone = ListingStatusTone & {
  dot?: string;
  pulse?: boolean;
};

function resolveListingStatusTone(
  status: MarketplaceListingStatus | string | null | undefined,
  previouslySold: boolean | undefined,
  t: (key: string) => string,
): ListingStatusTone | null {
  if (isListingReserved(status)) {
    return {
      label: t("listings.status_reserved"),
      style: { backgroundColor: "#FEF3C7", color: "#B45309" },
    };
  }

  if (isListingSold(status)) {
    return {
      label: t("listings.status_sold"),
      // Match auction LIVE badge colors.
      style: { backgroundColor: "#FEE2E2", color: "#DC2626" },
    };
  }

  if (previouslySold) {
    return {
      label: t("listings.status_previously_sold"),
      style: { backgroundColor: "#F5E6D3", color: "#8B5E2B" },
    };
  }

  return null;
}

function resolveListingDetailStatusTone(
  status: MarketplaceListingStatus | string | null | undefined,
  previouslySold: boolean | undefined,
  t: (key: string) => string,
): ListingDetailStatusTone | null {
  if (isListingReserved(status)) {
    return {
      label: t("listings.status_reserved"),
      style: { backgroundColor: "#FEF3C7", color: "#B45309" },
      dot: "#F59E0B",
    };
  }

  if (isListingSold(status)) {
    return {
      label: t("listings.status_sold"),
      // Match auction LIVE badge colors.
      style: { backgroundColor: "#FEE2E2", color: "#DC2626" },
      dot: "#EF4444",
    };
  }

  if (previouslySold) {
    return {
      label: t("listings.status_previously_sold"),
      style: { backgroundColor: "#F5E6D3", color: "#8B5E2B" },
      dot: "#8B5E2B",
    };
  }

  return null;
}

export function hasListingDetailStatus(
  status?: MarketplaceListingStatus | string | null,
  previouslySold?: boolean,
): boolean {
  return Boolean(resolveListingDetailStatusTone(status, previouslySold, () => ""));
}

export function getListingDetailCardBackground(
  status?: MarketplaceListingStatus | string | null,
  previouslySold?: boolean,
): string | undefined {
  if (isListingReserved(status)) {
    return "linear-gradient(160deg, #FFFBEB 0%, #FEF3C7 45%, #FDE68A 100%)";
  }

  if (isListingSold(status)) {
    return "linear-gradient(160deg, #FFF5F5 0%, #FEE2E2 45%, #FECACA 100%)";
  }

  if (previouslySold) {
    return "linear-gradient(160deg, #FDF8F3 0%, #F5E6D3 45%, #EFE4D2 100%)";
  }

  return undefined;
}

/** Auction-style side badge for listing detail hero areas. */
export function ListingDetailStatusBadge({
  status,
  previouslySold,
  className = "text-[11px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5",
}: ListingStatusBadgeProps) {
  const { t } = useLocale();
  const tone = resolveListingDetailStatusTone(status, previouslySold, t);

  if (!tone) return null;

  return (
    <span className={className} style={tone.style}>
      {tone.dot ? (
        <span
          className={`w-1.5 h-1.5 rounded-full ${tone.pulse ? "animate-pulse" : ""}`}
          style={{ backgroundColor: tone.dot }}
        />
      ) : null}
      {tone.label}
    </span>
  );
}

/** Top-center badge for reserved / sold / previously-sold cards. */
export function ListingStatusBadge({
  status,
  previouslySold,
  className = "absolute top-4 left-1/2 -translate-x-1/2 z-10 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
  showSold = false,
}: ListingStatusBadgeProps) {
  const { t } = useLocale();
  const tone = resolveListingStatusTone(status, previouslySold, t);

  if (!tone) return null;
  if (isListingSold(status) && !showSold) return null;

  return (
    <span className={className} style={tone.style}>
      {tone.label}
    </span>
  );
}

interface ListingInlineStatusBadgeProps {
  status?: MarketplaceListingStatus | string | null;
  previouslySold?: boolean;
  className?: string;
}

/** Inline badge for showing listing status under the plate. */
export function ListingInlineStatusBadge({
  status,
  previouslySold,
  className = "text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full inline-flex items-center gap-1.5",
}: ListingInlineStatusBadgeProps) {
  const { t } = useLocale();
  const tone = resolveListingStatusTone(status, previouslySold, t);

  if (!tone) return null;

  return (
    <span className={className} style={tone.style}>
      {isListingSold(status) ? (
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
      ) : null}
      {tone.label}
    </span>
  );
}
