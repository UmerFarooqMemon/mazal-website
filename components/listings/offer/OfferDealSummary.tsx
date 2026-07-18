"use client";

import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

interface OfferDealSummaryProps {
  askingPrice: number;
}

function formatAed(amount: number) {
  return `AED ${amount.toLocaleString("en-AE")}`;
}

export default function OfferDealSummary({
  askingPrice,
}: OfferDealSummaryProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const escrow = Math.round(askingPrice * 0.01);
  const platform = Math.round(askingPrice * 0.04);
  const service = Math.round(askingPrice * 0.03);
  const fees = escrow + platform + service;
  const net = askingPrice - fees;

  const rows = [
    { label: t("offer.asking_price_label"), value: formatAed(askingPrice) },
    { label: t("offer.escrow_custody"), value: formatAed(escrow), muted: true },
    { label: t("offer.platform_fee"), value: formatAed(platform), muted: true },
    {
      label: t("offer.service_transfer"),
      value: formatAed(service),
      muted: true,
    },
    { label: t("offer.total_fees"), value: formatAed(fees) },
    {
      label: t("offer.you_receive_net"),
      value: formatAed(net),
      bold: true,
    },
  ];

  return (
    <div
      className="rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className={`text-[10px] font-bold uppercase tracking-wider mb-4 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("mutedText") }}
      >
        {t("offer.summary_title")}
      </div>

      <div
        className="rounded-xl overflow-hidden border mb-5 p-4 flex items-center justify-center"
        style={{
          borderColor: getColor("border"),
          backgroundColor: "#F5F5F5",
        }}
      >
        <div className="relative w-full aspect-[250/60]">
          <Image
            src="/home-new.png"
            alt="Dubai plate"
            fill
            className="object-contain"
            sizes="320px"
          />
        </div>
      </div>

      <div className="space-y-3 text-sm mb-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""} ${row.bold ? "pt-1" : ""}`}
          >
            <span
              className={row.bold ? "font-bold" : ""}
              style={{
                color: row.muted
                  ? getColor("mutedText")
                  : getColor("secondaryText"),
              }}
            >
              {row.label}
            </span>
            <span
              className={`shrink-0 ${row.bold ? "font-bold" : "font-medium"}`}
              style={{ color: getColor("primaryText") }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div
        className={`flex justify-between items-end border-t pt-5 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ borderColor: getColor("border") }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: getColor("secondaryText") }}
        >
          {t("offer.total_amount")}
        </span>
        <span
          className="text-2xl md:text-3xl font-serif font-bold"
          style={{ color: getColor("primaryText") }}
        >
          {formatAed(askingPrice)}
        </span>
      </div>
    </div>
  );
}
