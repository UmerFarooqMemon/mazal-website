"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import type { StepItem } from "@/components/private-deal/Stepper";
import DepositFlowHeader from "@/components/auction/DepositFlowHeader";
import DepositMethodStep from "@/components/auction/DepositMethodStep";
import DepositPaymentStep from "@/components/auction/DepositPaymentStep";
import DepositStatusStep from "@/components/auction/DepositStatusStep";
import AuctionSummaryCard from "@/components/auction/AuctionSummaryCard";
import AuctionBenefitsCard from "@/components/auction/AuctionBenefitsCard";
import { DEFAULT_AUCTION_SUMMARY } from "@/components/auction/mockData";
import type {
  DepositPaymentMethod,
  DepositPaymentMode,
} from "@/components/auction/types";

export default function AuctionRegisterPage({
  params,
}: {
  params: Promise<{ auctionId: string }>;
}) {
  use(params);
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const isRTL = locale === "ar";

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<DepositPaymentMethod>("bank");
  const [mode, setMode] = useState<DepositPaymentMode>("single");

  const steps: StepItem[] = useMemo(() => {
    const labels = [
      t("auctions.step_deposit"),
      t("auctions.step_payment"),
      t("auctions.step_verification"),
    ];
    return labels.map((label, index) => ({
      key: `deposit-${index}`,
      label,
      status:
        step > index ? "completed" : step === index ? "current" : "upcoming",
    }));
  }, [step, t]);

  const showSidebar = step < 2;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <DepositFlowHeader steps={steps} />
      </section>

      <section
        className="px-4 sm:px-6 lg:px-8 pb-16"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, #F2F8F3 48px, #F2F8F3 100%)",
        }}
      >
        <div
          className={`max-w-6xl mx-auto ${
            showSidebar
              ? "grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] gap-5 lg:gap-6 items-start"
              : ""
          }`}
        >
          <div>
            {step === 0 && (
              <DepositMethodStep
                method={method}
                onMethodChange={setMethod}
                onBack={() => router.back()}
                onContinue={() => setStep(1)}
              />
            )}

            {step === 1 && (
              <DepositPaymentStep
                method={method}
                mode={mode}
                onModeChange={setMode}
                onBack={() => setStep(0)}
                onContinue={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <DepositStatusStep
                method={method}
                variant={
                  method === "managers_check" || method === "cash"
                    ? "awaiting"
                    : "success"
                }
              />
            )}
          </div>

          {showSidebar && (
            <div
              className={`space-y-4 ${isRTL ? "lg:order-first" : ""}`}
            >
              <AuctionSummaryCard
                data={DEFAULT_AUCTION_SUMMARY}
                showCheckAmount={step === 1 && method === "card"}
              />
              <AuctionBenefitsCard />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
