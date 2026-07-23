"use client";
import { Globe } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    setLocale(newLocale);

    const segments = pathname.split("/");
    if (segments.length > 1 && (segments[1] === "en" || segments[1] === "ar")) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPathname = segments.join("/");
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`${newPathname}${search}`);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] font-semibold tracking-wide transition-colors"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
        color: getColor("primary"),
      }}
      aria-label="Switch language"
    >
      <Globe className="w-3.5 h-3.5" strokeWidth={2} />
      <span>{locale === "ar" ? "ع" : "EN"}</span>
    </button>
  );
}
