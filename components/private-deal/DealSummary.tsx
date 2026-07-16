"use client";

import { CheckCircle2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export interface DealData {
  role: "seller" | "buyer" | null;
  emirate: string;
  plateType: string;
  code: string;
  digit: string;
  price: number;
}

interface DealSummaryProps {
  data: DealData;
  allocatedAmount?: number;
  showAllocation?: boolean;
}

function formatAed(amount: number) {
  return `AED ${amount.toLocaleString("en-AE")}`;
}

export default function DealSummary({
  data,
  allocatedAmount = 0,
  showAllocation = false,
}: DealSummaryProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const price = data.price || 0;
  const fees = Math.round(price * 0.08);
  const net = price - fees;
  const feeLine = Math.round(price * 0.01);
  const allocated = Math.min(Math.max(0, allocatedAmount), price);
  const remaining = Math.max(0, price - allocated);
  const pct = price > 0 ? Math.min(100, Math.round((allocated / price) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#d9dee6] shadow-[0_8px_30px_rgba(1,15,81,0.06)] p-6">
      <div
        className={`text-[10px] font-bold text-[#9aa3b2] uppercase tracking-wider mb-4 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.summary_title")}
      </div>

      <div className="bg-[#F3F4F8] border border-[#d9dee6] rounded-xl py-4 px-4 mb-5 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[9px] text-[#9aa3b2] font-bold uppercase tracking-[0.2em] mb-1">
            {data.emirate || "DUBAI"}
          </div>
          <div className="flex items-center justify-center gap-2 text-2xl font-serif font-bold text-[#0a2f94] leading-none">
            <span>{data.code || "AA"}</span>
            <span className="text-gray-300 font-light text-base">|</span>
            <span>{data.digit || "777"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <Row
          label={t("private-deal.role_label")}
          value={
            data.role
              ? data.role === "seller"
                ? t("private-deal.seller_label")
                : t("private-deal.buyer_label")
              : "—"
          }
          isRTL={isRTL}
        />
        <Row
          label={t("private-deal.agreed_price")}
          value={formatAed(price)}
          isRTL={isRTL}
        />
        <Row
          label={t("private-deal.escrow_custody")}
          value={formatAed(feeLine)}
          isRTL={isRTL}
          muted
        />
        <Row
          label={t("private-deal.platform_fee")}
          value={formatAed(Math.round(price * 0.04))}
          isRTL={isRTL}
          muted
        />
        <Row
          label={t("private-deal.service_transfer")}
          value={formatAed(Math.round(price * 0.03))}
          isRTL={isRTL}
          muted
        />
        <div className="border-t border-[#eef1f6] pt-3">
          <Row
            label={t("private-deal.total_fees")}
            value={formatAed(fees)}
            isRTL={isRTL}
          />
        </div>
        <div
          className={`flex justify-between items-center pt-1 text-base font-bold ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-[#081123]">
            {data.role === "buyer"
              ? t("private-deal.you_pay_total")
              : t("private-deal.you_receive_net")}
          </span>
          <span className="text-[#0a2f94]">
            {formatAed(data.role === "buyer" ? price + fees : net)}
          </span>
        </div>
      </div>

      {showAllocation && (
        <div className="mt-5 rounded-2xl border border-[#d9dee6] bg-[#f7f8fb] p-4">
          <div
            className={`grid grid-cols-3 gap-2 mb-4 ${isRTL ? "direction-rtl" : ""}`}
          >
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className="text-[11px] text-[#8b95a7] mb-1">
                {t("private-deal.alloc_total")}
              </div>
              <div className="text-sm font-semibold text-[#081123]">
                {formatAed(price)}
              </div>
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className="text-[11px] text-[#8b95a7] mb-1">
                {t("private-deal.alloc_allocated")}
              </div>
              <div className="text-sm font-semibold text-[#081123]">
                {formatAed(allocated)}
              </div>
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className="text-[11px] text-[#8b95a7] mb-1">
                {t("private-deal.alloc_remaining")}
              </div>
              <div className="text-sm font-semibold text-[#081123]">
                {formatAed(remaining)}
              </div>
            </div>
          </div>

          <div className="relative pt-5">
            <div
              className="absolute top-0 text-[11px] font-medium text-[#0a2f94] -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {pct}%
            </div>
            <div
              className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div className="relative flex-1 h-2 rounded-full bg-[#d9dee6]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#0a2f94] transition-all"
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute top-1/2 size-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-[#0a2f94] shadow-sm"
                  style={{ left: `${pct}%` }}
                />
              </div>
              {pct >= 100 && (
                <CheckCircle2 className="w-4 h-4 text-[#0a2f94] shrink-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  isRTL,
  muted,
}: {
  label: string;
  value: string;
  isRTL: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
      <span className={muted ? "text-[#8b95a7]" : "text-[#545e6f]"}>{label}</span>
      <span className="font-medium text-[#081123] shrink-0">{value}</span>
    </div>
  );
}
