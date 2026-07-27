"use client";

import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import type { DepositPaymentMethod } from "./types";

interface DepositMethodStepProps {
  method: DepositPaymentMethod;
  onMethodChange: (method: DepositPaymentMethod) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function DepositMethodStep({
  method,
  onMethodChange,
  onBack,
  onContinue,
}: DepositMethodStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const selected = method === "card";

  return (
    <div
      className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.18)] p-6 md:p-8"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className="mb-6">
        <h2
          className="text-2xl font-serif mb-1"
          style={{ color: getColor("primaryText") }}
        >
          {t("auctions.deposit_method_title")}
        </h2>
        <p className="text-sm" style={{ color: getColor("secondaryText") }}>
          {t("auctions.paytabs_method_subtitle") ||
            "Auction deposits are paid securely online via PayTabs card checkout."}
        </p>
      </div>

      <div className="space-y-3 mb-8">
        <button
          type="button"
          onClick={() => onMethodChange("card")}
          className="w-full flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all text-start"
          style={
            selected
              ? {
                  borderColor: getColor("primary"),
                  backgroundColor: `${getColor("primary")}0D`,
                }
              : {
                  borderColor: getColor("border"),
                  backgroundColor: getColor("surface"),
                }
          }
        >
          <div
            className="size-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${getColor("primary")}1A`,
              color: getColor("primary"),
            }}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-medium"
              style={{ color: getColor("primaryText") }}
            >
              {t("auctions.method_card")}
            </div>
            <div className="text-sm" style={{ color: getColor("mutedText") }}>
              {t("auctions.secure_online")}
            </div>
          </div>
          <div
            className="size-5 rounded-full border-2 flex items-center justify-center shrink-0"
            style={{ borderColor: getColor("primary") }}
          >
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: getColor("primary") }}
            />
          </div>
        </button>
      </div>

      <div
        className="flex items-center justify-between border-t pt-6"
        style={{ borderColor: getColor("border") }}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
        >
          {t("auctions.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("auctions.continue")}
        </Button>
      </div>
    </div>
  );
}
