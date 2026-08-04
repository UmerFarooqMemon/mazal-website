"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Locale, loadAllTranslations } from "../config/translations";
import {
  getCachedUiLabelsSync,
  getUiLabels,
  type UiLabelsMap,
} from "@/services/ui-labels";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
  loading: boolean;
  /** True once remote UI labels have been applied (or failed; static fallback remains). */
  labelsReady: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function resolveFromNested(
  translations: Record<string, unknown>,
  path: string,
): string | null {
  if (!translations || Object.keys(translations).length === 0) return null;
  const keys = path.split(".");
  let value: unknown = translations;
  for (const key of keys) {
    if (value && typeof value === "object" && key in (value as object)) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return null;
    }
  }
  return typeof value === "string" ? value : null;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(
    initialLocale === "ar" ? "ar" : "en",
  );
  const [loading, setLoading] = useState(true);
  const [labelsReady, setLabelsReady] = useState(false);
  const [remoteLabels, setRemoteLabels] = useState<UiLabelsMap>(() => {
    // Instant paint from cache when available (avoids waiting on network).
    return getCachedUiLabelsSync(initialLocale === "ar" ? "ar" : "en") ?? {};
  });

  const staticTranslations = loadAllTranslations(locale);

  const t = useCallback(
    (path: string): string => {
      const fromApi = remoteLabels[path];
      if (typeof fromApi === "string" && fromApi.length > 0) {
        return fromApi;
      }

      const fromStatic = resolveFromNested(
        staticTranslations as Record<string, unknown>,
        path,
      );
      return fromStatic ?? path;
    },
    [remoteLabels, staticTranslations],
  );

  // Static translations are sync — don't block UI on the remote labels fetch.
  useEffect(() => {
    setLoading(false);
  }, []);

  // Load / refresh remote UI labels once per locale (cached in service layer).
  useEffect(() => {
    let cancelled = false;

    // Show cached labels immediately when switching locale.
    const cached = getCachedUiLabelsSync(locale);
    if (cached) {
      setRemoteLabels(cached);
    }

    setLabelsReady(false);

    (async () => {
      try {
        const labels = await getUiLabels(locale);
        if (!cancelled) {
          setRemoteLabels(labels);
        }
      } catch (error) {
        console.warn(
          "UI labels API unavailable; using static translations.",
          error,
        );
      } finally {
        if (!cancelled) setLabelsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    const lang = locale === "ar" ? "ar" : "en";

    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
    document.body.setAttribute("dir", dir);
    document.body.setAttribute("lang", lang);
  }, [locale]);

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, t, loading, labelsReady }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
