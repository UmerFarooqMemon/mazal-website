"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount, DirhamSymbolIcon, Input } from "@/components/ui";
import BankSelect from "@/components/ui/BankSelect";
import { resolveBankLabel } from "@/lib/uae-banks";
import WalletDialog from "./WalletDialog";
import { WALLET_MUTED_SURFACE } from "./theme";

interface CashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onConfirm: (amount: number, bankLabel: string) => void;
}

export default function CashOutModal({
  isOpen,
  onClose,
  balance,
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

  const reset = () => {
    setAmount("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > balance) {
      setError(t("wallet.cash_out_invalid_amount"));
      return;
    }
    if (!bankKey || !beneficiary.trim() || !iban.trim()) {
      setError(t("wallet.cash_out_missing_bank"));
      return;
    }

    onConfirm(value, resolveBankLabel(bankKey, otherBank));
    reset();
    onClose();
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
          type="number"
          inputMode="decimal"
          min={0}
          max={balance}
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setError("");
          }}
          placeholder="0.00"
          icon={<DirhamSymbolIcon className="w-3.5 h-3.5" />}
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
        onClick={handleSubmit}
      >
        {t("wallet.cash_out_cta")}
      </Button>
    </WalletDialog>
  );
}
