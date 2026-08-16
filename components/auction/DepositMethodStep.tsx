"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  FileCheck,
  Banknote,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import WalletMethodOption from "@/components/wallet/WalletMethodOption";
import { useWalletPaymentChoice } from "@/hooks/useWalletPaymentChoice";
import type { DepositPaymentMethod } from "./types";

interface DepositMethodStepProps {
  method: DepositPaymentMethod;
  onMethodChange: (method: DepositPaymentMethod) => void;
  onBack: () => void;
  onContinue: () => void;
  amountDue?: number;
  /** Opens the full wallet module when the Wallet option is chosen. */
  onOpenWallet?: () => void;
  onWalletClick?: () => void;
  submitting?: boolean;
}

const METHODS: {
  key: Exclude<DepositPaymentMethod, "wallet">;
  titleKey: string;
  icon: typeof Building2;
}[] = [
  { key: "bank", titleKey: "method_bank", icon: Building2 },
  { key: "card", titleKey: "method_card", icon: CreditCard },
  { key: "managers_check", titleKey: "method_managers_check", icon: FileCheck },
  { key: "cash", titleKey: "method_cash", icon: Banknote },
];

export default function DepositMethodStep({
  method,
  onMethodChange,
  onBack,
  onContinue,
  amountDue = 0,
  onOpenWallet,
  onWalletClick,
  submitting = false,
}: DepositMethodStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const walletChoice = useWalletPaymentChoice(amountDue);
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

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
          {t("auctions.deposit_method_subtitle")}
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {walletChoice.showWallet ? (
          <WalletMethodOption
            selected={method === "wallet"}
            onSelect={() => {
              onMethodChange("wallet");
              walletChoice.selectWalletOrRedirect(() => {
                onWalletClick?.();
              });
            }}
          />
        ) : null}

        {METHODS.map((item) => {
          const selected = method === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onMethodChange(item.key)}
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
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-medium"
                  style={{ color: getColor("primaryText") }}
                >
                  {t(`auctions.${item.titleKey}`)}
                </div>
                <div className="text-sm" style={{ color: getColor("mutedText") }}>
                  {t("auctions.secure_online")}
                </div>
              </div>
              <div
                className="size-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: selected
                    ? getColor("primary")
                    : getColor("border"),
                }}
              >
                {selected && (
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: getColor("primary") }}
                  />
                )}
              </div>
            </button>
          );
        })}
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
          disabled={submitting}
        >
          {t("auctions.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
          disabled={submitting}
        >
          {t("auctions.continue")}
        </Button>
      </div>
    </div>
  );
}
