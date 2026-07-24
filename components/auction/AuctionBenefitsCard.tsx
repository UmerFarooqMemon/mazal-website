"use client";

import { Shield, Lock, LineChart, FileCheck, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export default function AuctionBenefitsCard() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const bullets = [
    { key: "benefit_1", icon: Shield },
    { key: "benefit_2", icon: Lock },
    { key: "benefit_3", icon: LineChart },
    { key: "benefit_4", icon: FileCheck },
  ];

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 border"
      style={{
        backgroundColor: `${getColor("accent")}14`,
        borderColor: `${getColor("accent")}66`,
      }}
    >
      <div
        className={`flex items-center gap-2 font-medium mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ color: getColor("primaryText") }}
      >
        <Sparkles
          className="w-4 h-4 shrink-0"
          strokeWidth={2}
          style={{ color: getColor("accent") }}
        />
        <span className="text-sm">{t("auctions.why_auctions")}</span>
      </div>

      <ul className="space-y-3 text-sm" style={{ color: getColor("secondaryText") }}>
        {bullets.map((bullet) => {
          const Icon = bullet.icon;
          return (
            <li
              key={bullet.key}
              className={`flex items-start gap-2.5 ${isRTL ? "flex-row-reverse text-right" : ""}`}
            >
              <Icon
                className="w-4 h-4 mt-0.5 shrink-0"
                strokeWidth={2}
                style={{ color: getColor("primary") }}
              />
              <span>{t(`auctions.${bullet.key}`)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
