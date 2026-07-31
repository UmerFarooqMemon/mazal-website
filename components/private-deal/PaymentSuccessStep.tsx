"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import GiftNoPaymentBanner from "@/components/private-deal/GiftNoPaymentBanner";

interface PaymentSuccessStepProps {
  onDone?: () => void;
  /** Gift deals skip payment and land in custody-funded / awaiting transfer. */
  variant?: "payment" | "gift";
}

export default function PaymentSuccessStep({
  onDone,
  variant = "payment",
}: PaymentSuccessStepProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const isGift = variant === "gift";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {isGift && <GiftNoPaymentBanner />}

      <div
        className="rounded-[22px] border shadow-[0_27px_54px_rgba(1,15,81,0.18)] px-8 py-14 text-center"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div className="text-6xl mb-5" aria-hidden>
          {isGift ? "🎁" : "🎉"}
        </div>
        <h2
          className="font-serif text-[28px] md:text-[34px] tracking-tight mb-4"
          style={{ color: getColor("primaryText") }}
        >
          {isGift
            ? t("private-deal.gift_custody_title")
            : t("private-deal.payment_success_title")}
        </h2>
        {isGift && (
          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-6"
            style={{ color: getColor("secondaryText") }}
          >
            {t("private-deal.gift_custody_desc")}
          </p>
        )}
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
          {isGift
            ? t("private-deal.gift_custody_cta")
            : t("private-deal.payment_confirmed")}
        </Button>
        <p className="text-sm" style={{ color: getColor("secondaryText") }}>
          {isGift
            ? t("private-deal.gift_custody_secured")
            : t("private-deal.payment_secured")}
        </p>
      </div>
    </div>
  );
}
