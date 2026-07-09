"use client";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";

export default function SearchBar() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div
      className={`w-full bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
    >
      {/* Search Icon and Input Container */}
      <div
        className={`grow flex items-center gap-3 px-3 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {/* Search Icon */}
        <svg
          className="w-5 h-5 text-gray-400 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        {/* Search Input */}
        <input
          type="text"
          placeholder={t("marketplace.search_placeholder")}
          className={`w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 ${isRTL ? "text-right" : "text-left"}`}
        />
      </div>

      {/* ✅ Search Button - Now using the Button component */}
      <Button
        variant="primary"
        size="md"
        className={`px-6 py-2.5 rounded-lg flex items-center gap-2 justify-center whitespace-nowrap shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {/* Button Icon */}
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        {/* Button Text */}
        <span>{t("marketplace.search_button")}</span>
      </Button>
    </div>
  );
}
