"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PortfolioAddPlateForm from "@/components/portfolio/PortfolioAddPlateForm";

export default function PortfolioAddPlatePage() {
  const { t, locale } = useLocale();
  const { getColor, loading } = useTheme();
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
        <Link
          href={`/${locale}/portfolio`}
          className={`mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
            color: getColor("primaryText"),
          }}
        >
          <ArrowLeft className={`size-3.5 ${isRTL ? "rotate-180" : ""}`} />
          {t("portfolio.back_to_collection")}
        </Link>

        <PortfolioAddPlateForm />
      </div>
    </div>
  );
}
