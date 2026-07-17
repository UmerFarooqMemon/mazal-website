"use client";

import { CheckCircle2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export interface DealData {
  role: "seller" | "buyer" | null;
  emirate: string;
  plateType: string;
  plateVariant: string;
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
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const price = data.price || 0;
  const fees = Math.round(price * 0.08);
  const net = price - fees;
  const feeLine = Math.round(price * 0.01);
  const allocated = Math.min(Math.max(0, allocatedAmount), price);
  const remaining = Math.max(0, price - allocated);
  const pct = price > 0 ? Math.min(100, Math.round((allocated / price) * 100)) : 0;

  return (
    <div
      className="rounded-2xl border shadow-[0_8px_30px_rgba(1,15,81,0.06)] p-6"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className={`text-[10px] font-bold uppercase tracking-wider mb-4 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("mutedText") }}
      >
        {t("private-deal.summary_title")}
      </div>

      <div
        className="border rounded-xl py-4 px-4 mb-5 flex items-center justify-center"
        style={{
          backgroundColor: getColor("primaryLight"),
          borderColor: getColor("border"),
        }}
      >
        <div className="text-center">
          <div
            className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: getColor("mutedText") }}
          >
            {data.emirate === "dubai" || !data.emirate
              ? t("listings.emirate_dubai")
              : data.emirate}
          </div>
          <div
            className="flex items-center justify-center gap-2 text-2xl font-serif font-bold leading-none"
            style={{ color: getColor("primary") }}
          >
            {data.code ? <span>{data.code}</span> : null}
            {data.code && data.digit ? (
              <span
                className="font-light text-base"
                style={{ color: getColor("border") }}
              >
                |
              </span>
            ) : null}
            <span>{data.digit || "—"}</span>
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
          getColor={getColor}
        />
        <Row
          label={t("private-deal.agreed_price")}
          value={formatAed(price)}
          isRTL={isRTL}
          getColor={getColor}
        />
        <Row
          label={t("private-deal.escrow_custody")}
          value={formatAed(feeLine)}
          isRTL={isRTL}
          muted
          getColor={getColor}
        />
        <Row
          label={t("private-deal.platform_fee")}
          value={formatAed(Math.round(price * 0.04))}
          isRTL={isRTL}
          muted
          getColor={getColor}
        />
        <Row
          label={t("private-deal.service_transfer")}
          value={formatAed(Math.round(price * 0.03))}
          isRTL={isRTL}
          muted
          getColor={getColor}
        />
        <div
          className="border-t pt-3"
          style={{ borderColor: getColor("border") }}
        >
          <Row
            label={t("private-deal.total_fees")}
            value={formatAed(fees)}
            isRTL={isRTL}
            getColor={getColor}
          />
        </div>
        <div
          className={`flex justify-between items-center pt-1 text-base font-bold ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span style={{ color: getColor("primaryText") }}>
            {data.role === "buyer"
              ? t("private-deal.you_pay_total")
              : t("private-deal.you_receive_net")}
          </span>
          <span style={{ color: getColor("primary") }}>
            {formatAed(data.role === "buyer" ? price + fees : net)}
          </span>
        </div>
      </div>

      {showAllocation && (
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            borderColor: getColor("border"),
            backgroundColor: getColor("primaryLight"),
          }}
        >
          <div
            className={`grid grid-cols-3 gap-2 mb-4 ${isRTL ? "direction-rtl" : ""}`}
          >
            <div className={isRTL ? "text-right" : "text-left"}>
              <div
                className="text-[11px] mb-1"
                style={{ color: getColor("mutedText") }}
              >
                {t("private-deal.alloc_total")}
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: getColor("primaryText") }}
              >
                {formatAed(price)}
              </div>
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <div
                className="text-[11px] mb-1"
                style={{ color: getColor("mutedText") }}
              >
                {t("private-deal.alloc_allocated")}
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: getColor("primaryText") }}
              >
                {formatAed(allocated)}
              </div>
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <div
                className="text-[11px] mb-1"
                style={{ color: getColor("mutedText") }}
              >
                {t("private-deal.alloc_remaining")}
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: getColor("primaryText") }}
              >
                {formatAed(remaining)}
              </div>
            </div>
          </div>

          <div className="relative pt-5">
            <div
              className="absolute top-0 text-[11px] font-medium -translate-x-1/2"
              style={{ left: `${pct}%`, color: getColor("primary") }}
            >
              {pct}%
            </div>
            <div
              className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className="relative flex-1 h-2 rounded-full"
                style={{ backgroundColor: getColor("border") }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: getColor("primary"),
                  }}
                />
                <div
                  className="absolute top-1/2 size-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${pct}%`,
                    backgroundColor: getColor("primary"),
                  }}
                />
              </div>
              {pct >= 100 && (
                <CheckCircle2
                  className="w-4 h-4 shrink-0"
                  style={{ color: getColor("primary") }}
                />
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
  getColor,
}: {
  label: string;
  value: string;
  isRTL: boolean;
  muted?: boolean;
  getColor: (key: "mutedText" | "secondaryText" | "primaryText") => string;
}) {
  return (
    <div className={`flex justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
      <span
        style={{
          color: muted ? getColor("mutedText") : getColor("secondaryText"),
        }}
      >
        {label}
      </span>
      <span
        className="font-medium shrink-0"
        style={{ color: getColor("primaryText") }}
      >
        {value}
      </span>
    </div>
  );
}
