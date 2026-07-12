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
      className="relative flex items-center h-8 px-0.5 rounded-full bg-gray-100 border border-gray-200 transition-all duration-200 hover:border-[#0A3B9E]/30 hover:bg-gray-50"
      aria-label="Switch language"
    >
      {/* EN Option */}
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all duration-200
          ${
            locale === "en"
              ? "bg-white text-[#0A3B9E] shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
      >
        EN
      </span>

      {/* AR Option */}
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all duration-200
          ${
            locale === "ar"
              ? "bg-white text-[#0A3B9E] shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
      >
        ع
      </span>
    </button>
  );
}
