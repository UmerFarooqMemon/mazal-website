"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import {
  getMyAuctionRegistrations,
  type MarketplaceAuctionRegistration,
} from "@/services/marketplace";

function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function plateFromDisplay(displayPlate?: string | null) {
  const display = String(displayPlate || "").trim();
  const displayMatch = display.match(/^([A-Za-z?]{1,3})\s+(.+)$/);
  return {
    code: displayMatch?.[1]?.toUpperCase() || "",
    digits: (displayMatch?.[2] || "").replace(/\s+/g, ""),
  };
}

function mapRegistrationRow(reg: MarketplaceAuctionRegistration) {
  const listing = reg.listing;
  const fromDisplay = plateFromDisplay(listing?.display_plate);
  const plate_code = String(
    listing?.plate_code || fromDisplay.code || "",
  ).trim();
  const plate_digits = String(
    listing?.plate_digits || fromDisplay.digits || "",
  ).trim();
  const listingId = listing?.id ?? reg.listing_id;
  const display_plate =
    listing?.display_plate ||
    (plate_code && plate_digits ? `${plate_code} ${plate_digits}` : "") ||
    listing?.title ||
    `Listing #${listingId}`;

  return {
    registrationId: reg.id,
    listingId,
    title: listing?.title || display_plate,
    depositStatus: reg.deposit_status,
    depositAmount: reg.deposit_amount,
    preview: listing?.preview ?? null,
    plate_code: plate_code || undefined,
    plate_digits,
    display_plate,
    emirate: listing?.emirate,
    plate_type: listing?.plate_type,
    plate_design: listing?.plate_design,
    statusLabel: reg.status_label || reg.status,
    depositStatusLabel: reg.deposit_status_label || reg.deposit_status,
  };
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
                const row = mapRegistrationRow(registration);

                return (
                  <div
                    key={row.registrationId}
                    className="rounded-2xl border bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
                    style={{ borderColor: getColor("border") }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        {row.preview ? (
                          <Link
                            href={`/${locale}/auctions/${row.listingId}`}
                            className="block max-w-[345px]"
                          >
                            <NumberPlateDisplay
                              plate_code={row.plate_code}
                              plate_digits={row.plate_digits}
                              emirate={row.emirate}
                              preview={row.preview}
                              plateType={row.plate_type || undefined}
                              plateDesign={row.plate_design || undefined}
                              crop="card"
                              hideCode={false}
                              scaleFontToWidth
                              fontScaleMultiplier={2.3}
                            />
                          </Link>
                        ) : (
                          <Link
                            href={`/${locale}/auctions/${row.listingId}`}
                            className="text-lg font-semibold hover:opacity-80"
                            style={{ color: getColor("primaryText") }}
                          >
                            {row.display_plate || row.title}
                          </Link>
                        )}
                        <div
                          className="flex flex-wrap gap-3 mt-2 text-sm"
                          style={{ color: getColor("secondaryText") }}
                        >
                          <span>{row.statusLabel}</span>
                          <span>•</span>
                          <span>
                            {t("auctions.summary_deposit_status")}:{" "}
                            {row.depositStatusLabel}
                          </span>
                        </div>
                      </div>

                      <div className="text-end shrink-0">
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
                            amount={toNumber(row.depositAmount)}
                            weight="bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/${locale}/auctions/${row.listingId}`}
                        className="text-sm font-semibold"
                        style={{ color: getColor("primary") }}
                      >
                        {t("auctions.view_auction") || "View auction"}
                      </Link>
                      {row.depositStatus?.toLowerCase() !== "held" && (
                        <Link
                          href={`/${locale}/auctions/${row.listingId}/register`}
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
