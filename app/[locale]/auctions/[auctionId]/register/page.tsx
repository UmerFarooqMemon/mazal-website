"use client";

import { use, useEffect, useMemo, useState } from "react";
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
import { mapToAuctionSummary } from "@/components/auction/mappers";
import type {
  AuctionSummaryData,
  DepositPaymentMethod,
  DepositPaymentMode,
} from "@/components/auction/types";
import {
  confirmAuctionDeposit,
  getAuctionState,
  registerForAuction,
  type MarketplaceAuctionRegistration,
} from "@/services/marketplace";

export default function AuctionRegisterPage({
  params,
}: {
  params: Promise<{ auctionId: string }>;
}) {
  const { auctionId } = use(params);
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<DepositPaymentMethod>("bank");
  const [mode, setMode] = useState<DepositPaymentMode>("single");
  const [summary, setSummary] = useState<AuctionSummaryData | null>(null);
  const [registration, setRegistration] =
    useState<MarketplaceAuctionRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getAuctionState(auctionId, locale)
      .then((response) => {
        if (!active) return;
        const auction = response.data.auction;
        const viewerRegistration = auction.viewer_registration ?? null;
        setRegistration(viewerRegistration);
        setSummary(mapToAuctionSummary(auction, viewerRegistration));
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load auction.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [auctionId, locale]);

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

  const handleRegister = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await registerForAuction(auctionId, locale);
      const nextRegistration = response.data.registration;
      setRegistration(nextRegistration);
      const auctionResponse = await getAuctionState(auctionId, locale);
      setSummary(
        mapToAuctionSummary(
          auctionResponse.data.auction,
          nextRegistration,
        ),
      );
      setStep(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register for auction.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeposit = async () => {
    if (!registration) {
      setError("Registration is required before confirming deposit.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const paymentReference = `${method}-${Date.now()}`;
      const response = await confirmAuctionDeposit(
        auctionId,
        registration.id,
        locale,
        paymentReference,
      );
      const nextRegistration = response.data.registration;
      setRegistration(nextRegistration);
      const auctionResponse = await getAuctionState(auctionId, locale);
      setSummary(
        mapToAuctionSummary(
          auctionResponse.data.auction,
          nextRegistration,
        ),
      );
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to confirm deposit.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

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
            {error && (
              <p className="text-sm mb-4" style={{ color: "#DC2626" }}>
                {error}
              </p>
            )}

            {step === 0 && (
              <DepositMethodStep
                method={method}
                onMethodChange={setMethod}
                onBack={() => router.back()}
                onContinue={handleRegister}
              />
            )}

            {step === 1 && (
              <DepositPaymentStep
                method={method}
                mode={mode}
                onModeChange={setMode}
                onBack={() => setStep(0)}
                onContinue={handleConfirmDeposit}
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

            {submitting && step < 2 && (
              <p
                className="text-sm mt-3"
                style={{ color: getColor("mutedText") }}
              >
                {t("common.loading") || "Loading..."}
              </p>
            )}
          </div>

          {showSidebar && summary && (
            <div className="space-y-4">
              <AuctionSummaryCard
                data={summary}
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
