"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import {
  getMyAuctionRegistrations,
  type MarketplaceAuctionRegistration,
} from "@/services/marketplace";

function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MyAuctionRegistrationsPage() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const [registrations, setRegistrations] = useState<
    MarketplaceAuctionRegistration[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyAuctionRegistrations(locale);
      setRegistrations(response.data.registrations || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load auction registrations.",
      );
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1
                className="font-serif text-[28px] sm:text-[32px] mb-1"
                style={{ color: getColor("primaryText") }}
              >
                {t("auctions.my_registrations_title") ||
                  "My Auction Registrations"}
              </h1>
              <p
                className="text-sm max-w-xl"
                style={{ color: getColor("secondaryText") }}
              >
                {t("auctions.my_registrations_subtitle") ||
                  "Track your auction deposits and bidding eligibility."}
              </p>
            </div>
            <Link
              href={`/${locale}/auctions`}
              className="text-sm font-semibold hover:opacity-80"
              style={{ color: getColor("primary") }}
            >
              {t("auctions.section_title")}
            </Link>
          </div>

          {error && (
            <p className="text-sm mb-6" style={{ color: "#DC2626" }}>
              {error}
            </p>
          )}

          {loading ? (
            <div
              className="text-sm py-12 text-center"
              style={{ color: getColor("mutedText") }}
            >
              {t("common.loading") || "Loading..."}
            </div>
          ) : registrations.length === 0 ? (
            <div
              className="rounded-2xl border bg-white p-8 text-center"
              style={{ borderColor: getColor("border") }}
            >
              <p className="text-sm mb-4" style={{ color: getColor("mutedText") }}>
                {t("auctions.no_registrations") ||
                  "You have not registered for any auctions yet."}
              </p>
              <Link
                href={`/${locale}/auctions`}
                className="text-sm font-semibold"
                style={{ color: getColor("primary") }}
              >
                {t("auctions.browse_auctions") || "Browse auctions"}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration) => {
                const listing = registration.listing;
                const listingId = registration.listing_id;
                const title =
                  listing && "title" in listing && listing.title
                    ? listing.title
                    : listing && "display_plate" in listing && listing.display_plate
                      ? listing.display_plate
                      : `Listing #${listingId}`;

                return (
                  <div
                    key={registration.id}
                    className="rounded-2xl border bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
                    style={{ borderColor: getColor("border") }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <Link
                          href={`/${locale}/auctions/${listingId}`}
                          className="text-lg font-semibold hover:opacity-80"
                          style={{ color: getColor("primaryText") }}
                        >
                          {title}
                        </Link>
                        <div
                          className="flex flex-wrap gap-3 mt-2 text-sm"
                          style={{ color: getColor("secondaryText") }}
                        >
                          <span>
                            {registration.status_label || registration.status}
                          </span>
                          <span>•</span>
                          <span>
                            {t("auctions.summary_deposit_status")}:{" "}
                            {registration.deposit_status_label ||
                              registration.deposit_status}
                          </span>
                        </div>
                      </div>

                      <div className="text-end">
                        <div
                          className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                          style={{ color: getColor("mutedText") }}
                        >
                          {t("auctions.summary_min_deposit")}
                        </div>
                        <div
                          className="text-lg font-bold"
                          style={{ color: getColor("primaryText") }}
                        >
                          <DirhamAmount
                            amount={toNumber(registration.deposit_amount)}
                            weight="bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/${locale}/auctions/${listingId}`}
                        className="text-sm font-semibold"
                        style={{ color: getColor("primary") }}
                      >
                        {t("auctions.view_auction") || "View auction"}
                      </Link>
                      {registration.deposit_status?.toLowerCase() !== "held" && (
                        <Link
                          href={`/${locale}/auctions/${listingId}/register`}
                          className="text-sm font-semibold"
                          style={{ color: getColor("primary") }}
                        >
                          {t("auctions.add_deposit_cta")}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
