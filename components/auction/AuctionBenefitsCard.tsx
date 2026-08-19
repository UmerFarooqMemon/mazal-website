"use client";

import { Shield, Lock, LineChart, FileCheck, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import { formatAuctionPlatformExample } from "@/lib/auction-platform-settings";

export default function AuctionBenefitsCard() {
  const { t } = useLocale();
  const { getColor, auctionPlatformSettings } = useTheme();
  const example = formatAuctionPlatformExample(auctionPlatformSettings);

  const bullets = [
    { key: "benefit_1", icon: Shield },
    { key: "benefit_2", icon: Lock },
    { key: "benefit_3", icon: LineChart },
    { key: "benefit_4", icon: FileCheck },
  ];

  const capacityExample = t("auctions.benefit_capacity_example")
    .replace("{hold}", example.holdAmount.toLocaleString())
    .replace("{limit}", example.maxLimit.toLocaleString())
    .replace("{multiplier}", String(example.multiplier));

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 border"
      style={{
        backgroundColor: `${getColor("accent")}14`,
        borderColor: `${getColor("accent")}66`,
      }}
    >
      <div
        className="flex items-center gap-2 font-medium mb-4"
        style={{ color: getColor("primaryText") }}
      >
        <Sparkles
          className="w-4 h-4 shrink-0"
          strokeWidth={2}
          style={{ color: getColor("accent") }}
        />
        <span className="text-sm">{t("auctions.why_auctions")}</span>
      </div>

      <div
        className="rounded-xl border px-4 py-3 mb-4 text-sm"
        style={{
          borderColor: getColor("border"),
          backgroundColor: getColor("surface"),
          color: getColor("primaryText"),
        }}
      >
        <p className="font-medium">{capacityExample}</p>
        <p className="text-xs mt-1.5" style={{ color: getColor("mutedText") }}>
          {t("auctions.benefit_min_deposit").replace(
            "{amount}",
            auctionPlatformSettings.minDeposit.toLocaleString(),
          )}
        </p>
        <p className="text-xs mt-1" style={{ color: getColor("mutedText") }}>
          {t("auctions.benefit_default_limit")}{" "}
          <DirhamAmount
            amount={auctionPlatformSettings.defaultMaxBiddingLimit}
            decimals={0}
          />
        </p>
      </div>

      <ul className="space-y-3 text-sm" style={{ color: getColor("secondaryText") }}>
        {bullets.map((bullet) => {
          const Icon = bullet.icon;
          return (
            <li key={bullet.key} className="flex items-start gap-2.5">
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
