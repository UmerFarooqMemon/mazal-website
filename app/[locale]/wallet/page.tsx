"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useWallet } from "@/hooks/useWallet";
import { useAuctionCapacity } from "@/context/AuctionCapacityContext";
import { useSupportChat } from "@/context/SupportChatContext";
import WalletBalanceCard from "@/components/wallet/WalletBalanceCard";
import WalletActivityCard from "@/components/wallet/WalletActivityCard";
import WalletBenefitsCard from "@/components/wallet/WalletBenefitsCard";
import FundsOnHoldCard from "@/components/wallet/FundsOnHoldCard";
import CashOutModal from "@/components/wallet/CashOutModal";
import ReleaseFundsModal from "@/components/wallet/ReleaseFundsModal";
import AuctionDepositHistoryCard from "@/components/wallet/AuctionDepositHistoryCard";
import { DirhamAmount } from "@/components/ui";
import { createWalletCashOut } from "@/services/wallet";
import {
  createBuyerAuctionDepositReleaseRequest,
  getBuyerAuctionDepositReleaseRequests,
  toAuctionCapacityNumber,
  type BuyerAuctionDepositReleaseRequest,
} from "@/services/marketplace";

export default function WalletPage() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const wallet = useWallet();
  const { capacity, refresh: refreshCapacity, applyCapacity } =
    useAuctionCapacity();
  const { startConversation } = useSupportChat();

  const [cashOutOpen, setCashOutOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [releaseRequests, setReleaseRequests] = useState<
    BuyerAuctionDepositReleaseRequest[]
  >([]);

  const loadReleaseRequests = useCallback(async () => {
    try {
      const response = await getBuyerAuctionDepositReleaseRequests(locale);
      setReleaseRequests(response.data.release_requests || []);
    } catch {
      setReleaseRequests([]);
    }
  }, [locale]);

  useEffect(() => {
    void loadReleaseRequests();
  }, [loadReleaseRequests]);

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
    <div className="min-h-screen" style={{ backgroundColor: getColor("background") }}>
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="mb-7">
            <h1
              className="text-[30px] sm:text-[36px] font-serif leading-tight mb-1.5"
              style={{ color: getColor("primaryText") }}
            >
              {t("wallet.page_title")}
            </h1>
            <p
              className="text-sm sm:text-base max-w-2xl"
              style={{ color: getColor("secondaryText") }}
            >
              {t("wallet.page_subtitle")}
            </p>
            {wallet.error && (
              <p className="text-sm mt-2" style={{ color: getColor("error") }}>
                {wallet.error}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-5 lg:gap-6 items-start">
            <div className="space-y-5">
              <WalletBalanceCard
                balance={wallet.availableBalance}
                onTopUp={() => router.push(`/${locale}/wallet/top-up`)}
                onCashOut={() => setCashOutOpen(true)}
              />
              <WalletActivityCard
                transactions={wallet.transactions}
                loading={wallet.loading}
              />
              <AuctionDepositHistoryCard />
              {releaseRequests.length > 0 && (
                <div
                  className="rounded-[20px] border p-5"
                  style={{
                    backgroundColor: getColor("surface"),
                    borderColor: getColor("border"),
                  }}
                >
                  <p
                    className="font-semibold mb-3"
                    style={{ color: getColor("primaryText") }}
                  >
                    {t("wallet.release_requests_title")}
                  </p>
                  <div className="space-y-2">
                    {releaseRequests.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-xl border px-4 py-3 flex items-center justify-between gap-3"
                        style={{ borderColor: getColor("border") }}
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: getColor("primaryText") }}
                          >
                            <DirhamAmount
                              amount={toAuctionCapacityNumber(request.amount)}
                              decimals={2}
                            />
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: getColor("mutedText") }}
                          >
                            {request.status_label || request.status}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {request.status === "pending" && (
                            <button
                              type="button"
                              className="text-[11px] font-medium underline underline-offset-2"
                              style={{ color: getColor("primary") }}
                              onClick={() =>
                                void startConversation({
                                  subject: t("support.release_context_subject"),
                                  body: `${t("wallet.release_requests_title")} #${request.id}`,
                                  context_type: "auction_deposit_release_request",
                                  context_id: request.id,
                                })
                              }
                            >
                              {t("support.contact_support")}
                            </button>
                          )}
                          {request.admin_note && (
                            <p
                              className="text-xs text-end max-w-[180px]"
                              style={{ color: getColor("secondaryText") }}
                            >
                              {request.admin_note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
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
        </div>
      </section>

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
          await Promise.all([
            wallet.refresh(),
            refreshCapacity(),
            loadReleaseRequests(),
          ]);
          toast.success(t("wallet.release_request_submitted"));
        }}
      />
    </div>
  );
}
