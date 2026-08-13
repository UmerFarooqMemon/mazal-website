"use client";

import { useEffect, useState } from "react";
import { FALLBACK_GIFT_PRODUCTS } from "@/components/private-deal/giftPackages";
import { useLocale } from "@/context/LocaleContext";
import { getProducts, type GiftProduct } from "@/services/products";

export function useGiftProducts() {
  const { locale } = useLocale();
  const [products, setProducts] = useState<GiftProduct[]>(FALLBACK_GIFT_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await getProducts(locale);
        const next = [...(response.data.products || [])].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        );
        if (!ignore && next.length > 0) {
          setProducts(next);
        }
      } catch {
        if (!ignore) {
          setProducts(FALLBACK_GIFT_PRODUCTS);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [locale]);

  return { products, loading };
}
