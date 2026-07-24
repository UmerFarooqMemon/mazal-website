"use client";

import { Gavel } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

interface AuctionPageHeroProps {
  centered?: boolean;
  className?: string;
}

export default function AuctionPageHero({
  centered = true,
  className = "",
}: AuctionPageHeroProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  return (
    <div
      className={`w-full ${centered ? "text-center" : isRTL ? "text-right" : "text-left"} ${className}`}
    >
      <div
        className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] mb-3 ${centered ? "justify-center" : ""}`}
        style={{ color: getColor("mutedText") }}
      >
        <Gavel className="w-3.5 h-3.5" strokeWidth={2.2} />
        <span>{t("auctions.calendar_badge")}</span>
      </div>

      <h1
        className="font-serif text-[36px] sm:text-[44px] md:text-[52px] leading-[1.1] tracking-tight mb-4"
        style={{ color: getColor("primaryText") }}
      >
        {t("auctions.title")}
      </h1>

      <p
        className={`text-[14px] sm:text-[15px] leading-relaxed ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("auctions.subtitle")}
      </p>
    </div>
  );
}
