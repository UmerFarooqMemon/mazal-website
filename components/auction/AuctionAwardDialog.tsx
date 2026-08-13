"use client";

import { Modal, Button, DirhamAmount } from "@/components/ui";
import { useLocale } from "@/context/LocaleContext";
import { toMarketplaceNumber } from "@/services/marketplace";
import type { MarketplaceAuctionBid } from "@/services/marketplace";

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

  return (
    <Modal
      isOpen={Boolean(bid)}
      onClose={submitting ? () => undefined : onClose}
      title={t("auctions.award_confirm_title")}
      size="sm"
    >
      <p className="text-sm leading-6 text-[#545e6f]">
        {t("auctions.award_confirm_body").replace(
          "{bidder}",
          bid?.bidder?.name || "—",
        )}
      </p>
      {bid && (
        <p className="mt-3 text-lg font-semibold text-[#081123]">
          <DirhamAmount amount={toMarketplaceNumber(bid.amount)} weight="bold" />
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
    </Modal>
  );
}
