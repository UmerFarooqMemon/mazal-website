"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";

interface PaymentSuccessStepProps {
  onDone?: () => void;
}

export default function PaymentSuccessStep({ onDone }: PaymentSuccessStepProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className="rounded-[22px] border shadow-[0_27px_54px_rgba(1,15,81,0.18)] px-8 py-14 text-center"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div className="text-6xl mb-5" aria-hidden>
          🎉
        </div>
        <h2
          className="font-serif text-[28px] md:text-[34px] tracking-tight mb-6"
          style={{ color: getColor("primaryText") }}
        >
          {t("private-deal.payment_success_title")}
        </h2>
        <Button
          variant="primary"
          size="lg"
          onClick={onDone}
          className="rounded-xl px-8 mb-4"
          style={{
            backgroundImage: "none",
            backgroundColor: getColor("success"),
          }}
        >
          {t("private-deal.payment_confirmed")}
        </Button>
        <p className="text-sm" style={{ color: getColor("secondaryText") }}>
          {t("private-deal.payment_secured")}
        </p>
      </div>
    </div>
  );
}
