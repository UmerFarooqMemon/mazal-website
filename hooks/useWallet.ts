"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import {
  getWallet,
  getWalletTransactions,
  getWalletHolds,
  toWalletNumber,
  type WalletBenefits,
  type WalletHold as ApiWalletHold,
  type WalletLedgerTransaction,
  type WalletLimits,
  type WalletPaymentMethodOption,
  type WalletProfitSettings,
  type WalletSummary,
} from "@/services/wallet";
import { WALLET_REFRESH_EVENT } from "@/lib/auction-notification-actions";
import type { WalletHold, WalletTransaction } from "@/components/wallet/types";

function mapHold(hold: ApiWalletHold): WalletHold {
  return {
    id: `${hold.source}-${hold.source_id}`,
    sourceId: hold.source_id,
    listingId: hold.listing_id,
    amount: toWalletNumber(hold.releasable_amount),
    releasableAmount: toWalletNumber(hold.releasable_amount),
    totalDepositAmount: toWalletNumber(hold.total_deposit_amount),
    releasedAmount: toWalletNumber(hold.released_amount),
    plate: hold.plate,
    createdAt: hold.deposit_held_at,
  };
}

function mapTransaction(tx: WalletLedgerTransaction): WalletTransaction {
  return {
    id: tx.id,
    kind: tx.type,
    reference: tx.description_short || tx.description || tx.type_label || tx.type,
    amount: Math.abs(toWalletNumber(tx.amount)),
    signedAmount: toWalletNumber(tx.signed_amount),
    createdAt: tx.created_at || new Date().toISOString(),
    note: tx.description_detailed || undefined,
    direction: tx.direction,
  };
}

export function useWallet() {
  const { locale } = useLocale();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [summaryRes, txRes, holdsRes] = await Promise.all([
        getWallet(locale),
        getWalletTransactions(locale, 20, 1),
        getWalletHolds(locale).catch(() => null),
      ]);
      const holds = holdsRes?.data?.holds;
      setSummary({
        ...summaryRes.data,
        holds: holds?.length ? holds : summaryRes.data.holds,
      });
      setTransactions((txRes.data.transactions || []).map(mapTransaction));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet.");
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onRefresh = () => {
      void refresh();
    };
    window.addEventListener(WALLET_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(WALLET_REFRESH_EVENT, onRefresh);
  }, [refresh]);

  const holds = useMemo(
    () => (summary?.holds || []).map(mapHold),
    [summary?.holds],
  );

  const heldAmount = useMemo(
    () =>
      holds.reduce((sum, hold) => sum + hold.releasableAmount, 0) ||
      toWalletNumber(summary?.wallet.held_balance),
    [holds, summary?.wallet.held_balance],
  );

  const income = toWalletNumber(summary?.benefits?.income?.total);
  const spending = toWalletNumber(summary?.benefits?.spending?.total);
  const movement = income + spending;
  const incomeShare =
    movement > 0 ? Math.round((income / movement) * 100) : 0;

  const availableBalance = toWalletNumber(summary?.wallet.available_balance);
  const balance = availableBalance;

  return {
    loading,
    error,
    refresh,
    summary,
    wallet: summary?.wallet ?? null,
    balance,
    availableBalance,
    heldBalance: toWalletNumber(summary?.wallet.held_balance),
    currency: summary?.wallet.currency || "AED",
    heldAmount,
    holds,
    transactions,
    income,
    spending,
    incomeShare,
    spendingShare: movement > 0 ? 100 - incomeShare : 0,
    benefits: (summary?.benefits ?? null) as WalletBenefits | null,
    limits: (summary?.limits ?? null) as WalletLimits | null,
    paymentMethods: (summary?.payment_methods ??
      []) as WalletPaymentMethodOption[],
    profit: (summary?.profit ?? null) as WalletProfitSettings | null,
  };
}
