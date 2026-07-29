"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount, DirhamSymbolIcon, Input } from "@/components/ui";
import WalletDialog from "./WalletDialog";
import { WALLET_MUTED_SURFACE } from "./theme";

interface ReleaseFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldAmount: number;
  onConfirm: (amount: number) => void;
}

export default function ReleaseFundsModal({
  isOpen,
  onClose,
  heldAmount,
  onConfirm,
}: ReleaseFundsModalProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setAmount("");
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > heldAmount) {
      setError(t("wallet.release_invalid_amount"));
      return;
    }

    onConfirm(value);
    handleClose();
  };

  return (
    <WalletDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={t("wallet.release_title")}
      icon={<Wallet className="w-5 h-5" />}
      maxWidth="max-w-[460px]"
    >
      <div
        className="rounded-2xl px-4 py-3.5 mb-5"
        style={{ backgroundColor: WALLET_MUTED_SURFACE }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
          style={{ color: getColor("mutedText") }}
        >
          {t("wallet.total_deposit_amount")}
        </p>
        <p
          className="text-[22px] font-semibold"
          style={{ color: getColor("primaryText") }}
        >
          <DirhamAmount amount={heldAmount} decimals={2} weight="semibold" />
        </p>
      </div>

      <Input
        label={t("wallet.amount")}
        type="number"
        inputMode="decimal"
        min={0}
        max={heldAmount}
        value={amount}
        onChange={(event) => {
          setAmount(event.target.value);
          setError("");
        }}
        placeholder="0.00"
        icon={<DirhamSymbolIcon className="w-3.5 h-3.5" />}
        error={error || undefined}
      />

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-6"
        onClick={handleSubmit}
      >
        {t("wallet.send_request")}
      </Button>
    </WalletDialog>
  );
}
