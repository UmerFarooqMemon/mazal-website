"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { Locale, loadAllTranslations } from "../config/translations";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale === "ar" ? "ar" : "en",
  );
  const router = useRouter();
  const pathname = usePathname();

  // Update both state and URL
  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);

      // Update URL to match new locale
      const currentLocale = pathname.split("/")[1];
      if (currentLocale !== newLocale) {
        const newPathname = pathname.replace(
          `/${currentLocale}`,
          `/${newLocale}`,
        );
        router.replace(newPathname);
      }
    },
    [pathname, router],
  );

  const translations = loadAllTranslations(locale);

  const t = (path: string): string => {
    if (!translations || Object.keys(translations).length === 0) return path;

    const keys = path.split(".");
    let value: any = translations;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return path;
      }
    }
    return typeof value === "string" ? value : path;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
