"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/hooks/useAuth";
import {
  getAuctionCapacity,
  type AuctionCapacity,
} from "@/services/marketplace";
import { AUCTION_CAPACITY_REFRESH_EVENT } from "@/lib/auction-notification-actions";

interface AuctionCapacityContextValue {
  capacity: AuctionCapacity | null;
  loading: boolean;
  refresh: () => Promise<void>;
  applyCapacity: (next: AuctionCapacity | null | undefined) => void;
}

const AuctionCapacityContext = createContext<
  AuctionCapacityContextValue | undefined
>(undefined);

const POLL_INTERVAL_MS = 45_000;

export function AuctionCapacityProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const [capacity, setCapacity] = useState<AuctionCapacity | null>(null);
  const [loading, setLoading] = useState(false);

  const applyCapacity = useCallback(
    (next: AuctionCapacity | null | undefined) => {
      if (next) setCapacity(next);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCapacity(null);
      return;
    }

    setLoading(true);
    try {
      const response = await getAuctionCapacity(locale);
      setCapacity(response.data.auction_capacity ?? null);
    } catch {
      // Keep the last known snapshot.
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, locale]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);
    const onRefresh = () => {
      void refresh();
    };
    window.addEventListener(AUCTION_CAPACITY_REFRESH_EVENT, onRefresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(AUCTION_CAPACITY_REFRESH_EVENT, onRefresh);
    };
  }, [isAuthenticated, refresh]);

  const value = useMemo(
    () => ({ capacity, loading, refresh, applyCapacity }),
    [applyCapacity, capacity, loading, refresh],
  );

  return (
    <AuctionCapacityContext.Provider value={value}>
      {children}
    </AuctionCapacityContext.Provider>
  );
}

export function useAuctionCapacity() {
  const context = useContext(AuctionCapacityContext);
  if (!context) {
    throw new Error(
      "useAuctionCapacity must be used within AuctionCapacityProvider",
    );
  }
  return context;
}

export function useOptionalAuctionCapacity() {
  return useContext(AuctionCapacityContext);
}
