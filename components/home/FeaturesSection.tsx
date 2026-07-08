"use client";
import { useLocale } from "@/context/LocaleContext";

export default function FeaturesSection() {
  const { t, locale } = useLocale();
  // Determine layout direction based on current locale
  const isRTL = locale === "ar";

  const features = [
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0A3B9E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      titleKey: "home.feature_1_title",
      descKey: "home.feature_1_desc",
    },
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0A3B9E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m14.5 9.5-7-7A2 2 0 0 0 4.1 3.9l7 7" />
          <path d="M14 15l-2 6-4.5-4.5" />
          <path d="M18.5 13.5l-4.5-4.5" />
        </svg>
      ),
      titleKey: "home.feature_2_title",
      descKey: "home.feature_2_desc",
    },
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0A3B9E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 8h20" />
        </svg>
      ),
      titleKey: "home.feature_3_title",
      descKey: "home.feature_3_desc",
    },
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0A3B9E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      titleKey: "home.feature_4_title",
      descKey: "home.feature_4_desc",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 ${isRTL ? "direction-rtl" : ""}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex flex-col items-center text-center gap-3`}
          >
            {/* Icon Centered */}
            <div className="text-[#0A3B9E]">{feature.icon}</div>

            {/* Title Centered */}
            <h3 className="text-lg font-serif font-semibold text-[#041443]">
              {t(feature.titleKey)}
            </h3>

            {/* Description Centered */}
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              {t(feature.descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
