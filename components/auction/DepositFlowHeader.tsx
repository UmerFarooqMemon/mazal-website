"use client";

import { Check, Shield } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import type { StepItem } from "@/components/private-deal/Stepper";

interface DepositFlowHeaderProps {
  steps: StepItem[];
}

export default function DepositFlowHeader({ steps }: DepositFlowHeaderProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{
          backgroundColor: getColor("primaryLight"),
          color: getColor("primary"),
        }}
      >
        <Shield className="w-3.5 h-3.5" />
        <span>{t("auctions.verified_badge")}</span>
      </div>

      <h1
        className={`font-serif text-[28px] sm:text-[36px] md:text-[42px] leading-[1.15] tracking-tight mb-3 max-w-3xl ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("primaryText") }}
      >
        {t("auctions.deposit_title")}
      </h1>

      <p
        className={`text-[14px] sm:text-[15px] leading-relaxed max-w-2xl mb-6 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("auctions.deposit_subtitle")}
      </p>

      <div
        className={`flex flex-wrap gap-3 w-full ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {steps.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <div
              key={step.key}
              className="flex-1 min-w-[140px] rounded-[14px] border p-3.5"
              style={
                isCompleted
                  ? {
                      backgroundColor: `${getColor("accent")}18`,
                      borderColor: `${getColor("accent")}99`,
                    }
                  : isCurrent
                    ? {
                        backgroundColor: getColor("primaryLight"),
                        borderColor: `${getColor("primary")}40`,
                      }
                    : {
                        backgroundColor: getColor("surface"),
                        borderColor: getColor("border"),
                      }
              }
            >
              <div
                className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div
                  className="flex items-center justify-center size-[23px] rounded-full shrink-0"
                  style={{
                    backgroundColor: isCompleted
                      ? getColor("accent")
                      : isCurrent
                        ? getColor("primary")
                        : getColor("primaryLight"),
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  ) : (
                    <span
                      className="text-[11px] font-semibold"
                      style={{
                        color: isCurrent ? "#fff" : getColor("secondaryText"),
                      }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
                <span
                  className="text-[11px] md:text-[12px] font-medium tracking-[0.06em] uppercase"
                  style={{
                    color: isCurrent
                      ? getColor("primary")
                      : isCompleted
                        ? getColor("primaryText")
                        : getColor("secondaryText"),
                  }}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
