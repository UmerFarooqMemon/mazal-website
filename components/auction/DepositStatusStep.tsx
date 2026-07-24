"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import type { DepositPaymentMethod } from "./types";

interface DepositStatusStepProps {
  method: DepositPaymentMethod;
  variant?: "awaiting" | "success";
}

export default function DepositStatusStep({
  method,
  variant,
}: DepositStatusStepProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  const isAwaiting =
    variant === "awaiting" ||
    (variant == null && (method === "managers_check" || method === "cash"));

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="rounded-[22px] border shadow-[0_27px_54px_rgba(0,0,0,0.12)] px-8 py-14 text-center"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div className="text-6xl mb-5" aria-hidden>
          🎉
        </div>

        <h2
          className="font-serif text-[28px] md:text-[34px] tracking-tight mb-4"
          style={{ color: getColor("primaryText") }}
        >
          {isAwaiting
            ? t("auctions.awaiting_collection_title")
            : t("auctions.success_title")}
        </h2>

        <p
          className="text-[14px] sm:text-[15px] leading-relaxed max-w-lg mx-auto"
          style={{ color: getColor("secondaryText") }}
        >
          {isAwaiting
            ? t("auctions.awaiting_collection_desc")
            : t("auctions.success_desc")}
        </p>
      </div>
    </div>
  );
}
