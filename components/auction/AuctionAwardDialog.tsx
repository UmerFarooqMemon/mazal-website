"use client";

import { Button, DirhamAmount } from "@/components/ui";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { toMarketplaceNumber } from "@/services/marketplace";
import type { MarketplaceAuctionBid } from "@/services/marketplace";
import WalletDialog from "@/components/wallet/WalletDialog";
import { Gavel } from "lucide-react";

export default function AuctionAwardDialog({
  bid,
  submitting,
  onConfirm,
  onClose,
}: {
  bid: MarketplaceAuctionBid | null;
  submitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  return (
    <WalletDialog
      isOpen={Boolean(bid)}
      onClose={submitting ? () => undefined : onClose}
      title={t("auctions.award_confirm_title")}
      icon={<Gavel className="w-5 h-5" />}
      maxWidth="max-w-[420px]"
    >
      <p
        className="text-sm leading-6"
        style={{ color: getColor("secondaryText") }}
      >
        {t("auctions.award_confirm_body").replace(
          "{bidder}",
          bid?.bidder?.name || "—",
        )}
      </p>
      {bid && (
        <p
          className="mt-4 inline-flex rounded-full px-4 py-2 text-lg font-semibold"
          style={{
            backgroundColor: getColor("primaryLight"),
            color: getColor("primaryText"),
          }}
        >
          <DirhamAmount
            amount={toMarketplaceNumber(bid.amount)}
            weight="bold"
          />
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="primary"
          disabled={submitting}
          onClick={onConfirm}
          className="h-11 flex-1 rounded-full"
        >
          {submitting
            ? t("common.loading") || "Loading..."
            : t("auctions.award_and_close")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={onClose}
          className="h-11 flex-1 rounded-full"
        >
          {t("auctions.award_cancel")}
        </Button>
      </div>
    </WalletDialog>
  );
}
