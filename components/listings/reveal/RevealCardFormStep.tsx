"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Input } from "@/components/ui";

export interface RevealCardFormData {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

interface RevealCardFormStepProps {
  data: RevealCardFormData;
  onChange: (patch: Partial<RevealCardFormData>) => void;
  onBack: () => void;
  onProceed: () => void;
  loading?: boolean;
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 • ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export default function RevealCardFormStep({
  data,
  onChange,
  onBack,
  onProceed,
  loading = false,
}: RevealCardFormStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const canProceed =
    data.cardNumber.replace(/\D/g, "").length >= 12 &&
    Boolean(data.cardExpiry.replace(/\D/g, "").length >= 4) &&
    Boolean(data.cardCvc.trim()) &&
    Boolean(data.cardName.trim());

  return (
    <div
      className="rounded-2xl border shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-6 md:p-8"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h2
        className={`text-2xl font-serif font-bold mb-6 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("primaryText") }}
      >
        {t("listings.reveal_card_form_title")}
      </h2>

      <div className="space-y-5">
        <Input
          label={t("listings.card_number")}
          value={data.cardNumber}
          onChange={(e) =>
            onChange({ cardNumber: formatCardNumber(e.target.value) })
          }
          placeholder="2026 • 0000 • 0000 • 0000"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t("listings.expiration_date")}
            value={data.cardExpiry}
            onChange={(e) =>
              onChange({ cardExpiry: formatExpiry(e.target.value) })
            }
            placeholder="MM / YY"
          />
          <Input
            label={t("listings.security_code")}
            value={data.cardCvc}
            onChange={(e) =>
              onChange({
                cardCvc: e.target.value.replace(/\D/g, "").slice(0, 4),
              })
            }
            placeholder="CVC"
          />
        </div>

        <Input
          label={t("listings.cardholder_name")}
          value={data.cardName}
          onChange={(e) => onChange({ cardName: e.target.value })}
          placeholder={t("listings.cardholder_placeholder")}
        />
      </div>

      <div
        className={`flex items-center justify-between border-t mt-8 pt-5 ${isRTL ? "flex-row-reverse" : ""}`}
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
          onClick={onProceed}
          disabled={!canProceed}
          loading={loading}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("listings.proceed")}
        </Button>
      </div>
    </div>
  );
}
