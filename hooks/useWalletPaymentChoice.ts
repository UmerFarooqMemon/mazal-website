"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useWallet } from "@/hooks/useWallet";

export function walletCoversAmount(available: number, amountDue: number) {
  return Math.round(available * 100) >= Math.round(amountDue * 100);
}

/** Shared wallet-method gate: hide at 0, redirect if short, confirm if enough. */
export function useWalletPaymentChoice(amountDue: number) {
  const { availableBalance } = useWallet();
  const { locale } = useLocale();
  const router = useRouter();

  const showWallet = availableBalance > 0;
  const coversAmount = walletCoversAmount(availableBalance, amountDue);

  const goToWallet = () => {
    router.push(`/${locale}/wallet`);
  };

  const selectWalletOrRedirect = (onSufficient: () => void) => {
    if (!coversAmount) {
      goToWallet();
      return;
    }
    onSufficient();
  };

  return {
    availableBalance,
    showWallet,
    coversAmount,
    goToWallet,
    selectWalletOrRedirect,
  };
}
