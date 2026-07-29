"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import WalletMethodOption from "@/components/wallet/WalletMethodOption";
import WalletPaymentModal from "@/components/wallet/WalletPaymentModal";

interface RevealPaymentMethodStepProps {
  selected: "card" | "wallet";
  amountDue?: number;
  onSelect: (method: "card" | "wallet") => void;
  onBack: () => void;
  onContinue: () => void;
  onWalletPaid: () => void;
  loading?: boolean;
}

export default function RevealPaymentMethodStep({
  selected,
  amountDue = 0,
  onSelect,
  onBack,
  onContinue,
  onWalletPaid,
  loading = false,
}: RevealPaymentMethodStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-9 md:p-[37px]"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className={`mb-6 text-start`}>
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

      <div className="space-y-3 mb-8">
        <WalletMethodOption
          selected={selected === "wallet"}
          onSelect={() => {
            onSelect("wallet");
            setWalletOpen(true);
          }}
        />

        <button
          type="button"
          onClick={() => onSelect("card")}
          className={`w-full flex items-center gap-4 rounded-2xl border px-4 py-4 text-start`}
          style={
            selected === "card"
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
            style={{
              borderColor:
                selected === "card" ? getColor("primary") : getColor("border"),
            }}
          >
            {selected === "card" && (
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getColor("primary") }}
              />
            )}
          </span>
        </button>
      </div>

      <div
        className={`flex items-center justify-between border-t pt-6`}
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
          onClick={() => {
            if (selected === "wallet") {
              setWalletOpen(true);
              return;
            }
            onContinue();
          }}
          loading={loading}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("listings.continue")}
        </Button>
      </div>

      <WalletPaymentModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        amountDue={amountDue}
        reference={t("listings.reveal_payment_title")}
        onPaid={onWalletPaid}
      />
    </div>
  );
}
