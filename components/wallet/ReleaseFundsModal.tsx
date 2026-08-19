"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount, DirhamSymbolIcon, Input } from "@/components/ui";
import WalletDialog from "./WalletDialog";

interface ReleaseFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldAmount: number;
  releasableAmount: number;
  onConfirm: (amount: number, note?: string) => void | Promise<void>;
}

export default function ReleaseFundsModal({
  isOpen,
  onClose,
  heldAmount,
  releasableAmount,
  onConfirm,
}: ReleaseFundsModalProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maxAmount = releasableAmount > 0 ? releasableAmount : heldAmount;

  useEffect(() => {
    if (!isOpen) return;
    setAmount(String(maxAmount));
    setNote("");
    setError("");
  }, [isOpen, maxAmount]);

  const handleClose = () => {
    if (submitting) return;
    setAmount("");
    setNote("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > maxAmount) {
      setError(t("wallet.release_invalid_amount"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onConfirm(value, note.trim() || undefined);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("wallet.release_failed"));
    } finally {
      setSubmitting(false);
    }
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
        style={{ backgroundColor: getColor("primaryLight") }}
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

      <p className="text-xs mb-4" style={{ color: getColor("secondaryText") }}>
        {t("wallet.release_admin_note")}
      </p>

      <Input
        label={t("wallet.amount")}
        type="number"
        inputMode="decimal"
        min={0}
        max={maxAmount}
        value={amount}
        onChange={(event) => {
          setAmount(event.target.value);
          setError("");
        }}
        placeholder="0.00"
        icon={<DirhamSymbolIcon size={14} />}
        error={error || undefined}
      />

      <div className="mt-4">
        <Input
          label={t("wallet.release_note_optional")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("wallet.release_note_placeholder")}
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-6"
        disabled={submitting}
        onClick={() => void handleSubmit()}
      >
        {submitting ? t("wallet.processing") : t("wallet.send_request")}
      </Button>
    </WalletDialog>
  );
}
