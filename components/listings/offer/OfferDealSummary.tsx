"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";

interface OfferDealSummaryProps {
  askingPrice: number;
  plate_code?: string;
  plate_digits?: string;
  emirate?: string;
  plate_type?: string;
  plate_design?: string;
  hideCode?: boolean;
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

  const escrow = Math.round(askingPrice * 0.01);
  const platform = Math.round(askingPrice * 0.04);
  const service = Math.round(askingPrice * 0.03);
  const fees = escrow + platform + service;
  const net = askingPrice - fees;

  const rows = [
    { label: t("offer.asking_price_label"), amount: askingPrice },
    { label: t("offer.escrow_custody"), amount: escrow, muted: true },
    { label: t("offer.platform_fee"), amount: platform, muted: true },
    {
      label: t("offer.service_transfer"),
      amount: service,
      muted: true,
    },
    { label: t("offer.total_fees"), amount: fees },
    {
      label: t("offer.you_receive_net"),
      amount: net,
      bold: true,
    },
  ];

  return (
    <div
      className="marketplace-checkout-summary rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className="relative z-10 text-[10px] font-bold uppercase tracking-wider mb-3 text-start"
        style={{ color: getColor("mutedText") }}
      >
        {t("offer.summary_title")}
      </div>

      <div className="deal-summary-plate-frame mb-1">
        <NumberPlateDisplay
          plate_code={plate_code}
          plate_digits={plate_digits}
          emirate={emirate}
          plateType={plate_type}
          plateDesign={plate_design}
          crop="deal-summary"
          hideCode={hideCode}
          wrapperClassName="deal-summary-plate w-full"
        />
      </div>

      <div className="space-y-3 text-sm mb-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-4`}
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
              <DirhamAmount amount={row.amount} weight={row.bold ? "bold" : "regular"} />
            </span>
          </div>
        ))}
      </div>

      <div
        className={`flex justify-between items-end border-t pt-5`}
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
          <DirhamAmount amount={askingPrice} weight="bold" />
        </span>
      </div>
    </div>
  );
}
