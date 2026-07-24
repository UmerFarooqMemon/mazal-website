"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Plus, Search } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import AuctionPageHero from "@/components/auction/AuctionPageHero";
import AuctionListingCard from "@/components/auction/AuctionListingCard";
import { MOCK_AUCTIONS } from "@/components/auction/mockData";

export default function AuctionsPage() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_AUCTIONS;
    return MOCK_AUCTIONS.filter((a) => {
      const hay = `${a.code} ${a.digits} ${a.emirate}`.toLowerCase();
      return hay.includes(q.replace(/\s+/g, " "));
    });
  }, [query]);

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
          <div
            className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            <div className={isRTL ? "text-right" : "text-left"}>
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

          <form
            onSubmit={(e) => e.preventDefault()}
            className={`flex items-center gap-2 bg-white rounded-2xl border p-2 mb-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)] ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ borderColor: getColor("border") }}
          >
            <div
              className={`flex-1 flex items-center gap-2 px-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <Search
                className="w-4 h-4 shrink-0"
                style={{ color: getColor("mutedText") }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("auctions.search_placeholder")}
                className={`w-full bg-transparent outline-none text-sm py-2 ${isRTL ? "text-right" : "text-left"}`}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((auction) => (
              <AuctionListingCard key={auction.id} auction={auction} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
