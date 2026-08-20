"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useSupportChat } from "@/context/SupportChatContext";
import { DirhamAmount } from "@/components/ui";
import { formatWalletStatusLabel } from "@/lib/wallet-display";
import { WALLET_REFRESH_EVENT } from "@/lib/auction-notification-actions";
import {
  cancelWalletCashOut,
  getWalletCashOuts,
  toWalletNumber,
  type WalletCashOut,
} from "@/services/wallet";

interface CashOutRequestsCardProps {
  onChanged?: () => void;
}

export default function CashOutRequestsCard({
  onChanged,
}: CashOutRequestsCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const { startConversation } = useSupportChat();
  const [cashOuts, setCashOuts] = useState<WalletCashOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadCashOuts = useCallback(async () => {
    try {
      const response = await getWalletCashOuts(locale);
      setCashOuts(response.data.cash_outs || []);
    } catch {
      setCashOuts([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void loadCashOuts();
  }, [loadCashOuts]);

  useEffect(() => {
    const refresh = () => void loadCashOuts();
    window.addEventListener(WALLET_REFRESH_EVENT, refresh);
    return () => window.removeEventListener(WALLET_REFRESH_EVENT, refresh);
  }, [loadCashOuts]);

  const handleCancel = async (cashOut: WalletCashOut) => {
    setCancellingId(cashOut.id);
    try {
      await cancelWalletCashOut(cashOut.id, locale);
      toast.success(t("wallet.cash_out_cancelled"));
      await loadCashOuts();
      onChanged?.();
      window.dispatchEvent(new Event(WALLET_REFRESH_EVENT));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("wallet.cash_out_cancel_failed"),
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading || cashOuts.length === 0) return null;

  return (
    <div
      className="rounded-[20px] border p-5"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <p className="font-semibold mb-1" style={{ color: getColor("primaryText") }}>
        {t("wallet.cash_out_requests_title")}
      </p>
      <p className="text-xs mb-3" style={{ color: getColor("mutedText") }}>
        {t("wallet.cash_out_pending_note")}
      </p>
      <div className="space-y-2">
        {cashOuts.map((cashOut) => {
          const statusKey = String(cashOut.status || "").toLowerCase();
          const isPending =
            statusKey.includes("pending") || statusKey.includes("process");
          const canCancel = cashOut.actions?.can_cancel === true;
          const statusLabel = formatWalletStatusLabel(
            cashOut.status,
            cashOut.status_label,
            t,
            "cash_out_status",
          );

          return (
            <div
              key={cashOut.id}
              className="rounded-xl border px-4 py-3 flex items-center justify-between gap-3"
              style={{ borderColor: getColor("border") }}
            >
              <div className="min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: getColor("primaryText") }}
                >
                  <DirhamAmount
                    amount={toWalletNumber(cashOut.amount)}
                    decimals={2}
                  />
                </p>
                <p className="text-xs" style={{ color: getColor("mutedText") }}>
                  {statusLabel}
                  {cashOut.bank_name ? ` · ${cashOut.bank_name}` : ""}
                </p>
                {cashOut.rejection_reason && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: getColor("error") }}
                  >
                    {cashOut.rejection_reason}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {cashOut.created_at && (
                  <span
                    className="text-[10px]"
                    style={{ color: getColor("mutedText") }}
                  >
                    {new Date(cashOut.created_at).toLocaleDateString(locale)}
                  </span>
                )}
                {canCancel && (
                  <button
                    type="button"
                    disabled={cancellingId === cashOut.id}
                    className="text-[11px] font-medium underline underline-offset-2 disabled:opacity-50"
                    style={{ color: getColor("error") }}
                    onClick={() => void handleCancel(cashOut)}
                  >
                    {cancellingId === cashOut.id
                      ? t("wallet.processing")
                      : t("wallet.cash_out_cancel")}
                  </button>
                )}
                {isPending && !canCancel && (
                  <button
                    type="button"
                    className="text-[11px] font-medium underline underline-offset-2"
                    style={{ color: getColor("primary") }}
                    onClick={() =>
                      void startConversation({
                        subject: t("support.cash_out_context_subject"),
                        body: `${t("wallet.cash_out_requests_title")} #${cashOut.id}`,
                        context_type: "wallet_cash_out",
                        context_id: cashOut.id,
                      })
                    }
                  >
                    {t("support.contact_support")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
