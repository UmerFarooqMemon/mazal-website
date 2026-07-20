"use client";

import { useLocale } from "@/context/LocaleContext";
import PortfolioDetailView from "@/components/portfolio/PortfolioDetailView";
import { figmaListPlate } from "@/components/portfolio/data";

/** Figma screen 2 — List this plate */
export default function PortfolioPlateListPage() {
  const { locale } = useLocale();

  return (
    <PortfolioDetailView
      plate={figmaListPlate}
      mode="list"
      backHref={`/${locale}/portfolio`}
    />
  );
}
