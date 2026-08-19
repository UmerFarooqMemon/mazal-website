"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useAuctionCapacity } from "@/context/AuctionCapacityContext";
import { Gavel } from "lucide-react";
import WalletDialog from "@/components/wallet/WalletDialog";
import { Button, DirhamAmount } from "@/components/ui";
import { featureFlags } from "@/config/featureFlags";
import {
  acceptAuctionRunnerUpOffer,
  declineAuctionRunnerUpOffer,
  getAuctionRunnerUpOffers,
  toAuctionCapacityNumber,
  type AuctionRunnerUpOffer,
} from "@/services/marketplace";
import { auctionCheckoutPath, rememberCheckoutIntent } from "@/lib/checkout-intent";
import { RUNNER_UP_CHECK_EVENT } from "@/lib/auction-notification-actions";

export default function RunnerUpOfferPrompt() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const { isAuthenticated } = useAuth();
  const { applyCapacity } = useAuctionCapacity();
  const router = useRouter();
  const [offer, setOffer] = useState<AuctionRunnerUpOffer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPendingOffer = useCallback(async () => {
    if (!featureFlags.auctions || !isAuthenticated) {
      setOffer(null);
      return;
    }
    try {
      const response = await getAuctionRunnerUpOffers(locale);
      const pending = (response.data.offers || []).find(
        (item) => item.status === "pending",
      );
      setOffer(pending ?? null);
    } catch {
      setOffer(null);
    }
  }, [isAuthenticated, locale]);

  useEffect(() => {
    void loadPendingOffer();
  }, [loadPendingOffer]);

  useEffect(() => {
    const onCheck = () => {
      void loadPendingOffer();
    };
    window.addEventListener(RUNNER_UP_CHECK_EVENT, onCheck);
    return () => window.removeEventListener(RUNNER_UP_CHECK_EVENT, onCheck);
  }, [loadPendingOffer]);

  if (!offer) return null;

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const response = await acceptAuctionRunnerUpOffer(offer.id, locale);
      if (response.data.auction_capacity) {
        applyCapacity(response.data.auction_capacity);
      }
      setOffer(null);
      toast.success(t("auctions.runner_up_accepted"));
      const purchaseId = response.data.purchase_id ?? offer.purchase_id;
      if (purchaseId) {
        rememberCheckoutIntent("auction", offer.listing_id, {
          role: "buyer",
          purchaseId: String(purchaseId),
          price: toAuctionCapacityNumber(offer.bid_amount),
        });
        router.push(auctionCheckoutPath(locale, offer.listing_id));
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("auctions.runner_up_failed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setSubmitting(true);
    try {
      const response = await declineAuctionRunnerUpOffer(offer.id, locale);
      if (response.data.auction_capacity) {
        applyCapacity(response.data.auction_capacity);
      }
      setOffer(null);
      toast.success(t("auctions.runner_up_declined"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("auctions.runner_up_failed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WalletDialog
      isOpen
      onClose={() => undefined}
      title={t("auctions.runner_up_title")}
      icon={<Gavel className="w-5 h-5" />}
      maxWidth="max-w-[480px]"
    >
      <p className="text-sm mb-4" style={{ color: getColor("secondaryText") }}>
        {t("auctions.runner_up_body")}
      </p>
      <div
        className="rounded-xl border px-4 py-3 mb-5"
        style={{ borderColor: getColor("border") }}
      >
        <p className="text-sm font-medium" style={{ color: getColor("primaryText") }}>
          {offer.plate || offer.listing?.display_plate || `#${offer.listing_id}`}
        </p>
        <p className="text-lg font-semibold mt-1" style={{ color: getColor("primary") }}>
          <DirhamAmount
            amount={toAuctionCapacityNumber(offer.bid_amount)}
            decimals={2}
            weight="semibold"
          />
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          disabled={submitting}
          onClick={() => void handleDecline()}
        >
          {t("auctions.runner_up_decline")}
        </Button>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={submitting}
          onClick={() => void handleAccept()}
        >
          {t("auctions.runner_up_accept")}
        </Button>
      </div>
    </WalletDialog>
  );
}
