"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import {
  getListingDetailCardBackground,
  hasListingDetailStatus,
  ListingDetailStatusBadge,
} from "@/components/marketplace/ListingStatusBadge";
import type { PlatePreviewConfig } from "@/lib/plate-preview";
import { type MarketplaceListingStatus } from "@/services/marketplace";

interface OfferDealSummaryProps {
  askingPrice: number;
  status?: MarketplaceListingStatus | string | null;
  previouslySold?: boolean;
  plate_code?: string;
  plate_digits?: string;
  emirate?: string;
  plate_type?: string;
  plate_design?: string;
  preview?: PlatePreviewConfig | null;
  hideCode?: boolean;
}

export default function OfferDealSummary({
  askingPrice,
  status,
  previouslySold,
  plate_code = "A",
  plate_digits = "777",
  emirate = "DUBAI",
  plate_type,
  plate_design,
  preview,
  hideCode = false,
}: OfferDealSummaryProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const showDetailStatus = hasListingDetailStatus(status, previouslySold);
  const detailCardBackground = getListingDetailCardBackground(
    status,
    previouslySold,
  );

  const escrow = Math.round(askingPrice * 0.01);
  const platform = Math.round(askingPrice * 0.04);
  const service = Math.round(askingPrice * 0.03);
  const fees = escrow + platform + service;
  const net = askingPrice - fees;
  const totalWithFees = askingPrice + fees;

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
        backgroundColor: showDetailStatus ? undefined : getColor("surface"),
        background: detailCardBackground,
        borderColor: getColor("border"),
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-wider mb-3 text-start"
        style={{ color: getColor("mutedText") }}
      >
        {showDetailStatus ? (
          <div className="flex items-center justify-between gap-3">
            <ListingDetailStatusBadge
              status={status}
              previouslySold={previouslySold}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
            />
            <span>{t("offer.summary_title")}</span>
          </div>
        ) : (
          t("offer.summary_title")
        )}
      </div>

      <div className="relative deal-summary-plate-frame mb-1 rounded-[20px] bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
        <NumberPlateDisplay
          plate_code={plate_code}
          plate_digits={plate_digits}
          emirate={emirate}
          preview={preview}
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
          <DirhamAmount amount={totalWithFees} weight="bold" />
        </span>
      </div>
    </div>
  );
}
