"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import type { AuctionSummaryData } from "./types";

interface AuctionSummaryCardProps {
  data: AuctionSummaryData;
  showCheckAmount?: boolean;
}

export default function AuctionSummaryCard({
  data,
  showCheckAmount = false,
}: AuctionSummaryCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const rows: { label: string; value: ReactNode; pill?: boolean }[] = [
    {
      label: t("auctions.summary_current_limit"),
      value: <DirhamAmount amount={data.currentBiddingLimit} />,
      pill: true,
    },
    {
      label: t("auctions.summary_min_deposit"),
      value: <DirhamAmount amount={data.minimumDeposit} />,
      pill: true,
    },
    {
      label: t("auctions.summary_target_limit"),
      value: <DirhamAmount amount={data.targetBiddingLimit} />,
      pill: true,
    },
    {
      label: t("auctions.summary_deposit_status"),
      value: t(`auctions.deposit_status_${data.depositStatus}`),
      pill: true,
    },
    {
      label: t("auctions.summary_current_price"),
      value: (
        <span className="font-semibold">
          <DirhamAmount amount={data.currentPrice} weight="bold" />
        </span>
      ),
      pill: true,
    },
  ];

  return (
    <div
      className="rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 sm:p-6"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className={`text-[10px] font-bold uppercase tracking-[0.12em] mb-4 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("mutedText") }}
      >
        {t("auctions.summary_title")}
      </div>

      <div className="space-y-3.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse text-right" : ""}`}
          >
            <span
              className="text-[13px] shrink-0"
              style={{ color: getColor("secondaryText") }}
            >
              {row.label}
            </span>
            <span
              className={`text-[13px] ${row.pill ? "rounded-full px-3 py-1.5 border" : ""}`}
              style={{
                color: getColor("primaryText"),
                backgroundColor: row.pill ? getColor("primaryLight") : undefined,
                borderColor: row.pill ? getColor("border") : undefined,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}

        {showCheckAmount && data.checkAmount != null && (
          <div
            className={`flex items-center justify-between gap-3 pt-3 border-t ${isRTL ? "flex-row-reverse text-right" : ""}`}
            style={{ borderColor: getColor("border") }}
          >
            <span
              className="text-[14px] font-medium"
              style={{ color: getColor("primaryText") }}
            >
              {t("auctions.summary_check_amount")}
            </span>
            <span
              className="text-[16px] font-bold"
              style={{ color: getColor("primary") }}
            >
              <DirhamAmount amount={data.checkAmount} weight="bold" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
