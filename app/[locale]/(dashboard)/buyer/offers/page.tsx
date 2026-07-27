"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Handshake } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount } from "@/components/ui";
import {
  getMyOffers,
  type MarketplaceOffer,
} from "@/services/marketplace";

export default function BuyerOffersPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyOffers(locale);
      setOffers(response.data.offers || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("offer.load_error") || "Failed to load offers.",
      );
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (themeLoading || localeLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  return (
    <div
      className="min-h-screen pb-16"
      style={{ backgroundColor: getColor("background") }}
    >
      <div
        className="border-b"
        style={{
          borderColor: getColor("border"),
          backgroundColor: getColor("background"),
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Handshake
              className="w-4 h-4"
              style={{ color: getColor("primary") }}
            />
            <p
              className="text-xs font-bold uppercase tracking-[0.14em]"
              style={{ color: getColor("primary") }}
            >
              {t("offer.badge")}
            </p>
          </div>
          <h1
            className="text-3xl md:text-4xl font-serif font-bold"
            style={{ color: getColor("primaryText") }}
          >
            {t("offer.my_offers_title") || "My offers"}
          </h1>
          <p
            className="text-base mt-3 max-w-xl"
            style={{ color: getColor("mutedText") }}
          >
            {t("offer.my_offers_subtitle") ||
              "Track every offer you’ve sent and continue negotiations."}
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10">
        {loading ? (
          <p
            className="text-sm py-12 text-center"
            style={{ color: getColor("mutedText") }}
          >
            {t("common.loading") || "Loading..."}
          </p>
        ) : error ? (
          <p className="text-sm py-12 text-center" style={{ color: "#DC2626" }}>
            {error}
          </p>
        ) : offers.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p style={{ color: getColor("mutedText") }}>
              {t("offer.no_my_offers") || "You haven’t sent any offers yet."}
            </p>
            <Link href={`/${locale}/marketplace`}>
              <Button variant="primary" className="!rounded-lg">
                {t("marketplace.browse_marketplace") || "Browse marketplace"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-2xl border p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{
                  backgroundColor: getColor("surface"),
                  borderColor: getColor("border"),
                }}
              >
                <div>
                  <div
                    className="text-lg font-serif font-bold mb-1"
                    style={{ color: getColor("primaryText") }}
                  >
                    {offer.listing?.display_plate ||
                      offer.listing?.title ||
                      `Listing #${offer.listing_id}`}
                  </div>
                  <div
                    className="text-sm mb-2"
                    style={{ color: getColor("mutedText") }}
                  >
                    {offer.status_label || offer.status}
                    {offer.is_seller_counter
                      ? ` · ${t("offer.seller_counter")}`
                      : ""}
                  </div>
                  <div
                    className="text-base font-semibold"
                    style={{ color: getColor("primaryText") }}
                  >
                    <DirhamAmount amount={Number(offer.amount) || 0} />
                  </div>
                </div>
                <Link href={`/${locale}/listings/${offer.listing_id}/offer`}>
                  <Button variant="outline" className="!rounded-lg">
                    {t("offer.view_negotiation") || "View negotiation"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
