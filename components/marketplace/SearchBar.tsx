"use client";
import { Search, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";

export default function SearchBar() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  return (
    <div
      className={`w-full border rounded-full h-[62px] px-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className={`grow flex items-center gap-3 px-3 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <Search
          className="w-4 h-4 shrink-0"
          strokeWidth={2}
          style={{ color: getColor("mutedText") }}
        />
        <input
          type="text"
          placeholder={t("marketplace.search_placeholder")}
          className={`w-full bg-transparent outline-none text-sm placeholder:opacity-60 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("primaryText") }}
        />
      </div>

      <Button
        variant="primary"
        size="md"
        className={`!rounded-full px-5 h-10 flex items-center gap-2 justify-center whitespace-nowrap shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={2.5} />
        <span>{t("marketplace.search_button")}</span>
      </Button>
    </div>
  );
}
