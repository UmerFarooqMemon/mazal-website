import type { Locale } from "@/config/translations";
import { normalizeAcceptLanguage } from "@/lib/api-config";

export type UiLabelsMap = Record<string, string>;

interface UiLabelsApiResponse {
  status?: boolean;
  message?: string;
  data?: {
    locale?: string;
    count?: number;
    labels?: UiLabelsMap;
  };
  error?: string;
}

interface CacheEntry {
  locale: Locale;
  labels: UiLabelsMap;
  fetchedAt: number;
}

/** v2: locale is part of the request URL (fixes en/ar HTTP cache mix-up). */
const CACHE_PREFIX = "mazal_ui_labels_v2_";
/** Client cache TTL — labels are admin-edited infrequently. */
export const UI_LABELS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const memoryCache = new Map<Locale, CacheEntry>();
const inflight = new Map<Locale, Promise<UiLabelsMap>>();

function cacheKey(locale: Locale): string {
  return `${CACHE_PREFIX}${locale}`;
}

function isFresh(entry: CacheEntry | null | undefined): boolean {
  if (!entry?.labels) return false;
  return Date.now() - entry.fetchedAt < UI_LABELS_CACHE_TTL_MS;
}

function readLocalStorage(locale: Locale): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(locale));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed?.labels || typeof parsed.labels !== "object") return null;
    return {
      locale,
      labels: parsed.labels,
      fetchedAt: typeof parsed.fetchedAt === "number" ? parsed.fetchedAt : 0,
    };
  } catch {
    return null;
  }
}

function writeLocalStorage(entry: CacheEntry): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cacheKey(entry.locale), JSON.stringify(entry));
  } catch {
    // Quota / private mode — memory cache still works.
  }
}

/** Sync read for first paint (memory → localStorage). Returns null if miss/stale. */
export function getCachedUiLabelsSync(locale: Locale): UiLabelsMap | null {
  const mem = memoryCache.get(locale);
  if (mem && isFresh(mem)) return mem.labels;

  const stored = readLocalStorage(locale);
  if (stored && isFresh(stored)) {
    memoryCache.set(locale, stored);
    return stored.labels;
  }

  // Stale cache is still useful for instant paint while a refresh runs.
  if (stored && Object.keys(stored.labels).length > 0) {
    memoryCache.set(locale, stored);
    return stored.labels;
  }

  return null;
}

function storeLabels(locale: Locale, labels: UiLabelsMap): void {
  const entry: CacheEntry = {
    locale,
    labels,
    fetchedAt: Date.now(),
  };
  memoryCache.set(locale, entry);
  writeLocalStorage(entry);
}

/**
 * Fetch UI labels for a locale.
 * Cached in memory + localStorage; concurrent callers share one request.
 */
export async function getUiLabels(
  locale: Locale,
  options?: { force?: boolean },
): Promise<UiLabelsMap> {
  const force = options?.force === true;

  if (!force) {
    const mem = memoryCache.get(locale);
    if (mem && isFresh(mem)) return mem.labels;

    const stored = readLocalStorage(locale);
    if (stored && isFresh(stored)) {
      memoryCache.set(locale, stored);
      return stored.labels;
    }
  }

  const existing = inflight.get(locale);
  if (existing && !force) return existing;

  const request = (async () => {
    const response = await fetch(`/api/ui-labels?locale=${locale}`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": normalizeAcceptLanguage(locale),
      },
      cache: "default",
    });

    const payload = (await response.json()) as UiLabelsApiResponse;

    if (!response.ok) {
      throw new Error(
        payload.error ||
          payload.message ||
          `Failed to load UI labels (${response.status})`,
      );
    }

    const labels = payload.data?.labels ?? {};
    const rawResponseLocale = payload.data?.locale;

    // Never apply/cache the wrong language under this locale key.
    if (
      Object.keys(labels).length > 0 &&
      rawResponseLocale &&
      normalizeAcceptLanguage(rawResponseLocale) !== locale
    ) {
      console.warn(
        `UI labels locale mismatch: requested ${locale}, got ${rawResponseLocale}. Keeping static fallback.`,
      );
      return getCachedUiLabelsSync(locale) ?? {};
    }

    storeLabels(locale, labels);
    return labels;
  })();

  inflight.set(locale, request);

  try {
    return await request;
  } finally {
    if (inflight.get(locale) === request) {
      inflight.delete(locale);
    }
  }
}

/** Clear caches (e.g. after admin publishes label changes). */
export function clearUiLabelsCache(locale?: Locale): void {
  if (locale) {
    memoryCache.delete(locale);
    inflight.delete(locale);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(cacheKey(locale));
      } catch {
        /* ignore */
      }
    }
    return;
  }

  memoryCache.clear();
  inflight.clear();
  if (typeof window === "undefined") return;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(CACHE_PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}
