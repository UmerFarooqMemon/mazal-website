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
  const [collectionFeeAmount, setCollectionFeeAmount] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const refresh = useCallback(async (): Promise<CollectionSlot[]> => {
    if (!enabled) return [];
    setLoading(true);
    try {
      const next = await getAvailableCollectionSlots(locale);
      setSlots(next.slots);
      setCollectionFeeAmount(next.cashChequeCollectionFeeAmount ?? null);
      setError(null);
      setSelectedId((current) =>
        current != null && next.slots.some((slot) => slot.id === current)
          ? current
          : null,
      );
      return next.slots;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load collection slots.";
      setError(message);
      setSlots([]);
      setCollectionFeeAmount(null);
      return [];
    } finally {
      setLoading(false);
    }
  }, [enabled, locale]);

  useEffect(() => {
    if (!enabled) {
      setSlots([]);
      setCollectionFeeAmount(null);
      setError(null);
      setSelectedId(null);
      return;
    }
    void refresh();
  }, [enabled, refresh]);

  return {
    slots,
    collectionFeeAmount,
    loading,
    error,
    selectedId,
    setSelectedId,
    refresh,
  };
}
