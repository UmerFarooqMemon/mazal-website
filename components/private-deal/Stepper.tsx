"use client";

import { Check } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export type StepStatus = "completed" | "current" | "upcoming";

export interface StepItem {
  key: string;
  label: string;
  status: StepStatus;
}

interface StepperProps {
  steps: StepItem[];
}

export default function Stepper({ steps }: StepperProps) {
  const { locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  return (
    <div
      className={`flex flex-wrap gap-3 w-full pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
    >
      {steps.map((step) => {
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";

        return (
          <div
            key={step.key}
            className="flex-1 min-w-[140px] rounded-[14px] border p-3.5"
            style={
              isCompleted
                ? {
                    backgroundColor: `${getColor("accent")}14`,
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
                      color: isCurrent
                        ? "#fff"
                        : getColor("secondaryText"),
                    }}
                  >
                    {steps.findIndex((s) => s.key === step.key) + 1}
                  </span>
                )}
              </div>
              <span
                className="text-[12px] md:text-[13px] font-medium tracking-[0.06em] uppercase"
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
  );
}
