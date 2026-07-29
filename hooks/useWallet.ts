"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  cashOutWallet,
  getWalletServerSnapshot,
  getWalletSnapshot,
  holdWalletFunds,
  payFromWallet,
  releaseWalletFunds,
  subscribeToWallet,
  topUpWallet,
} from "@/lib/wallet-store";

export function useWallet() {
  const state = useSyncExternalStore(
    subscribeToWallet,
    getWalletSnapshot,
    getWalletServerSnapshot,
  );

  const heldAmount = useMemo(
    () => state.holds.reduce((sum, hold) => sum + hold.amount, 0),
    [state.holds],
  );

  const movement = state.income + state.spending;
  const incomeShare = movement > 0 ? Math.round((state.income / movement) * 100) : 0;

  return {
    ...state,
    heldAmount,
    totalValue: state.balance + heldAmount,
    incomeShare,
    spendingShare: movement > 0 ? 100 - incomeShare : 0,
    topUp: topUpWallet,
    cashOut: cashOutWallet,
    holdFunds: holdWalletFunds,
    releaseFunds: releaseWalletFunds,
    pay: payFromWallet,
  };
}
