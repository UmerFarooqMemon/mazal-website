"use client";
import { useState, useEffect, useCallback } from "react";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "@/services/marketplace";

export function useWatchlist(locale = "en") {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [usingApi, setUsingApi] = useState(false);

  const loadFromApi = useCallback(async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (!token) return false;

    try {
      const response = await getWatchlist(locale);
      const ids = [
        ...(response.data.uncategorized || []).map((item) =>
          String(item.listing.id),
        ),
        ...(response.data.categories || []).flatMap((category) =>
          category.items.map((item) => String(item.listing.id)),
        ),
      ];
      setWatchlist([...new Set(ids)]);
      setUsingApi(true);
      return true;
    } catch {
      return false;
    }
  }, [locale]);

  useEffect(() => {
    let active = true;

    (async () => {
      const loaded = await loadFromApi();
      if (!active || loaded) return;

      const saved = localStorage.getItem("mazal_watchlist");
      if (saved) setWatchlist(JSON.parse(saved));
    })();

    return () => {
      active = false;
    };
  }, [loadFromApi]);

  const toggleWatchlist = async (plateId: string) => {
    const isListed = watchlist.includes(plateId);

    if (usingApi) {
      try {
        if (isListed) {
          await removeFromWatchlist(plateId, locale);
        } else {
          await addToWatchlist(Number(plateId), locale);
        }
        await loadFromApi();
        return;
      } catch {
        // Fall through to local storage fallback
      }
    }

    setWatchlist((prev) => {
      const updated = isListed
        ? prev.filter((id) => id !== plateId)
        : [...prev, plateId];
      localStorage.setItem("mazal_watchlist", JSON.stringify(updated));
      return updated;
    });
  };

  const isWatchlisted = (plateId: string) => watchlist.includes(plateId);

  return { watchlist, toggleWatchlist, isWatchlisted, usingApi };
}
