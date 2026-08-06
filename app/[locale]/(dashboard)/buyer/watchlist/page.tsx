"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FolderPlus, Heart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import PlateCard from "@/components/marketplace/PlateCard";
import {
  createWatchlistCategory,
  deleteWatchlistCategory,
  getWatchlist,
  mapListingsToPlateCards,
  removeFromWatchlist,
  type MarketplaceWatchlistCategory,
  type MarketplaceWatchlistItem,
} from "@/services/marketplace";

export default function BuyerWatchlistPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const [categories, setCategories] = useState<MarketplaceWatchlistCategory[]>(
    [],
  );
  const [uncategorized, setUncategorized] = useState<
    MarketplaceWatchlistItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWatchlist(locale);
      setCategories(response.data.categories || []);
      setUncategorized(response.data.uncategorized || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("marketplace.watchlist_load_error") ||
              "Failed to load watchlist.",
      );
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setCreating(true);
    try {
      await createWatchlistCategory(name, locale);
      setNewCategory("");
      toast.success(
        t("marketplace.category_created") || "Category created.",
      );
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create category.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteWatchlistCategory(id, locale);
      toast.success(
        t("marketplace.category_deleted") || "Category deleted.",
      );
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category.",
      );
    }
  };

  const handleRemoveItem = async (listingId: number) => {
    try {
      await removeFromWatchlist(listingId, locale);
      toast.success(t("listings.watchlist_removed") || "Removed from watchlist.");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove item.",
      );
    }
  };

  const renderGrid = (items: MarketplaceWatchlistItem[]) => {
    if (!items.length) {
      return (
        <p className="text-sm py-6" style={{ color: getColor("mutedText") }}>
          {t("marketplace.watchlist_empty_section") || "No plates in this list."}
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => {
          const plate = mapListingsToPlateCards([item.listing])[0];
          return (
            <div key={item.id} className="relative group">
              <PlateCard
                id={plate.id}
                status={plate.status}
                emirate={plate.emirate}
                code={plate.code}
                price={plate.price}
                tier={plate.tier}
                type={plate.type}
                views={plate.views}
                rating={plate.rating}
                previouslySold={plate.previouslySold}
                imageUrl={plate.imageUrl}
                plate_code={plate.plate_code}
                plate_digits={plate.plate_digits}
                plate_type={plate.plate_type}
                plate_design={plate.plate_design}
                preview={plate.preview}
                hideCode={plate.hideCode}
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(item.listing.id)}
                className="absolute top-3 end-3 z-10 size-9 rounded-full border flex items-center justify-center bg-white/95 hover:bg-white transition-colors"
                style={{ borderColor: getColor("border") }}
                aria-label="Remove from watchlist"
              >
                <Trash2
                  className="w-4 h-4"
                  style={{ color: getColor("secondaryText") }}
                />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  if (themeLoading || localeLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  const totalCount =
    uncategorized.length +
    categories.reduce((sum, category) => sum + category.items.length, 0);

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
            <Heart
              className="w-4 h-4"
              style={{ color: getColor("primary") }}
            />
            <p
              className="text-xs font-bold uppercase tracking-[0.14em]"
              style={{ color: getColor("primary") }}
            >
              {t("marketplace.watchlist_eyebrow") || "Watchlist"}
            </p>
          </div>
          <h1
            className="text-3xl md:text-4xl font-serif font-bold"
            style={{ color: getColor("primaryText") }}
          >
            {t("marketplace.watchlist_title") || "Saved plates"}
          </h1>
          <p
            className="text-base mt-3 max-w-xl"
            style={{ color: getColor("mutedText") }}
          >
            {t("marketplace.watchlist_subtitle") ||
              "Track plates you’re watching and organise them into categories."}
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10 space-y-10">
        <div
          className="rounded-2xl border p-5 md:p-6 flex flex-col sm:flex-row gap-3 sm:items-center"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
        >
          <div className="flex items-center gap-2 grow">
            <FolderPlus
              className="w-4 h-4 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder={
                t("marketplace.category_placeholder") || "New category name"
              }
              className="w-full h-11 rounded-xl border px-4 text-sm outline-none"
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
                backgroundColor: getColor("surface"),
              }}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleCreateCategory}
            loading={creating}
            className="!rounded-lg shrink-0"
          >
            {t("marketplace.create_category") || "Create category"}
          </Button>
        </div>

        {loading ? (
          <p className="text-sm py-12 text-center" style={{ color: getColor("mutedText") }}>
            {t("common.loading") || "Loading..."}
          </p>
        ) : error ? (
          <div className="text-center py-12 space-y-4">
            <p style={{ color: "#DC2626" }}>{error}</p>
            <Link
              href={`/${locale}/marketplace`}
              className="text-sm font-semibold underline"
              style={{ color: getColor("primary") }}
            >
              {t("marketplace.browse_marketplace") || "Browse marketplace"}
            </Link>
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p style={{ color: getColor("mutedText") }}>
              {t("marketplace.watchlist_empty") ||
                "Your watchlist is empty. Save plates from the marketplace."}
            </p>
            <Link href={`/${locale}/marketplace`}>
              <Button variant="primary" className="!rounded-lg">
                {t("marketplace.browse_marketplace") || "Browse marketplace"}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <section>
              <h2
                className="text-lg font-serif font-bold mb-4"
                style={{ color: getColor("primaryText") }}
              >
                {t("marketplace.uncategorized") || "Uncategorized"}
              </h2>
              {renderGrid(uncategorized)}
            </section>

            {categories.map((category) => (
              <section key={category.id}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2
                    className="text-lg font-serif font-bold"
                    style={{ color: getColor("primaryText") }}
                  >
                    {category.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-xs font-semibold underline"
                    style={{ color: getColor("mutedText") }}
                  >
                    {t("marketplace.delete_category") || "Delete category"}
                  </button>
                </div>
                {renderGrid(category.items)}
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
