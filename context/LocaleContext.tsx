"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Locale, loadAllTranslations } from "../config/translations";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
  loading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

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

  // Set loading to false after first render (translations are synchronous)
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, loading }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
