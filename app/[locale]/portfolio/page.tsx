"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PortfolioStats from "@/components/portfolio/PortfolioStats";
import PortfolioPlateCard from "@/components/portfolio/PortfolioPlateCard";
import { portfolioPlates } from "@/components/portfolio/data";

export default function PortfolioPage() {
  const { t, locale } = useLocale();
  const { getColor, getGradient, loading } = useTheme();
  const isRTL = locale === "ar";

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div
          className={`mb-5 flex justify-end ${isRTL ? "justify-start" : ""}`}
        >
          <Link
            href={`/${locale}/portfolio/add`}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-95 ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ background: getGradient("primaryButton") }}
          >
            <Plus className="size-4" />
            {t("portfolio.add_plate")}
          </Link>
        </div>

        <div className="space-y-5">
          <PortfolioStats />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {portfolioPlates.map((plate) => (
              <PortfolioPlateCard key={plate.id} plate={plate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
