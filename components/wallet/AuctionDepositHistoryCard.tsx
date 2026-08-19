"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useOptionalAuctionCapacity } from "@/context/AuctionCapacityContext";
import { DirhamAmount } from "@/components/ui";
import { featureFlags } from "@/config/featureFlags";
import {
  getBuyerAuctionDeposits,
  toAuctionCapacityNumber,
  type BuyerAuctionDepositPayment,
} from "@/services/marketplace";

export default function AuctionDepositHistoryCard() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const capacityState = useOptionalAuctionCapacity();
  const [payments, setPayments] = useState<BuyerAuctionDepositPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeposits = useCallback(async () => {
    if (!featureFlags.auctions) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getBuyerAuctionDeposits(locale);
      setPayments(response.data.payments || []);
      if (response.data.auction_capacity) {
        capacityState?.applyCapacity(response.data.auction_capacity);
      }
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [capacityState, locale]);

  useEffect(() => {
    void loadDeposits();
  }, [loadDeposits]);

  useEffect(() => {
    const refresh = () => void loadDeposits();
    window.addEventListener("wallet-refresh", refresh);
    return () => window.removeEventListener("wallet-refresh", refresh);
  }, [loadDeposits]);

  if (!featureFlags.auctions) return null;

  return (
    <div
      className="rounded-[20px] border p-5"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="font-semibold" style={{ color: getColor("primaryText") }}>
          {t("wallet.auction_deposit_history")}
        </p>
        <Link
          href={`/${locale}/auctions/registrations`}
          className="text-[11px] font-medium underline underline-offset-2"
          style={{ color: getColor("primary") }}
        >
          {t("auctions.my_registrations_cta")}
        </Link>
      </div>

      {loading ? (
        <p className="text-xs" style={{ color: getColor("mutedText") }}>
          {t("common.loading")}
        </p>
      ) : payments.length === 0 ? (
        <p className="text-xs" style={{ color: getColor("mutedText") }}>
          {t("wallet.auction_deposit_history_empty")}
        </p>
      ) : (
        <div className="space-y-2">
          {payments.slice(0, 6).map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border px-4 py-3 flex items-center justify-between gap-3"
              style={{ borderColor: getColor("border") }}
            >
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: getColor("primaryText") }}
                >
                  <DirhamAmount
                    amount={toAuctionCapacityNumber(payment.amount)}
                    decimals={2}
                  />
                </p>
                <p className="text-xs" style={{ color: getColor("mutedText") }}>
                  {payment.status_label || payment.status || "—"}
                  {payment.method ? ` · ${payment.method}` : ""}
                </p>
              </div>
              {payment.created_at && (
                <span
                  className="text-[10px] shrink-0"
                  style={{ color: getColor("mutedText") }}
                >
                  {new Date(payment.created_at).toLocaleDateString(locale)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
