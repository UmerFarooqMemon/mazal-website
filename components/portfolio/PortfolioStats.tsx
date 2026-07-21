"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import { portfolioStats } from "./data";

export default function PortfolioStats() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const stats = [
    {
      label: t("portfolio.plates"),
      value: String(portfolioStats.plates),
      color: getColor("primaryText"),
    },
    {
      label: t("portfolio.total_est_value"),
      value: <DirhamAmount amount={portfolioStats.totalEstValue} weight="bold" />,
      color: "#0f6646",
    },
    {
      label: t("portfolio.total_gain_loss"),
      value: <DirhamAmount amount={portfolioStats.totalGainLoss} weight="bold" />,
      color: "#2ab520",
    },
    {
      label: t("portfolio.listed"),
      value: String(portfolioStats.listed),
      color: getColor("primaryText"),
    },
    {
      label: t("portfolio.auction"),
      value: String(portfolioStats.auction),
      color: getColor("primaryText"),
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 ${isRTL ? "direction-rtl" : ""}`}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border p-5"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: getColor("mutedText") }}
          >
            {stat.label}
          </p>
          <p
            className="text-2xl font-bold tracking-tight"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
