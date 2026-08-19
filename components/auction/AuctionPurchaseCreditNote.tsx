"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import { asMarketplaceMoney, toAuctionCapacityNumber } from "@/services/marketplace";

interface AuctionPurchaseCreditNoteProps {
  agreedPrice: number | string;
  depositCredit?: number | string | null;
  totalDue?: number | string | null;
}

export default function AuctionPurchaseCreditNote({
  agreedPrice,
  depositCredit,
  totalDue,
}: AuctionPurchaseCreditNoteProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  const credit = toAuctionCapacityNumber(depositCredit);
  const due = toAuctionCapacityNumber(totalDue);
  const price = toAuctionCapacityNumber(agreedPrice);

  if (credit <= 0 && price <= 0) return null;

  const autoFunded = due <= 0 && credit > 0;

  return (
    <div
      className="rounded-xl border px-4 py-3 space-y-1.5"
      style={{
        borderColor: getColor("border"),
        backgroundColor: `${getColor("primary")}08`,
      }}
    >
      <p className="text-sm font-semibold" style={{ color: getColor("primaryText") }}>
        {t("auctions.winner_payment_title")}
      </p>
      {price > 0 && (
        <p className="text-xs flex justify-between gap-3" style={{ color: getColor("secondaryText") }}>
          <span>{t("auctions.winner_agreed_price")}</span>
          <DirhamAmount amount={price} decimals={2} />
        </p>
      )}
      {credit > 0 && (
        <p className="text-xs flex justify-between gap-3" style={{ color: getColor("secondaryText") }}>
          <span>{t("auctions.winner_deposit_credit")}</span>
          <span style={{ color: getColor("primary") }}>
            − <DirhamAmount amount={credit} decimals={2} />
          </span>
        </p>
      )}
      <p className="text-xs flex justify-between gap-3 font-medium" style={{ color: getColor("primaryText") }}>
        <span>{t("auctions.winner_total_due")}</span>
        <DirhamAmount amount={due} decimals={2} weight="semibold" />
      </p>
      {autoFunded && (
        <p className="text-xs pt-1" style={{ color: getColor("success") }}>
          {t("auctions.winner_auto_funded")}
        </p>
      )}
      {!autoFunded && due > 0 && (
        <p className="text-[11px]" style={{ color: getColor("mutedText") }}>
          {t("auctions.winner_pay_remainder").replace(
            "{amount}",
            asMarketplaceMoney(due),
          )}
        </p>
      )}
    </div>
  );
}
