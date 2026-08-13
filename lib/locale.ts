export const LOCALES = ["en", "ar", "zh", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const RTL_LOCALES = ["ar"] as const;

export const LOCALE_META: Record<
  Locale,
  { short: string; nativeLabel: string; htmlLang: string }
> = {
  en: { short: "EN", nativeLabel: "English", htmlLang: "en" },
  ar: { short: "ع", nativeLabel: "العربية", htmlLang: "ar" },
  zh: { short: "中", nativeLabel: "中文", htmlLang: "zh" },
  ru: { short: "RU", nativeLabel: "Русский", htmlLang: "ru" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

/**
 * Normalize locale / Accept-Language to the API contract:
 * `en` | `ar` | `zh` | `ru`.
 */
export function normalizeLocale(locale?: string | null): Locale {
  if (!locale) return DEFAULT_LOCALE;

  const primary = locale.split(",")[0]?.trim().split("-")[0]?.toLowerCase();

  if (primary === "zh" || primary === "cn") return "zh";
  if (primary === "ru") return "ru";
  if (primary === "ar") return "ar";
  if (primary === "en") return "en";
  return DEFAULT_LOCALE;
}

export function isRtlLocale(locale: string): boolean {
  return locale === "ar";
}

export function getLocaleDir(locale: string): "rtl" | "ltr" {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}
