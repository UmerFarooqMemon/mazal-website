"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useWallet } from "@/hooks/useWallet";
import { useAuctionCapacity } from "@/context/AuctionCapacityContext";
import WalletBalanceCard from "@/components/wallet/WalletBalanceCard";
import WalletActivityCard from "@/components/wallet/WalletActivityCard";
import WalletBenefitsCard from "@/components/wallet/WalletBenefitsCard";
import FundsOnHoldCard from "@/components/wallet/FundsOnHoldCard";
import CashOutModal from "@/components/wallet/CashOutModal";
import ReleaseFundsModal from "@/components/wallet/ReleaseFundsModal";
import { createWalletCashOut } from "@/services/wallet";
import {
  createBuyerAuctionDepositReleaseRequest,
  toAuctionCapacityNumber,
} from "@/services/marketplace";

export default function DashboardWalletPanel({
  balanceHidden,
  onBalanceHiddenChange,
}: {
  balanceHidden?: boolean;
  onBalanceHiddenChange?: (hidden: boolean) => void;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const wallet = useWallet();
  const { capacity, refresh: refreshCapacity, applyCapacity } =
    useAuctionCapacity();
  const [cashOutOpen, setCashOutOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);

  const heldAmount = toAuctionCapacityNumber(capacity?.held_deposit);
  const maxBiddingLimit = toAuctionCapacityNumber(capacity?.max_bidding_limit);
  const remainingBiddingLimit = toAuctionCapacityNumber(
    capacity?.remaining_bidding_limit,
  );
  const reservedAmount = toAuctionCapacityNumber(capacity?.reserved_amount);
  const pendingRelease = toAuctionCapacityNumber(
    capacity?.pending_release_amount,
  );
  const releasableAmount = Math.max(0, heldAmount - pendingRelease - reservedAmount);

  return (
    <>
      {wallet.error && (
        <p className="mb-4 text-sm text-red-600">{wallet.error}</p>
      )}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <WalletBalanceCard
            balance={wallet.availableBalance}
            hidden={balanceHidden}
            onHiddenChange={onBalanceHiddenChange}
            onTopUp={() => router.push(`/${locale}/wallet/top-up`)}
            onCashOut={() => setCashOutOpen(true)}
          />
          <WalletActivityCard
            transactions={wallet.transactions}
            loading={wallet.loading}
          />
        </div>
        <div className="space-y-6">
          <WalletBenefitsCard
            income={wallet.income}
            spending={wallet.spending}
            incomeShare={wallet.incomeShare}
            spendingShare={wallet.spendingShare}
          />
          <FundsOnHoldCard
            holds={wallet.holds}
            heldAmount={heldAmount || wallet.heldAmount}
            maxBiddingLimit={maxBiddingLimit}
            remainingBiddingLimit={remainingBiddingLimit}
            reservedAmount={reservedAmount}
            reservedPositions={capacity?.reserved_positions || []}
            canRequestRelease={capacity?.can_request_release === true}
            releaseBlockedReason={capacity?.release_blocked_reason}
            onRequestRelease={() => setReleaseOpen(true)}
          />
        </div>
      </div>

      <CashOutModal
        isOpen={cashOutOpen}
        onClose={() => setCashOutOpen(false)}
        balance={wallet.availableBalance}
        minAmount={wallet.limits?.min_cash_out ?? 100}
        maxAmount={wallet.limits?.max_cash_out}
        onConfirm={async (payload) => {
          await createWalletCashOut(locale, payload);
          await wallet.refresh();
          toast.success(t("wallet.cash_out_success"));
        }}
      />
      <ReleaseFundsModal
        isOpen={releaseOpen}
        onClose={() => setReleaseOpen(false)}
        heldAmount={heldAmount || wallet.heldAmount}
        releasableAmount={releasableAmount}
        onConfirm={async (amount, note) => {
          const response = await createBuyerAuctionDepositReleaseRequest(
            locale,
            {
              amount: amount.toFixed(2),
              note,
            },
          );
          if (response.data.auction_capacity) {
            applyCapacity(response.data.auction_capacity);
          }
          await Promise.all([wallet.refresh(), refreshCapacity()]);
          toast.success(t("wallet.release_request_submitted"));
        }}
      />
    </>
  );
}
