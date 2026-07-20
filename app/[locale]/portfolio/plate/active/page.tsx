"use client";

import { useLocale } from "@/context/LocaleContext";
import PortfolioDetailView from "@/components/portfolio/PortfolioDetailView";
import { figmaActivePlate } from "@/components/portfolio/data";

/** Figma screen 3 — Live auction + marketplace status */
export default function PortfolioPlateActivePage() {
  const { locale } = useLocale();

  return (
    <PortfolioDetailView
      plate={figmaActivePlate}
      mode="active"
      backHref={`/${locale}/portfolio`}
    />
  );
}
