"use client";

import Link from "next/link";
import { Heart, Store, Trash2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button, DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import type { MarketplaceListingCard } from "@/services/marketplace";
import {
  DASH_BORDER,
  DASH_BTN,
  DASH_MUTED,
  DASH_TEXT,
  dashPanel,
} from "./theme";

export default function DashboardWatchlistPanel({
  items,
  onRemove,
}: {
  items: MarketplaceListingCard[];
  onRemove: (listingId: number) => void;
}) {
  const { t, locale } = useLocale();

  return (
    <section className={dashPanel}>
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-6"
        style={{ borderColor: DASH_BORDER }}
      >
        <div className="text-start">
          <h2 className="font-serif text-2xl font-normal" style={{ color: DASH_TEXT }}>
            {t("dashboard.watchlist_title")}
          </h2>
          <p className="mt-1 text-sm" style={{ color: DASH_MUTED }}>
            {t("dashboard.edit_reflected")}
          </p>
        </div>
        <Link href={`/${locale}/marketplace`}>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Store className="h-4 w-4" />}
            className="h-[38px] rounded-full px-5 text-sm font-medium"
            style={{ background: DASH_BTN }}
          >
            {t("dashboard.browse_marketplace")}
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm" style={{ color: DASH_MUTED }}>
          {t("dashboard.no_watchlist")}
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: DASH_BORDER }}>
          {items.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col gap-6 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="w-full max-w-[345px] text-start">
                <NumberPlateDisplay
                  plate_code={listing.plate_code || undefined}
                  plate_digits={String(listing.plate_digits || "")}
                  emirate={listing.emirate}
                  preview={listing.preview}
                  plateType={listing.plate_type || undefined}
                  plateDesign={listing.plate_design || undefined}
                  crop="card"
                  wrapperClassName="w-full overflow-hidden"
                />
                <p className="mt-2 text-[26px] font-bold leading-8 text-black">
                  <DirhamAmount
                    amount={Number(listing.asking_price) || 0}
                    weight="bold"
                  />
                </p>
              </div>
              <div className="flex items-center gap-5">
                <Link
                  href={`/${locale}/listings/${listing.id}`}
                  className="inline-flex h-[35px] w-[35px] items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(1,92,20,0.05)" }}
                  aria-label={t("listings.watchlist")}
                >
                  <Heart className="h-4 w-4 fill-[#0f6646] text-[#0f6646]" />
                </Link>
                <button
                  type="button"
                  onClick={() => onRemove(listing.id)}
                  className="inline-flex h-[35px] w-[35px] items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(1,92,20,0.05)" }}
                  aria-label={t("common.delete") || "Remove"}
                >
                  <Trash2 className="h-4 w-4 text-[#0f6646]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
