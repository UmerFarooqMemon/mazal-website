"use client";

import { Shield, Lock, Handshake, CreditCard, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export default function EscrowBenefits() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const bullets = [
    { key: "bullet_1", icon: Shield },
    { key: "bullet_2", icon: Lock },
    { key: "bullet_3", icon: Handshake },
    { key: "bullet_4", icon: CreditCard },
  ];

  return (
    <div
      className="rounded-2xl p-6 border"
      style={{
        backgroundColor: `${getColor("accent")}0D`,
        borderColor: `${getColor("accent")}66`,
      }}
    >
      <div
        className={`flex items-center gap-2 font-medium mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ color: getColor("primaryText") }}
      >
        <Sparkles
          className="w-4 h-4 shrink-0"
          strokeWidth={2}
          style={{ color: getColor("accent") }}
        />
        <span className="text-sm">{t("private-deal.why_escrow")}</span>
      </div>

      <ul
        className="space-y-2.5 text-sm"
        style={{ color: getColor("secondaryText") }}
      >
        {bullets.map((bullet) => {
          const Icon = bullet.icon;
          return (
            <li
              key={bullet.key}
              className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}
            >
              <Icon
                className="w-4 h-4 mt-0.5 shrink-0"
                strokeWidth={2}
                style={{ color: getColor("primary") }}
              />
              <span>{t(`private-deal.${bullet.key}`)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
