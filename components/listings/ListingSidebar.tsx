"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui";
import type { MarketplaceListingDetail } from "@/services/marketplace";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "@/services/marketplace";

interface ListingSidebarProps {
  listing: MarketplaceListingDetail;
}

export default function ListingSidebar({ listing }: ListingSidebarProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const { isAuthenticated } = useAuth();
  const isRTL = locale === "ar";
  const [watchlisted, setWatchlisted] = useState(
    listing.is_watchlisted ?? false,
  );
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const typeLabel = listing.listing_type_label || listing.listing_type;
  const formattedPrice = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-US",
    {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    },
  ).format(listing.asking_price);

  const plateCode = listing.code_hidden
    ? "•••"
    : listing.plate_code || "—";
  const plateDigits = listing.code_hidden
    ? "•••"
    : listing.plate_digits || "—";
  const digitLabel = listing.digit_count
    ? `${listing.digit_count}-digit`
    : "";

  const rows = [
    { label: t("listings.emirate"), value: listing.emirate_label },
    { label: t("listings.code"), value: plateCode },
    {
      label: t("listings.digits"),
      value: digitLabel ? `${plateDigits} (${digitLabel})` : plateDigits,
    },
    { label: t("listings.type"), value: typeLabel },
  ];

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error(t("common.login_required") || "Please login to continue.");
      return;
    }

    setWatchlistLoading(true);
    try {
      if (watchlisted) {
        await removeFromWatchlist(listing.id, locale);
        setWatchlisted(false);
        toast.success(
          t("listings.watchlist_removed") || "Removed from watchlist.",
        );
      } else {
        await addToWatchlist(listing.id, locale);
        setWatchlisted(true);
        toast.success(t("listings.watchlist_added") || "Added to watchlist.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Watchlist update failed.",
      );
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("listings.link_copied") || "Link copied.");
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <div
      className="rounded-2xl border shadow-sm p-6 sticky top-24"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
        <div
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: getColor("mutedText") }}
        >
          {t("listings.asking_price")}
        </div>
        <div
          className="text-4xl md:text-5xl font-serif font-bold mb-2"
          style={{ color: getColor("primaryText") }}
        >
          {formattedPrice}
        </div>
        <div className="text-xs" style={{ color: getColor("mutedText") }}>
          {t("listings.fees_breakdown")}
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <Link
          href={`/${locale}/listings/${listing.id}/checkout?role=buyer&price=${listing.asking_price}`}
          className="block"
        >
          <Button variant="primary" size="lg" fullWidth className="shadow-md">
            {t("listings.buy_escrow")}
          </Button>
        </Link>

        {listing.can_make_offer !== false && !listing.is_owner && (
          <Link
            href={`/${locale}/listings/${listing.id}/offer`}
            className="block"
          >
            <Button
              variant="outline"
              size="lg"
              fullWidth
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            >
              {t("listings.make_offer")}
            </Button>
          </Link>
        )}

        {listing.code_hidden && (
          <Link
            href={`/${locale}/listings/${listing.id}/reveal`}
            className="block"
          >
            <Button
              variant="outline"
              size="lg"
              fullWidth
              style={{
                borderColor: getColor("primary"),
                color: getColor("primary"),
              }}
            >
              {t("listings.reveal_code") || "Reveal plate code"}
            </Button>
          </Link>
        )}
      </div>

      <div
        className={`grid grid-cols-2 gap-3 mb-8 ${isRTL ? "direction-rtl" : ""}`}
      >
        <Button
          variant="outline"
          size="md"
          disabled={watchlistLoading}
          onClick={handleWatchlistToggle}
          className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{
            borderColor: getColor("border"),
            color: getColor("secondaryText"),
          }}
        >
          <Heart
            className={`w-4 h-4 ${watchlisted ? "fill-[#E11D48] text-[#E11D48]" : ""}`}
          />
          {t("listings.watchlist")}
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={handleShare}
          className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{
            borderColor: getColor("border"),
            color: getColor("secondaryText"),
          }}
        >
          <Share2 className="w-4 h-4" />
          {t("listings.share")}
        </Button>
      </div>

      <div
        className={`border-t pt-6 space-y-3 ${isRTL ? "text-right" : "text-left"}`}
        style={{ borderColor: getColor("border") }}
      >
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span style={{ color: getColor("mutedText") }}>{row.label}</span>
            <span
              className="font-medium"
              style={{ color: getColor("primaryText") }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
