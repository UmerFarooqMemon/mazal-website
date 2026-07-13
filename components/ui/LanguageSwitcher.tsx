"use client";
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
    router.replace(newPathname);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative flex items-center h-8 px-0.5 rounded-full border transition-all duration-200"
      style={{
        backgroundColor: getColor("primaryLight"),
        borderColor: getColor("border"),
      }}
      aria-label="Switch language"
    >
      {/* EN Option */}
      <span
        className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all duration-200"
        style={{
          backgroundColor:
            locale === "en" ? getColor("surface") : "transparent",
          color: locale === "en" ? getColor("primary") : getColor("mutedText"),
          boxShadow:
            locale === "en" ? `0 1px 3px ${getColor("primary")}20` : "none",
        }}
      >
        EN
      </span>

      {/* AR Option */}
      <span
        className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all duration-200"
        style={{
          backgroundColor:
            locale === "ar" ? getColor("surface") : "transparent",
          color: locale === "ar" ? getColor("primary") : getColor("mutedText"),
          boxShadow:
            locale === "ar" ? `0 1px 3px ${getColor("primary")}20` : "none",
        }}
      >
        ع
      </span>
    </button>
  );
}
