"use client";

import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";

interface PaymentSuccessStepProps {
  onDone?: () => void;
}

export default function PaymentSuccessStep({ onDone }: PaymentSuccessStepProps) {
  const { t } = useLocale();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-[22px] border border-[#d9dee6] shadow-[0_27px_54px_rgba(1,15,81,0.18)] px-8 py-14 text-center">
        <div className="text-6xl mb-5" aria-hidden>
          🎉
        </div>
        <h2 className="font-serif text-[28px] md:text-[34px] text-[#081123] tracking-tight mb-6">
          {t("private-deal.payment_success_title")}
        </h2>
        <Button
          variant="primary"
          size="lg"
          onClick={onDone}
          className="rounded-xl bg-[#4CAF50] hover:bg-[#43a047] px-8 mb-4"
          style={{ backgroundImage: "none", backgroundColor: "#4CAF50" }}
        >
          {t("private-deal.payment_confirmed")}
        </Button>
        <p className="text-sm text-[#545e6f]">
          {t("private-deal.payment_secured")}
        </p>
      </div>
    </div>
  );
}
