"use client";

import { Check } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

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
            className={`flex-1 min-w-[140px] rounded-[14px] border p-3.5 ${
              isCompleted
                ? "bg-[#f8f5ef] border-[#e0ae57]/60"
                : isCurrent
                  ? "bg-[#f3f5fa] border-[#0a2f94]/25"
                  : "bg-white border-[#d9dee6]"
            }`}
          >
            <div
              className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex items-center justify-center size-[23px] rounded-full shrink-0 ${
                  isCompleted
                    ? "bg-[#e0ae57]"
                    : isCurrent
                      ? "bg-[#0a2f94]"
                      : "bg-[#eaeff7]"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                ) : (
                  <span
                    className={`text-[11px] font-semibold ${
                      isCurrent ? "text-white" : "text-[#545e6f]"
                    }`}
                  >
                    {steps.findIndex((s) => s.key === step.key) + 1}
                  </span>
                )}
              </div>
              <span
                className={`text-[12px] md:text-[13px] font-medium tracking-[0.06em] uppercase ${
                  isCurrent
                    ? "text-[#0a2f94]"
                    : isCompleted
                      ? "text-[#081123]"
                      : "text-[#545e6f]"
                }`}
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
