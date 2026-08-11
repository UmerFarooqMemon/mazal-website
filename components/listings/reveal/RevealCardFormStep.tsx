"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PayTabsManagedForm from "@/components/payments/PayTabsManagedForm";
import { Button } from "@/components/ui";
import { usePayTabsConfig } from "@/hooks/usePayTabsConfig";

interface RevealCardFormStepProps {
  onBack: () => void;
  onPay: (paymentToken: string) => void | Promise<void>;
  onHostedFallback: () => void | Promise<void>;
  loading?: boolean;
}

export default function RevealCardFormStep({
  onBack,
  onPay,
  onHostedFallback,
  loading = false,
}: RevealCardFormStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const paytabs = usePayTabsConfig(locale);
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div
      className="rounded-2xl border shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-9 md:p-[37px]"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h2
        className="text-2xl font-serif font-bold mb-2 text-start"
        style={{ color: getColor("primaryText") }}
      >
        {t("listings.reveal_card_form_title")}
      </h2>
      <p
        className="text-sm mb-6 leading-relaxed text-start"
        style={{ color: getColor("secondaryText") }}
      >
        {t("listings.reveal_card_payment_desc") ||
          "Secure online payment."}
      </p>

      {paytabs.loading ? (
        <p className="text-sm mb-6" style={{ color: getColor("mutedText") }}>
          {t("listings.loading_payment_form") ||
            "Loading secure payment form…"}
        </p>
      ) : paytabs.managedFormEnabled && paytabs.clientKey ? (
        <PayTabsManagedForm
          clientKey={paytabs.clientKey}
          submitLabel={t("listings.confirm_reveal_payment") || t("listings.proceed")}
          loading={loading}
          onToken={onPay}
        />
      ) : (
        <div className="space-y-4 mb-2">
          <p
            className="text-sm leading-relaxed text-start"
            style={{ color: getColor("secondaryText") }}
          >
            {t("listings.paytabs_hint") ||
              "You will be redirected to PayTabs to complete payment securely."}
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => void onHostedFallback()}
            loading={loading}
          >
            {t("listings.pay_with_paytabs") || "Pay with PayTabs"}
          </Button>
        </div>
      )}

      <div
        className="flex items-center justify-between border-t mt-8 pt-5"
        style={{ borderColor: getColor("border") }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
          disabled={loading}
        >
          {t("listings.back")}
        </Button>
      </div>
    </div>
  );
}
