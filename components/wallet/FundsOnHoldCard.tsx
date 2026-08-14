"use client";

import { TrendingUp } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import type { WalletHold } from "./types";

interface FundsOnHoldCardProps {
  holds: WalletHold[];
  heldAmount: number;
  onRequestRelease: () => void;
}

/** Deposits cover 20% of the bidding limit they unlock. */
const HOLD_RATIO = 0.2;

export default function FundsOnHoldCard({
  holds,
  heldAmount,
  onRequestRelease,
}: FundsOnHoldCardProps) {
  const { t } = useLocale();
  const { getColor, getGradient } = useTheme();

  const biddingLimit = heldAmount / HOLD_RATIO;

  return (
    <div
      className="rounded-[20px] border p-5"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="size-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
          <TrendingUp className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold leading-tight"
            style={{ color: getColor("primaryText") }}
          >
            {t("wallet.funds_on_hold")}
          </p>
          <p className="text-xs" style={{ color: getColor("secondaryText") }}>
            {t("wallet.deposited_for_auction")}
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestRelease}
          disabled={heldAmount <= 0}
          className="rounded-full px-3.5 py-1.5 text-[11px] font-medium text-white shrink-0 transition-opacity disabled:opacity-40"
          style={{ background: getGradient("primaryButton") }}
        >
          {t("wallet.request_release_deposit")}
        </button>
      </div>

      <p
        className="text-[22px] font-semibold"
        style={{ color: getColor("primaryText") }}
      >
        <DirhamAmount amount={heldAmount} decimals={2} weight="semibold" />
      </p>
      <p className="text-xs mb-3.5" style={{ color: getColor("mutedText") }}>
        {t("wallet.hold_of")} <DirhamAmount amount={biddingLimit} decimals={2} />{" "}
        {t("wallet.hold_total_suffix")}
      </p>

      <div className="h-2 rounded-full overflow-hidden bg-[var(--color-primary-light)]">
        <div
          className="h-full rounded-full"
          style={{
            width: heldAmount > 0 ? "100%" : "0%",
            background: getGradient("primaryButton"),
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 mb-4">
        <span className="text-[11px]" style={{ color: getColor("mutedText") }}>
          {t("wallet.bidding_limit_note")}
        </span>
        <span className="text-[11px]" style={{ color: getColor("mutedText") }}>
          100%
        </span>
      </div>

      {holds.length === 0 ? (
        <p className="text-xs" style={{ color: getColor("mutedText") }}>
          {t("wallet.no_funds_on_hold")}
        </p>
      ) : (
        <div className="space-y-2.5">
          {holds.map((hold) => (
            <div
              key={hold.id}
              className="rounded-2xl border px-4 py-3 flex items-center gap-3"
              style={{ borderColor: getColor("border") }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: getColor("mutedText") }}
                >
                  {hold.plate || t("wallet.deposited_for_auction")}
                </p>
                <p
                  className="text-[17px] font-semibold"
                  style={{ color: getColor("primaryText") }}
                >
                  <DirhamAmount
                    amount={hold.releasableAmount}
                    decimals={2}
                    weight="semibold"
                  />
                </p>
              </div>
              <span
                className="text-[11px] shrink-0"
                style={{ color: getColor("mutedText") }}
              >
                {t("wallet.releasable")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
