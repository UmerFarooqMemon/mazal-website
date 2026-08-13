"use client";
import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import {
  LOCALES,
  LOCALE_META,
  isLocale,
  type Locale,
} from "@/lib/locale";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const switchTo = (newLocale: Locale) => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }

    setLocale(newLocale);

    const segments = pathname.split("/");
    if (segments.length > 1 && isLocale(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    const search = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`${segments.join("/")}${search}`);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] font-semibold tracking-wide transition-colors"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
          color: getColor("primary"),
        }}
        aria-label="Switch language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-3.5 h-3.5" strokeWidth={2} />
        <span>{LOCALE_META[locale].short}</span>
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute top-[calc(100%+6px)] end-0 z-50 min-w-[10rem] overflow-hidden rounded-xl border py-1 shadow-lg"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
        >
          {LOCALES.map((code) => {
            const selected = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => switchTo(code)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-[12px] transition-colors ${
                  selected ? "font-semibold" : "font-medium"
                }`}
                style={{
                  color: getColor("primaryText"),
                }}
              >
                <span>{LOCALE_META[code].nativeLabel}</span>
                <span
                  className="text-[11px] font-semibold tracking-wide"
                  style={{ color: getColor("primary") }}
                >
                  {LOCALE_META[code].short}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
