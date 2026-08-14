"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
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
  getColor: (key: "warning" | "error" | "mutedText") => string,
): ListingStatusTone | null {
  if (isListingReserved(status)) {
    return {
      label: t("listings.status_reserved"),
      style: {
        backgroundColor: `${getColor("warning")}22`,
        color: getColor("warning"),
      },
    };
  }

  if (isListingSold(status)) {
    return {
      label: t("listings.status_sold"),
      style: {
        backgroundColor: `${getColor("error")}22`,
        color: getColor("error"),
      },
    };
  }

  if (previouslySold) {
    return {
      label: t("listings.status_previously_sold"),
      style: {
        backgroundColor: `${getColor("mutedText")}22`,
        color: getColor("mutedText"),
      },
    };
  }

  return null;
}

function resolveListingDetailStatusTone(
  status: MarketplaceListingStatus | string | null | undefined,
  previouslySold: boolean | undefined,
  t: (key: string) => string,
  getColor: (key: "warning" | "error" | "mutedText") => string,
): ListingDetailStatusTone | null {
  if (isListingReserved(status)) {
    return {
      label: t("listings.status_reserved"),
      style: {
        backgroundColor: `${getColor("warning")}22`,
        color: getColor("warning"),
      },
      dot: getColor("warning"),
    };
  }

  if (isListingSold(status)) {
    return {
      label: t("listings.status_sold"),
      style: {
        backgroundColor: `${getColor("error")}22`,
        color: getColor("error"),
      },
      dot: getColor("error"),
    };
  }

  if (previouslySold) {
    return {
      label: t("listings.status_previously_sold"),
      style: {
        backgroundColor: `${getColor("mutedText")}22`,
        color: getColor("mutedText"),
      },
      dot: getColor("mutedText"),
    };
  }

  return null;
}

export function hasListingDetailStatus(
  status?: MarketplaceListingStatus | string | null,
  previouslySold?: boolean,
): boolean {
  return Boolean(resolveListingDetailStatusTone(status, previouslySold, () => "", () => ""));
}

export function getListingDetailCardBackground(
  status?: MarketplaceListingStatus | string | null,
  previouslySold?: boolean,
): string | undefined {
  if (isListingReserved(status)) {
    return "linear-gradient(160deg, color-mix(in srgb, var(--color-warning) 8%, white) 0%, color-mix(in srgb, var(--color-warning) 28%, white) 45%, color-mix(in srgb, var(--color-warning) 45%, white) 100%)";
  }

  if (isListingSold(status)) {
    return "linear-gradient(160deg, color-mix(in srgb, var(--color-error) 8%, white) 0%, color-mix(in srgb, var(--color-error) 28%, white) 45%, color-mix(in srgb, var(--color-error) 45%, white) 100%)";
  }

  if (previouslySold) {
    return "linear-gradient(160deg, color-mix(in srgb, var(--color-muted-text) 8%, white) 0%, color-mix(in srgb, var(--color-muted-text) 28%, white) 45%, color-mix(in srgb, var(--color-muted-text) 40%, white) 100%)";
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
  const { getColor } = useTheme();
  const tone = resolveListingDetailStatusTone(status, previouslySold, t, getColor);

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
  const { getColor } = useTheme();
  const tone = resolveListingStatusTone(status, previouslySold, t, getColor);

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
  const { getColor } = useTheme();
  const tone = resolveListingStatusTone(status, previouslySold, t, getColor);

  if (!tone) return null;

  return (
    <span className={className} style={tone.style}>
      {isListingSold(status) ? (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: getColor("error") }}
        />
      ) : null}
      {tone.label}
    </span>
  );
}
