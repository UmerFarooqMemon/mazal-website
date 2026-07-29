"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, Wallet } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount } from "@/components/ui";
import { useWallet } from "@/hooks/useWallet";
import WalletDialog from "./WalletDialog";
import { WALLET_MUTED_SURFACE } from "./theme";

interface WalletPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountDue: number;
  /** Rendered under the amount, e.g. the auction or plate the payment covers. */
  reference?: string;
  /** When set the paid amount is kept on hold instead of being spent outright. */
  holdFor?: string;
  onPaid: () => void;
}

export default function WalletPaymentModal({
  isOpen,
  onClose,
  amountDue,
  reference,
  holdFor,
  onPaid,
}: WalletPaymentModalProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const { balance, pay, holdFunds } = useWallet();

  const sufficient = balance >= amountDue && amountDue > 0;

  const handlePay = () => {
    if (!sufficient) return;
    if (holdFor) {
      holdFunds(amountDue, holdFor);
    } else {
      pay(amountDue, reference);
    }
    onPaid();
    onClose();
  };

  return (
    <WalletDialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("wallet.method_wallet")}
      icon={<Wallet className="w-5 h-5" />}
      maxWidth="max-w-[460px]"
    >
      <div
        className="rounded-2xl px-4 py-3.5 mb-3"
        style={{ backgroundColor: WALLET_MUTED_SURFACE }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
          style={{ color: getColor("mutedText") }}
        >
          {t("wallet.available_balance")}
        </p>
        <p
          className="text-[22px] font-semibold"
          style={{ color: getColor("primaryText") }}
        >
          <DirhamAmount amount={balance} decimals={2} weight="semibold" />
        </p>
      </div>

      <div
        className="rounded-2xl border px-4 py-3.5 mb-5"
        style={{ borderColor: getColor("border") }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
          style={{ color: getColor("mutedText") }}
        >
          {t("wallet.amount_due")}
        </p>
        <p
          className="text-[22px] font-semibold"
          style={{ color: getColor("primaryText") }}
        >
          <DirhamAmount amount={amountDue} decimals={2} weight="semibold" />
        </p>
        {reference && (
          <p className="text-xs mt-0.5" style={{ color: getColor("mutedText") }}>
            {reference}
          </p>
        )}
      </div>

      {!sufficient && amountDue > 0 && (
        <p className="text-xs mb-4" style={{ color: getColor("error") }}>
          {t("wallet.insufficient_balance")}
        </p>
      )}

      <div className="space-y-2.5">
        {sufficient ? (
          <Button variant="primary" size="lg" fullWidth onClick={handlePay}>
            {t("wallet.pay_from_wallet")}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push(`/${locale}/wallet/top-up`)}
          >
            {t("wallet.top_up")}
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          fullWidth
          rightIcon={<ArrowUpRight className="w-4 h-4" />}
          onClick={() => router.push(`/${locale}/wallet`)}
        >
          {t("wallet.open_wallet")}
        </Button>
      </div>
    </WalletDialog>
  );
}
