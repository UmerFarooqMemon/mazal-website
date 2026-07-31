"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount, DirhamSymbolIcon, Input } from "@/components/ui";
import type { WalletHold } from "./types";
import WalletDialog from "./WalletDialog";
import { WALLET_MUTED_SURFACE } from "./theme";

interface ReleaseFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  holds: WalletHold[];
  heldAmount: number;
  onConfirm: (hold: WalletHold, amount: number) => void | Promise<void>;
}

export default function ReleaseFundsModal({
  isOpen,
  onClose,
  holds,
  heldAmount,
  onConfirm,
}: ReleaseFundsModalProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (holds.length === 1) {
      setSelectedId(holds[0].id);
      setAmount(String(holds[0].releasableAmount));
    } else {
      setSelectedId("");
      setAmount("");
    }
    setError("");
  }, [holds, isOpen]);

  const selected = holds.find((hold) => hold.id === selectedId) || null;
  const maxAmount = selected?.releasableAmount ?? heldAmount;

  const handleClose = () => {
    if (submitting) return;
    setAmount("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selected) {
      setError(t("wallet.release_select_hold"));
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > maxAmount) {
      setError(t("wallet.release_invalid_amount"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onConfirm(selected, value);
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

      {holds.length > 1 && (
        <div className="space-y-2 mb-4">
          {holds.map((hold) => {
            const active = hold.id === selectedId;
            return (
              <button
                key={hold.id}
                type="button"
                onClick={() => {
                  setSelectedId(hold.id);
                  setAmount(String(hold.releasableAmount));
                  setError("");
                }}
                className="w-full rounded-2xl border px-4 py-3 text-start"
                style={{
                  borderColor: active ? getColor("primary") : getColor("border"),
                  backgroundColor: active
                    ? `${getColor("primary")}0D`
                    : getColor("surface"),
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: getColor("primaryText") }}
                >
                  {hold.plate || t("wallet.deposited_for_auction")}
                </p>
                <p className="text-xs" style={{ color: getColor("mutedText") }}>
                  <DirhamAmount amount={hold.releasableAmount} decimals={2} />{" "}
                  {t("wallet.releasable")}
                </p>
              </button>
            );
          })}
        </div>
      )}

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
