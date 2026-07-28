"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Plus, Search } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import AuctionPageHero from "@/components/auction/AuctionPageHero";
import AuctionListingCard from "@/components/auction/AuctionListingCard";
import { mapListingToAuctionListing } from "@/components/auction/mappers";
import type { AuctionListing } from "@/components/auction/types";
import { searchListings } from "@/services/marketplace";

export default function AuctionsPage() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchListings(
        {
          listing_type: "auction",
          q: appliedQuery || undefined,
          per_page: 24,
          page: 1,
        },
        locale,
      );

      const mapped = (response.data.listings || []).map((listing) =>
        mapListingToAuctionListing(listing, listing.auction),
      );
      setAuctions(mapped);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load auctions.",
      );
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, [appliedQuery, locale]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return auctions;
    return auctions.filter((a) => {
      const hay = `${a.code} ${a.digits} ${a.emirate}`.toLowerCase();
      return hay.includes(q.replace(/\s+/g, " "));
    });
  }, [auctions, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(query.trim());
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="max-w-6xl mx-auto">
          <AuctionPageHero />
        </div>
      </section>

      <section
        className="px-4 sm:px-6 lg:px-8 pb-16 pt-2"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, #F2F8F3 48px, #F2F8F3 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2
                className="font-serif text-[28px] sm:text-[32px] mb-1"
                style={{ color: getColor("primaryText") }}
              >
                {t("auctions.section_title")}
              </h2>
              <p
                className="text-sm max-w-xl"
                style={{ color: getColor("secondaryText") }}
              >
                {t("auctions.section_subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/auctions/registrations`}
                className="text-sm font-semibold hover:opacity-80"
                style={{ color: getColor("primary") }}
              >
                {t("auctions.my_registrations_title") || "My registrations"}
              </Link>
              <Link href={`/${locale}/auctions/add`}>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="rounded-full"
                >
                  {t("auctions.add_plate")}
                </Button>
              </Link>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-white rounded-2xl border p-2 mb-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
            style={{ borderColor: getColor("border") }}
          >
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search
                className="w-4 h-4 shrink-0"
                style={{ color: getColor("mutedText") }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("auctions.search_placeholder")}
                className="w-full bg-transparent outline-none text-sm py-2"
                style={{ color: getColor("primaryText") }}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Filter className="w-4 h-4" />}
              className="rounded-xl shrink-0"
            >
              {t("auctions.search")}
            </Button>
          </form>

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
          ) : filtered.length === 0 ? (
            <div
              className="text-sm py-12 text-center"
              style={{ color: getColor("mutedText") }}
            >
              {t("common.no_results") || "No auctions found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((auction) => (
                <AuctionListingCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
