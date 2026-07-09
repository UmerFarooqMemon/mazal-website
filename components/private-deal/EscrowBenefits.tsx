"use client";
import { useLocale } from "@/context/LocaleContext";

export default function EscrowBenefits() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  // Exact SVG icons from the image
  const getIcon = (type: string) => {
    switch (type) {
      case "shield":
        return (
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
        );
      case "lock":
        return (
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
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case "handshake":
        return (
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
            <path d="M22 17c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h4l2-3h6l2 3h4c1.1 0 2 .9 2 2v8z" />
            <path d="M12 7v6" />
            <path d="M8 10v2" />
            <path d="M16 10v2" />
            <path d="M10 15v2" />
            <path d="M14 15v2" />
          </svg>
        );
      case "card":
        return (
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
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 8h20" />
          </svg>
        );
      default:
        return null;
    }
  };

  const bullets = [
    { key: "bullet_1", icon: "shield" },
    { key: "bullet_2", icon: "lock" },
    { key: "bullet_3", icon: "handshake" },
    { key: "bullet_4", icon: "card" },
  ];

  return (
    <div className="bg-[#FFF9F0] border border-[#D4AF37]/30 rounded-2xl p-6">
      {/* Title - Reversed order for RTL */}
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
            {/* Exact icon from the image */}
            {getIcon(bullet.icon)}
            <span className={isRTL ? "text-right" : "text-left"}>
              {t(`private-deal.${bullet.key}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
