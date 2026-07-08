"use client";
import { useLocale } from "@/context/LocaleContext";

export default function Stepper() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  const steps = [
    t("private-deal.stepper_1"),
    t("private-deal.stepper_2"),
    t("private-deal.stepper_3"),
    t("private-deal.stepper_4"),
    t("private-deal.stepper_5"),
  ];

  return (
    <div
      className={`flex flex-wrap items-center gap-2 md:gap-4 mb-12 overflow-x-auto pb-2 ${isRTL ? "flex-row-reverse" : ""}`}
    >
      {steps.map((step, index) => (
        <div
          key={step}
          className={`flex items-center gap-2 md:gap-3 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {/* Step Number Circle */}
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
              index === 0
                ? "bg-[#0A3B9E] text-white"
                : "bg-white border border-gray-200 text-gray-400"
            }`}
          >
            {index + 1}
          </div>

          {/* Step Label */}
          <span
            className={`text-xs font-semibold ${index === 0 ? "text-[#0A3B9E]" : "text-gray-400"}`}
          >
            {step}
          </span>

          {/* Connector Line */}
          {index < 4 && (
            <div className="w-4 h-px bg-gray-200 hidden md:block"></div>
          )}
        </div>
      ))}
    </div>
  );
}
