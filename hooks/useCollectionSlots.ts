"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAvailableCollectionSlots,
  type CollectionSlot,
} from "@/services/collection-slots";
import { useLocale } from "@/context/LocaleContext";

export function useCollectionSlots(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { locale } = useLocale();
  const [slots, setSlots] = useState<CollectionSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const refresh = useCallback(async (): Promise<CollectionSlot[]> => {
    if (!enabled) return [];
    setLoading(true);
    try {
      const next = await getAvailableCollectionSlots(locale);
      setSlots(next);
      setError(null);
      setSelectedId((current) =>
        current != null && next.some((slot) => slot.id === current)
          ? current
          : null,
      );
      return next;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load collection slots.";
      setError(message);
      setSlots([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [enabled, locale]);

  useEffect(() => {
    if (!enabled) {
      setSlots([]);
      setError(null);
      setSelectedId(null);
      return;
    }
    void refresh();
  }, [enabled, refresh]);

  return {
    slots,
    loading,
    error,
    selectedId,
    setSelectedId,
    refresh,
  };
}
