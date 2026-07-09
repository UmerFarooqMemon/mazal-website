"use client";
import { useLocale } from "@/context/LocaleContext";
import { Shield, Lock, Handshake, CreditCard, Star } from "lucide-react";

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
    <div className="bg-[#FFF9F0] border border-[#D4AF37]/30 rounded-2xl p-6">
      {/* Title */}
      <div
        className={`flex items-center gap-2 text-[#041443] font-semibold mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <Star
          className="w-4.5 h-4.5 text-[#D4AF37] shrink-0"
          strokeWidth={2.5}
        />
        <span className="text-sm">{t("private-deal.why_escrow")}</span>
      </div>

      {/* Benefits List */}
      <ul className="space-y-3 text-sm text-gray-600">
        {bullets.map((bullet) => {
          const Icon = bullet.icon;
          return (
            <li
              key={bullet.key}
              className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <Icon
                className="w-4.5 h-4.5 text-[#0A3B9E] mt-0.5 shrink-0"
                strokeWidth={2}
              />
              <span className={isRTL ? "text-right" : "text-left"}>
                {t(`private-deal.${bullet.key}`)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
