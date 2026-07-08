import { useLocale } from "@/context/LocaleContext";

export function useTranslation() {
  const { t, locale, setLocale } = useLocale();
  return { t, locale, setLocale };
}
