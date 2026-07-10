"use client";
import { useLocale } from "@/context/LocaleContext";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    setLocale(newLocale);

    // Change the route directly
    const segments = pathname.split("/");
    if (segments.length > 1 && (segments[1] === "en" || segments[1] === "ar")) {
      segments[1] = newLocale;
    } else {
      // If the path does not contain a language (rare)
      segments.splice(1, 0, newLocale);
    }
    const newPathname = segments.join("/");
    router.replace(newPathname);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative flex items-center w-24 h-9 rounded-full bg-gray-100 border border-gray-200 transition-all duration-200 hover:border-[#0A3B9E]/40 hover:bg-gray-50 overflow-hidden"
      aria-label="Switch language"
    >
      <div
        className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-200 ease-out
          ${locale === "en" ? "left-1" : "left-14.5"}`}
      />
      <span className="absolute inset-0 flex items-center justify-between px-3">
        <span
          className={`text-[11px] font-bold transition-colors duration-200
          ${locale === "en" ? "text-[#0A3B9E]" : "text-gray-400"}`}
        >
          EN
        </span>
        <span
          className={`text-[11px] font-bold transition-colors duration-200
          ${locale === "ar" ? "text-[#0A3B9E]" : "text-gray-400"}`}
        >
          AR
        </span>
      </span>
    </button>
  );
}
