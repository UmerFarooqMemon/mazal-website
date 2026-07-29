"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import { WALLET_ACTION_GRADIENT } from "./theme";

interface WalletBenefitsCardProps {
  income: number;
  spending: number;
  incomeShare: number;
  spendingShare: number;
}

export default function WalletBenefitsCard({
  income,
  spending,
  incomeShare,
  spendingShare,
}: WalletBenefitsCardProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  return (
    <div
      className="rounded-[20px] border p-5"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h3
        className="text-[17px] font-semibold mb-4"
        style={{ color: getColor("primaryText") }}
      >
        {t("wallet.benefits_title")}
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="rounded-2xl border p-3"
          style={{ borderColor: getColor("border") }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="size-7 rounded-lg bg-[#EAF8F0] text-[#1E7A54] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: getColor("mutedText") }}
            >
              {t("wallet.income")}
            </span>
          </div>
          <p
            className="text-[19px] font-semibold"
            style={{ color: getColor("primaryText") }}
          >
            <DirhamAmount amount={income} decimals={2} weight="semibold" />
          </p>
        </div>

        <div
          className="rounded-2xl border p-3"
          style={{ borderColor: getColor("border") }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="size-7 rounded-lg bg-[#FDECEC] text-[#D14343] flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: getColor("mutedText") }}
            >
              {t("wallet.spending")}
            </span>
          </div>
          <p
            className="text-[19px] font-semibold"
            style={{ color: getColor("primaryText") }}
          >
            <DirhamAmount amount={spending} decimals={2} weight="semibold" />
          </p>
        </div>
      </div>

      <div className="h-2 rounded-full overflow-hidden bg-[#EDF1EF]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${incomeShare}%`,
            background: WALLET_ACTION_GRADIENT,
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: getColor("mutedText") }}>
          {t("wallet.income_share")} {incomeShare}%
        </span>
        <span className="text-xs" style={{ color: getColor("mutedText") }}>
          {t("wallet.spending_share")} {spendingShare}%
        </span>
      </div>
    </div>
  );
}
