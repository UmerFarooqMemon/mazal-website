"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount, DirhamSymbolIcon, Input } from "@/components/ui";
import BankSelect from "@/components/ui/BankSelect";
import { formatPriceInput } from "@/lib/card-input";
import { resolveBankLabel } from "@/lib/uae-banks";
import WalletDialog from "./WalletDialog";
import { WALLET_MUTED_SURFACE } from "./theme";

export interface CashOutFormPayload {
  amount: number;
  bank_name: string;
  account_holder_name: string;
  iban: string;
  account_number?: string;
}

interface CashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  minAmount?: number;
  maxAmount?: number;
  onConfirm: (payload: CashOutFormPayload) => void | Promise<void>;
}

export default function CashOutModal({
  isOpen,
  onClose,
  balance,
  minAmount = 100,
  maxAmount,
  onConfirm,
}: CashOutModalProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  const [amount, setAmount] = useState("");
  const [bankKey, setBankKey] = useState("");
  const [otherBank, setOtherBank] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [iban, setIban] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ceiling = maxAmount != null ? Math.min(balance, maxAmount) : balance;

  const reset = () => {
    setAmount("");
    setBankKey("");
    setOtherBank("");
    setBeneficiary("");
    setIban("");
    setAccountNumber("");
    setError("");
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const digits = amount.replace(/\D/g, "");
    const value = digits ? Number(digits) : NaN;
    if (
      !Number.isFinite(value) ||
      value < minAmount ||
      value > ceiling
    ) {
      setError(t("wallet.cash_out_invalid_amount"));
      return;
    }
    if (!bankKey || !beneficiary.trim() || !iban.trim()) {
      setError(t("wallet.cash_out_missing_bank"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onConfirm({
        amount: value,
        bank_name: resolveBankLabel(bankKey, otherBank),
        account_holder_name: beneficiary.trim(),
        iban: iban.replace(/\s/g, ""),
        account_number: accountNumber.trim() || undefined,
      });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("wallet.cash_out_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WalletDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={t("wallet.cash_out_title")}
      icon={<Banknote className="w-5 h-5" />}
    >
      <div
        className="rounded-2xl px-4 py-3.5 mb-5"
        style={{ backgroundColor: WALLET_MUTED_SURFACE }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
          style={{ color: getColor("mutedText") }}
        >
          {t("wallet.wallet_balance")}
        </p>
        <p
          className="text-[22px] font-semibold"
          style={{ color: getColor("primaryText") }}
        >
          <DirhamAmount amount={balance} decimals={2} weight="semibold" />
        </p>
      </div>

      <div className="mb-5">
        <Input
          label={t("wallet.amount")}
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(event) => {
            setAmount(formatPriceInput(event.target.value));
            setError("");
          }}
          placeholder="0"
          icon={<DirhamSymbolIcon size={14} />}
        />
      </div>

      <p
        className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3"
        style={{ color: getColor("mutedText") }}
      >
        {t("wallet.bank_details")}
      </p>

      <div className="space-y-3.5">
        <BankSelect
          label={t("wallet.select_bank")}
          value={bankKey}
          otherValue={otherBank}
          onChange={(key) => {
            setBankKey(key);
            setError("");
          }}
          onOtherChange={setOtherBank}
        />
        <Input
          label={t("wallet.beneficiary_name")}
          value={beneficiary}
          onChange={(event) => {
            setBeneficiary(event.target.value);
            setError("");
          }}
        />
        <Input
          label={t("wallet.iban")}
          value={iban}
          onChange={(event) => {
            setIban(event.target.value.toUpperCase());
            setError("");
          }}
          placeholder="AE00 0000 0000 0000 0000 000"
        />
        <Input
          label={t("wallet.account_number")}
          value={accountNumber}
          onChange={(event) => setAccountNumber(event.target.value)}
        />
      </div>

      {error && (
        <p className="text-xs mt-4" style={{ color: getColor("error") }}>
          {error}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-6"
        disabled={submitting}
        onClick={() => void handleSubmit()}
      >
        {submitting ? t("wallet.processing") : t("wallet.cash_out_cta")}
      </Button>
    </WalletDialog>
  );
}
