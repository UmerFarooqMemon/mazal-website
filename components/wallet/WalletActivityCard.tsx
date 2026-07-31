"use client";

import { useMemo } from "react";
import { Landmark } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import type { WalletTransaction } from "./types";

interface WalletActivityCardProps {
  transactions: WalletTransaction[];
  loading?: boolean;
}

type Group = "group_today" | "group_yesterday" | "group_earlier";

function groupOf(iso: string): Group {
  const then = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  if (then.getTime() >= startOfToday) return "group_today";
  if (then.getTime() >= startOfToday - 86_400_000) return "group_yesterday";
  return "group_earlier";
}

export default function WalletActivityCard({
  transactions,
  loading = false,
}: WalletActivityCardProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  const groups = useMemo(() => {
    const order: Group[] = ["group_today", "group_yesterday", "group_earlier"];
    return order
      .map((key) => ({
        key,
        items: transactions.filter((item) => groupOf(item.createdAt) === key),
      }))
      .filter((group) => group.items.length > 0);
  }, [transactions]);

  const relativeTime = (iso: string) => {
    const minutes = Math.max(
      1,
      Math.round((Date.now() - new Date(iso).getTime()) / 60_000),
    );
    if (minutes < 60) return `${minutes} ${t("wallet.activity_minutes_ago")}`;
    if (minutes < 1440)
      return `${Math.round(minutes / 60)}${t("wallet.activity_hours_ago")}`;
    return `${Math.round(minutes / 1440)}${t("wallet.activity_days_ago")}`;
  };

  const titleOf = (item: WalletTransaction) => {
    const key = `wallet.activity_type_${item.kind}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
    return item.reference || String(item.kind);
  };

  const subtitleOf = (item: WalletTransaction) => {
    return `${item.reference} • ${relativeTime(item.createdAt)}`;
  };

  const amountColor = (item: WalletTransaction) => {
    const signed = item.signedAmount ?? (item.direction === "debit" ? -item.amount : item.amount);
    return signed < 0 ? getColor("error") : getColor("primaryText");
  };

  return (
    <div
      className="rounded-[20px] border p-6 sm:p-7"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h2
        className="text-[22px] font-serif leading-tight mb-1"
        style={{ color: getColor("primaryText") }}
      >
        {t("wallet.recent_activity")}
      </h2>
      <p className="text-sm mb-5" style={{ color: getColor("secondaryText") }}>
        {t("wallet.recent_activity_subtitle")}
      </p>

      {loading && (
        <p className="text-sm py-6" style={{ color: getColor("mutedText") }}>
          {t("wallet.loading")}
        </p>
      )}

      {!loading && groups.length === 0 && (
        <p className="text-sm py-6" style={{ color: getColor("mutedText") }}>
          {t("wallet.no_activity")}
        </p>
      )}

      {groups.map((group) => (
        <div key={group.key} className="mb-5 last:mb-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2.5"
            style={{ color: getColor("mutedText") }}
          >
            {t(`wallet.${group.key}`)}
          </p>

          <div className="space-y-3">
            {group.items.map((item) => {
              const signed =
                item.signedAmount ??
                (item.direction === "debit" ? -item.amount : item.amount);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 rounded-2xl border px-4 py-3.5"
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("surface"),
                  }}
                >
                  <div
                    className="size-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "#F8F9FC",
                      color: getColor("primaryText"),
                    }}
                  >
                    <Landmark className="w-[18px] h-[18px]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium truncate"
                      style={{ color: getColor("primaryText") }}
                    >
                      {titleOf(item)}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: getColor("mutedText") }}
                    >
                      {subtitleOf(item)}
                    </p>
                  </div>

                  <div className="text-end shrink-0">
                    <p className="font-semibold" style={{ color: amountColor(item) }}>
                      {signed < 0 ? "-" : "+"}
                      <DirhamAmount amount={Math.abs(signed)} weight="semibold" />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
