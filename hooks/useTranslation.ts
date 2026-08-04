import { useLocale } from "@/context/LocaleContext";

/**
 * App UI copy helper.
 * Prefer `t("namespace.key")` for labels, buttons, placeholders, etc.
 * Values come from GET /api/v1/ui-labels (cached); static JSON is the fallback.
 */
export function useTranslation() {
  const { t, locale, setLocale, loading, labelsReady } = useLocale();
  return { t, locale, setLocale, loading, labelsReady };
}
