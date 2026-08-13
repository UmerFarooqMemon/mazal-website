"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button, DirhamAmount } from "@/components/ui";
import {
  getRecentListingOffers,
  toMarketplaceNumber,
  type MarketplaceOffer,
} from "@/services/marketplace";
import type { DashboardListingRow } from "./DashboardListingsPanel";
import { DASH_BORDER, DASH_BTN, DASH_MUTED, DASH_TEXT } from "./theme";

export default function DashboardOffersPanel({
  listing,
  onClose,
}: {
  listing: DashboardListingRow | null;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listing) return;
    let active = true;
    setLoading(true);
    setError(null);
    getRecentListingOffers(listing.listingId, locale)
      .then((response) => {
        if (!active) return;
        setOffers(response.data.offers || []);
      })
      .catch((err) => {
        if (!active) return;
        setOffers([]);
        setError(
          err instanceof Error ? err.message : t("dashboard.offers_load_failed"),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [listing, locale, t]);

  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="relative w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 text-[#545e6f] hover:text-[#081123]"
          aria-label={t("common.close") || "Close"}
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          className="font-serif text-[28px] font-semibold leading-8"
          style={{ color: DASH_TEXT }}
        >
          {t("dashboard.see_all_offers")}
        </h2>
        <p className="mt-2 text-sm" style={{ color: DASH_MUTED }}>
          {listing.plate_code
            ? `${listing.plate_code} ${listing.plate_digits}`
            : listing.plate_digits}
        </p>

        <div className="mt-6 max-h-[360px] space-y-2 overflow-y-auto">
          {loading ? (
            <p className="text-sm" style={{ color: DASH_MUTED }}>
              {t("common.loading") || "Loading..."}
            </p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : offers.length === 0 ? (
            <p className="text-sm" style={{ color: DASH_MUTED }}>
              {t("dashboard.no_offers")}
            </p>
          ) : (
            offers.map((offer) => (
              <div
                key={offer.id}
                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                style={{ borderColor: DASH_BORDER }}
              >
                <div className="min-w-0 text-start">
                  <p className="truncate text-sm font-medium" style={{ color: DASH_TEXT }}>
                    {offer.buyer?.name || t("dashboard.offer_buyer_fallback")}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: DASH_MUTED }}>
                    {offer.status_label || offer.status}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold" style={{ color: DASH_TEXT }}>
                  <DirhamAmount
                    amount={toMarketplaceNumber(offer.amount)}
                    weight="bold"
                  />
                </p>
              </div>
            ))
          )}
        </div>

        <Link href={`/${locale}/listings/${listing.listingId}/offer`} className="mt-6 block">
          <Button
            type="button"
            variant="primary"
            className="h-11 w-full rounded-full text-base font-medium"
            style={{ background: DASH_BTN }}
          >
            {t("dashboard.manage_offers")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
