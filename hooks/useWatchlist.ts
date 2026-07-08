"use client";
import { useState, useEffect } from "react";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load the menu on startup
  useEffect(() => {
    const saved = localStorage.getItem("mazal_watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  const toggleWatchlist = (plateId: string) => {
    setWatchlist((prev) => {
      let updated;
      if (prev.includes(plateId)) {
        updated = prev.filter((id) => id !== plateId);
      } else {
        updated = [...prev, plateId];
      }
      localStorage.setItem("mazal_watchlist", JSON.stringify(updated));
      return updated;
    });
  };

  const isWatchlisted = (plateId: string) => watchlist.includes(plateId);

  return { watchlist, toggleWatchlist, isWatchlisted };
}
