"use client";

import { Wallet } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import { useWallet } from "@/hooks/useWallet";

interface WalletMethodOptionProps {
  selected: boolean;
  onSelect: () => void;
}

/** Wallet entry rendered inside the deposit / payment method lists. Styled to
 *  match the surrounding method tiles so the lists stay visually consistent. */
export default function WalletMethodOption({
  selected,
  onSelect,
}: WalletMethodOptionProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const { balance } = useWallet();

  return (
    <button
      type="button"
      onClick={onSelect}
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
        <Wallet className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium" style={{ color: getColor("primaryText") }}>
          {t("wallet.method_wallet")}
        </div>
        <div className="text-sm" style={{ color: getColor("mutedText") }}>
          {t("wallet.available_balance")}{" "}
          <DirhamAmount amount={balance} decimals={2} />
        </div>
      </div>
      <div
        className="size-5 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{
          borderColor: selected ? getColor("primary") : getColor("border"),
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
}
