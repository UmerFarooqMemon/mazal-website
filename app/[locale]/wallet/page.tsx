"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useWallet } from "@/hooks/useWallet";
import WalletBalanceCard from "@/components/wallet/WalletBalanceCard";
import WalletActivityCard from "@/components/wallet/WalletActivityCard";
import WalletBenefitsCard from "@/components/wallet/WalletBenefitsCard";
import FundsOnHoldCard from "@/components/wallet/FundsOnHoldCard";
import CashOutModal from "@/components/wallet/CashOutModal";
import ReleaseFundsModal from "@/components/wallet/ReleaseFundsModal";
import { WALLET_PAGE_BG } from "@/components/wallet/theme";
import { createWalletCashOut } from "@/services/wallet";
import { releaseAuctionDepositToWallet } from "@/services/marketplace";

export default function WalletPage() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const wallet = useWallet();

  const [cashOutOpen, setCashOutOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: WALLET_PAGE_BG }}>
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
                heldAmount={wallet.heldAmount}
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
        holds={wallet.holds}
        heldAmount={wallet.heldAmount}
        onConfirm={async (hold, amount) => {
          await releaseAuctionDepositToWallet(
            hold.listingId,
            hold.sourceId,
            locale,
            {
              amount: amount.toFixed(2),
              idempotency_key: `release-${hold.sourceId}-${Date.now()}`,
            },
          );
          await wallet.refresh();
          toast.success(t("wallet.release_success"));
        }}
      />
    </div>
  );
}
