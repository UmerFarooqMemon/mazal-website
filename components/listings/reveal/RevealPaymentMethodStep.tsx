"use client";

import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";

interface RevealPaymentMethodStepProps {
  selected: "card";
  onBack: () => void;
  onContinue: () => void;
  loading?: boolean;
}

export default function RevealPaymentMethodStep({
  onBack,
  onContinue,
  loading = false,
}: RevealPaymentMethodStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div
      className="rounded-2xl border shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-6 md:p-8"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
        <h2
          className="text-2xl font-serif font-bold mb-1"
          style={{ color: getColor("primaryText") }}
        >
          {t("listings.reveal_payment_title")}
        </h2>
        <p className="text-sm" style={{ color: getColor("secondaryText") }}>
          {t("listings.reveal_payment_subtitle")}
        </p>
      </div>

      <button
        type="button"
        className={`w-full flex items-center gap-4 rounded-2xl border px-4 py-4 mb-8 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
        style={{
          borderColor: getColor("primary"),
          backgroundColor: `${getColor("primary")}0D`,
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${getColor("primary")}18` }}
        >
          <CreditCard
            className="w-5 h-5"
            style={{ color: getColor("primary") }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold"
            style={{ color: getColor("primaryText") }}
          >
            {t("listings.reveal_card_payment")}
          </p>
          <p className="text-xs mt-0.5" style={{ color: getColor("mutedText") }}>
            {t("listings.reveal_card_payment_desc")}
          </p>
        </div>
        <span
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{ borderColor: getColor("primary") }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: getColor("primary") }}
          />
        </span>
      </button>

      <div
        className={`flex items-center justify-between border-t pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ borderColor: getColor("border") }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
        >
          {t("listings.back")}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          loading={loading}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("listings.continue")}
        </Button>
      </div>
    </div>
  );
}
