"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PortfolioPlateHero, {
  PortfolioDetailsCard,
  PortfolioValuationCard,
} from "@/components/portfolio/PortfolioPlateHero";
import PortfolioListingOptions from "@/components/portfolio/PortfolioListingOptions";
import PortfolioActiveStatus from "@/components/portfolio/PortfolioActiveStatus";
import type { PortfolioPlate } from "@/components/portfolio/data";

export type PortfolioDetailMode = "list" | "active";

interface PortfolioDetailViewProps {
  plate: PortfolioPlate;
  mode: PortfolioDetailMode;
  backHref: string;
}

export default function PortfolioDetailView({
  plate,
  mode,
  backHref,
}: PortfolioDetailViewProps) {
  const { locale } = useLocale();
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
      <div className="mx-auto max-w-[1050px] px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="space-y-6">
          <PortfolioPlateHero plate={plate} backHref={backHref} />

          <div className="grid grid-cols-1 lg:grid-cols-[1.58fr_1fr] gap-4 items-start">
            <div className="space-y-4">
              <PortfolioValuationCard
                certificateHref={`/${locale}/certificates/request`}
              />
              <PortfolioDetailsCard addedDate={plate.addedDate} />
            </div>

            {mode === "list" ? (
              <PortfolioListingOptions />
            ) : (
              <PortfolioActiveStatus plate={plate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
