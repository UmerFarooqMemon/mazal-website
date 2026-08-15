"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button, DirhamAmount } from "@/components/ui";
import { getLoginHref } from "@/lib/auth-redirect";
import type { MarketplaceListingDetail } from "@/services/marketplace";
import {
  addToWatchlist,
  buyListingAtAskingPrice,
  canTransactListing,
  firstMarketplaceError,
  isListingReserved,
  isListingSold,
  MarketplaceRequestError,
  removeFromWatchlist,
} from "@/services/marketplace";

interface ListingSidebarProps {
  listing: MarketplaceListingDetail;
}

export default function ListingSidebar({ listing }: ListingSidebarProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [watchlisted, setWatchlisted] = useState(
    listing.is_watchlisted ?? false,
  );
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  const canTransact = canTransactListing(listing.status);
  const reserved = isListingReserved(listing.status);
  const sold = isListingSold(listing.status);
  const isDirectListing =
    String(listing.listing_type || "").toLowerCase() === "direct";
  const askingPrice = Number(listing.asking_price) || 0;

  const plateCode = listing.code_hidden
    ? listing.plate_code && /^\?+$/.test(String(listing.plate_code))
      ? String(listing.plate_code)
      : "?"
    : listing.plate_code || "—";
  const plateDigits = listing.code_hidden
    ? listing.plate_digits ||
      (listing.digit_count
        ? t("listings.digits_count_label").replace(
            "{count}",
            String(listing.digit_count),
          )
        : "—")
    : listing.digit_count
      ? `${listing.plate_digits || "—"} (${listing.digit_count}-digit)`
      : listing.plate_digits || "—";

  const rows = [
    { label: t("listings.emirate"), value: listing.emirate_label },
    { label: t("listings.code"), value: plateCode },
    { label: t("listings.digits"), value: plateDigits },
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

  const handleBuyAtAsking = async () => {
    if (!isAuthenticated) {
      router.push(
        getLoginHref(locale, `/${locale}/listings/${listing.id}`),
      );
      return;
    }
    if (!isDirectListing || !canTransact) return;

    setBuying(true);
    try {
      const response = await buyListingAtAskingPrice(
        listing.id,
        locale,
        askingPrice,
      );
      const purchaseId = response.data.purchase?.id;
      router.push(
        `/${locale}/listings/${listing.id}/checkout?role=buyer&price=${askingPrice}${
          purchaseId ? `&purchaseId=${purchaseId}` : ""
        }`,
      );
    } catch (error) {
      if (error instanceof MarketplaceRequestError && error.status === 401) {
        router.push(
          getLoginHref(locale, `/${locale}/listings/${listing.id}`),
        );
        return;
      }
      toast.error(
        firstMarketplaceError(error) || "Failed to start purchase.",
      );
    } finally {
      setBuying(false);
    }
  };

  const unavailableMessage = reserved
    ? t("listings.listing_reserved_message")
    : sold
      ? t("listings.listing_sold_message")
      : t("listings.listing_not_available");

  return (
    <div
      className="rounded-2xl border shadow-sm p-[29px] sticky top-24"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className={`mb-5 text-start`}>
        <div
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: getColor("mutedText") }}
        >
          {t("listings.asking_price")}
        </div>
        <div
          className="text-4xl md:text-[48px] leading-none font-serif font-bold mb-2"
          style={{ color: getColor("primaryText") }}
        >
          <DirhamAmount
            amount={Number(listing.asking_price) || 0}
            weight="bold"
          />
        </div>
        <div className="text-xs" style={{ color: getColor("mutedText") }}>
          {t("listings.fees_breakdown")}
        </div>
      </div>

      {!canTransact && !listing.is_owner && (
        <p
          className="mb-4 rounded-xl border px-3 py-2.5 text-xs leading-relaxed text-center"
          style={{
            borderColor: getColor("border"),
            backgroundColor: getColor("background"),
            color: getColor("secondaryText"),
          }}
        >
          {unavailableMessage}
        </p>
      )}

      <div className="flex flex-col gap-3 mb-4">
        {!listing.is_owner &&
          (canTransact ? (
            isDirectListing ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="shadow-md !h-11"
                disabled={buying}
                onClick={handleBuyAtAsking}
              >
                {t("listings.buy_escrow")}
              </Button>
            ) : (
              <Link
                href={`/${locale}/listings/${listing.id}/checkout?role=buyer&price=${listing.asking_price}`}
                className="block"
              >
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="shadow-md !h-11"
                >
                  {t("listings.buy_escrow")}
                </Button>
              </Link>
            )
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled
              className="shadow-md !h-11"
            >
              {t("listings.buy_escrow")}
            </Button>
          ))}

        {listing.is_owner && (
          <Link
            href={`/${locale}/listings/${listing.id}/offer`}
            className="block"
          >
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="shadow-md !h-11"
            >
              {t("listings.manage_offers") || "Manage offers"}
            </Button>
          </Link>
        )}

        {listing.can_make_offer !== false &&
          !listing.is_owner &&
          (canTransact ? (
            <Link
              href={`/${locale}/listings/${listing.id}/offer`}
              className="block"
            >
              <Button
                variant="outline"
                size="lg"
                fullWidth
                className="!h-[46px]"
                style={{
                  borderColor: getColor("border"),
                  color: getColor("primaryText"),
                }}
              >
                {t("listings.make_offer")}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="lg"
              fullWidth
              disabled
              className="!h-[46px]"
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            >
              {t("listings.make_offer")}
            </Button>
          ))}

        {listing.code_hidden &&
          !listing.is_owner &&
          (canTransact ? (
            <Link
              href={`/${locale}/listings/${listing.id}/reveal`}
              className="block"
            >
              <Button
                variant="outline"
                size="lg"
                fullWidth
                className="!h-[46px]"
                style={{
                  borderColor: getColor("primary"),
                  color: getColor("primary"),
                }}
              >
                {t("listings.reveal_code")}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="lg"
              fullWidth
              disabled
              className="!h-[46px]"
              style={{
                borderColor: getColor("primary"),
                color: getColor("primary"),
              }}
            >
              {t("listings.reveal_code")}
            </Button>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <Button
          variant="outline"
          size="md"
          disabled={watchlistLoading}
          onClick={handleWatchlistToggle}
          className={`!h-[38px] flex items-center justify-center gap-2`}
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
          className={`!h-[38px] flex items-center justify-center gap-2`}
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
        className={`border-t pt-4 space-y-2 text-start`}
        style={{ borderColor: getColor("border") }}
      >
        {rows.map((row) => (
          <div key={row.label} className={`flex justify-between text-sm py-1`}>
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
