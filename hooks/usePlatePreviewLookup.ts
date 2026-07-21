"use client";

import { useEffect, useState } from "react";
import {
  buildPlatePreviewLookup,
  resolvePlatePreview,
  type PlatePreviewConfig,
  type PlatePreviewLookup,
} from "@/lib/plate-preview";

export type PlateVariantMeta = {
  key: string;
  has_code?: boolean;
  fields?: string[];
  preview?: PlatePreviewConfig;
};

type OptionsCache = {
  lookup: PlatePreviewLookup;
  variantsByKey: Record<string, PlateVariantMeta>;
};

const cache: Record<string, OptionsCache> = {};
const inflight: Record<string, Promise<OptionsCache>> = {};

function buildOptionsCache(data: {
  emirates?: Array<{ variants?: PlateVariantMeta[] }>;
}): OptionsCache {
  const lookup = buildPlatePreviewLookup(data);
  const variantsByKey: Record<string, PlateVariantMeta> = {};

  for (const emirate of data?.emirates || []) {
    for (const variant of emirate?.variants || []) {
      if (variant?.key) {
        variantsByKey[variant.key] = variant;
      }
    }
  }

  return { lookup, variantsByKey };
}

async function fetchOptionsCache(locale: string): Promise<OptionsCache> {
  const response = await fetch(`/api/number-plates/options?locale=${locale}`);
  const json = await response.json();
  return buildOptionsCache(json?.data || {});
}

export function usePlatePreviewLookup(locale: string) {
  const [state, setState] = useState<OptionsCache | null>(cache[locale] || null);
  const [loading, setLoading] = useState(!cache[locale]);

  useEffect(() => {
    if (cache[locale]) {
      setState(cache[locale]);
      setLoading(false);
      return;
    }

    if (!inflight[locale]) {
      inflight[locale] = fetchOptionsCache(locale).finally(() => {
        delete inflight[locale];
      });
    }

    let active = true;
    inflight[locale]
      .then((result) => {
        cache[locale] = result;
        if (active) {
          setState(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale]);

  return {
    lookup: state?.lookup || null,
    variantsByKey: state?.variantsByKey || {},
    loading,
  };
}

export function resolvePreviewFromLookup(
  lookup: PlatePreviewLookup | null,
  data: {
    preview?: PlatePreviewConfig | null;
    plateVariant?: string;
    plateType?: string;
    plateDesign?: string;
  },
): PlatePreviewConfig | null {
  if (data.preview) return data.preview;
  if (!lookup) return null;

  return resolvePlatePreview(lookup, {
    plateVariant: data.plateVariant,
    plateType: data.plateType,
    plateDesign: data.plateDesign,
  });
}

export function getDefaultPlatePreview(
  lookup: PlatePreviewLookup | null,
): PlatePreviewConfig | null {
  if (!lookup) return null;

  return (
    lookup.byKey.private_new_colorful ||
    lookup.byTypeDesign.private_new_colorful ||
    Object.values(lookup.byKey)[0] ||
    null
  );
}
