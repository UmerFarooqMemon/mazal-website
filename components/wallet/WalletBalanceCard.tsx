"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { DirhamAmount } from "@/components/ui";
import { WALLET_BALANCE_GRADIENT } from "./theme";

interface WalletBalanceCardProps {
  balance: number;
  onTopUp: () => void;
  onCashOut: () => void;
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-2xl bg-white/10 hover:bg-white/[0.16] transition-colors py-4 px-3 flex flex-col items-center gap-2"
    >
      <span className="size-8 rounded-full bg-white flex items-center justify-center text-[#1F433A]">
        {icon}
      </span>
      <span className="text-[13px] font-medium text-white/90">{label}</span>
    </button>
  );
}

export default function WalletBalanceCard({
  balance,
  onTopUp,
  onCashOut,
}: WalletBalanceCardProps) {
  const { t } = useLocale();
  const [hidden, setHidden] = useState(false);

  return (
    <div
      className="rounded-[24px] p-6 sm:p-7 shadow-[0_28px_60px_-32px_rgba(9,45,34,0.65)]"
      style={{ background: WALLET_BALANCE_GRADIENT }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
        {t("wallet.available_balance")}
      </p>

      <div className="flex items-center gap-3 mt-2 mb-6">
        <span className="text-[34px] sm:text-[38px] font-semibold leading-none text-white">
          {hidden ? "••••••" : <DirhamAmount amount={balance} decimals={2} weight="semibold" />}
        </span>
        <button
          type="button"
          onClick={() => setHidden((value) => !value)}
          className="text-white/60 hover:text-white transition-colors"
          aria-label={hidden ? t("wallet.show_balance") : t("wallet.hide_balance")}
        >
          {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-stretch gap-3">
        <ActionButton
          icon={<ArrowDownToLine className="w-4 h-4" />}
          label={t("wallet.top_up")}
          onClick={onTopUp}
        />
        <ActionButton
          icon={<ArrowUpFromLine className="w-4 h-4" />}
          label={t("wallet.cash_out")}
          onClick={onCashOut}
        />
      </div>
    </div>
  );
}
