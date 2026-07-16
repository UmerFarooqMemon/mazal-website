"use client";

import { Shield, Lock, Handshake, CreditCard, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function EscrowBenefits() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  const bullets = [
    { key: "bullet_1", icon: Shield },
    { key: "bullet_2", icon: Lock },
    { key: "bullet_3", icon: Handshake },
    { key: "bullet_4", icon: CreditCard },
  ];

  return (
    <div className="bg-[rgba(224,174,87,0.05)] border border-[rgba(224,174,87,0.4)] rounded-2xl p-6">
      <div
        className={`flex items-center gap-2 text-[#081123] font-medium mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <Sparkles className="w-4 h-4 text-[#e0ae57] shrink-0" strokeWidth={2} />
        <span className="text-sm">{t("private-deal.why_escrow")}</span>
      </div>

      <ul className="space-y-2.5 text-sm text-[#545e6f]">
        {bullets.map((bullet) => {
          const Icon = bullet.icon;
          return (
            <li
              key={bullet.key}
              className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}
            >
              <Icon
                className="w-4 h-4 text-[#0a2f94] mt-0.5 shrink-0"
                strokeWidth={2}
              />
              <span>{t(`private-deal.${bullet.key}`)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
