"use client";
import { useLocale } from "@/context/LocaleContext";

export default function EscrowBenefits() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  const bullets = [
    { key: "bullet_1", icon: "shield" },
    { key: "bullet_2", icon: "lock" },
    { key: "bullet_3", icon: "camera" },
    { key: "bullet_4", icon: "card" },
  ];

  return (
    <div className="bg-[#FFF9F0] border border-[#D4AF37]/30 rounded-2xl p-6">
      {/* Title */}
      <div
        className={`flex items-center gap-2 text-[#041443] font-semibold mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span className="text-sm">{t("private-deal.why_escrow")}</span>
      </div>

      {/* Benefits List */}
      <ul className="space-y-3 text-sm text-gray-600">
        {bullets.map((bullet) => (
          <li
            key={bullet.key}
            className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0A3B9E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className={isRTL ? "text-right" : "text-left"}>
              {t(`private-deal.${bullet.key}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
