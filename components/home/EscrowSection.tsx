"use client";
import Link from "next/link";
import { useLocale } from "../../context/LocaleContext";

export default function EscrowSection() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  const steps = [
    {
      number: "01",
      titleKey: "home.escrow_step_1_title",
      descKey: "home.escrow_step_1_desc",
    },
    {
      number: "02",
      titleKey: "home.escrow_step_2_title",
      descKey: "home.escrow_step_2_desc",
    },
    {
      number: "03",
      titleKey: "home.escrow_step_3_title",
      descKey: "home.escrow_step_3_desc",
    },
    {
      number: "04",
      titleKey: "home.escrow_step_4_title",
      descKey: "home.escrow_step_4_desc",
    },
  ];

  return (
    <section className="bg-[#041443] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div
            className={`flex flex-col justify-center ${
              isRTL
                ? "lg:order-2 text-right items-end"
                : "lg:order-1 text-left items-start"
            }`}
          >
            {/* Badge (badge) */}
            <div
              className={`inline-flex items-center gap-2 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-6 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {t("home.escrow_badge")}
            </div>

            {/* The main title */}
            <h2 className="text-5xl md:text-6xl font-serif leading-[1.1] mb-6">
              {t("home.escrow_title_1")}
              <br />
              {t("home.escrow_title_2")}
              <br />
              {t("home.escrow_title_3")}
            </h2>

            {/* Subtext */}
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-10 max-w-md">
              {t("home.escrow_subtitle")}
            </p>

            {/* The Golden Button */}
            <div>
              <Link
                href={`/${locale}/about`}
                className={`inline-flex items-center gap-3 bg-[#D4AF37] text-[#041443] px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#c5a031] transition shadow-lg shadow-[#D4AF37]/20 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {t("home.escrow_button")}
                {/* Arrow direction according to language */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${isRTL ? "rotate-180" : ""}`}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div
            className={`flex flex-col gap-4 justify-center ${
              isRTL ? "lg:order-1" : "lg:order-2"
            }`}
          >
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-row items-start gap-6 hover:bg-white/10 transition-colors group"
              >
                {/* Step number (always on the left) */}
                <div className="text-3xl font-serif font-bold text-[#D4AF37] min-w-15 shrink-0">
                  {step.number}
                </div>

                {/* Step text (always starts from the north) */}
                <div className="flex flex-col gap-1 text-left">
                  <h4 className="text-white font-semibold text-base">
                    {t(step.titleKey)}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
