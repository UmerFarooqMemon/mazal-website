"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { BackButton } from "@/components/ui";
import PortfolioAddPlateForm from "@/components/portfolio/PortfolioAddPlateForm";

export default function PortfolioAddPlatePage() {
  const { t, locale } = useLocale();
  const { getColor, loading } = useTheme();

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
        <BackButton href={`/${locale}/portfolio`} className="mb-8" size="sm">
          {t("portfolio.back_to_collection")}
        </BackButton>

        <PortfolioAddPlateForm />
      </div>
    </div>
  );
}
