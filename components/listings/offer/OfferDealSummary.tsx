"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";

interface OfferDealSummaryProps {
  askingPrice: number;
  plate_code?: string;
  plate_digits?: string;
  emirate?: string;
  plate_type?: string;
  plate_design?: string;
  hideCode?: boolean;
}

function formatAed(amount: number) {
  return `AED ${amount.toLocaleString("en-AE")}`;
}

export default function OfferDealSummary({
  askingPrice,
  plate_code = "A",
  plate_digits = "777",
  emirate = "DUBAI",
  plate_type,
  plate_design,
  hideCode = false,
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

      <div className="mb-5">
        <NumberPlateDisplay
          plate_code={plate_code}
          plate_digits={plate_digits}
          emirate={emirate}
          plateType={plate_type}
          plateDesign={plate_design}
          crop="form"
          hideCode={hideCode}
        />
      </div>

      <div className="space-y-3 text-sm mb-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span
              style={{
                color: row.muted
                  ? getColor("mutedText")
                  : getColor("secondaryText"),
              }}
            >
              {row.label}
            </span>
            <span
              className={row.bold ? "font-bold" : ""}
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
