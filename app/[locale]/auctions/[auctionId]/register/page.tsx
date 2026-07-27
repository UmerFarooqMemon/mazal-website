"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  createAuctionDepositCheckout,
  getAuctionState,
  registerForAuction,
  type MarketplaceAuctionRegistration,
} from "@/services/marketplace";

function isDepositHeld(registration?: MarketplaceAuctionRegistration | null) {
  if (!registration) return false;
  const deposit = registration.deposit_status?.toLowerCase() || "";
  const status = registration.status?.toLowerCase() || "";
  return (
    deposit.includes("held") ||
    deposit.includes("confirm") ||
    deposit.includes("verified") ||
    status === "registered"
  );
}

export default function AuctionRegisterPage({
  params,
}: {
  params: Promise<{ auctionId: string }>;
}) {
  const { auctionId } = use(params);
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<DepositPaymentMethod>("card");
  const [mode, setMode] = useState<DepositPaymentMode>("single");
  const [summary, setSummary] = useState<AuctionSummaryData | null>(null);
  const [registration, setRegistration] =
    useState<MarketplaceAuctionRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingReturn, setPollingReturn] = useState(false);

  const refreshAuction = useCallback(async () => {
    const response = await getAuctionState(auctionId, locale);
    const auction = response.data.auction;
    const viewerRegistration = auction.viewer_registration ?? null;
    setRegistration(viewerRegistration);
    setSummary(mapToAuctionSummary(auction, viewerRegistration));
    return viewerRegistration;
  }, [auctionId, locale]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    refreshAuction()
      .then((viewerRegistration) => {
        if (!active) return;
        if (isDepositHeld(viewerRegistration)) {
          setStep(2);
        } else if (viewerRegistration) {
          setStep(1);
        }
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
  }, [refreshAuction]);

  // PayTabs browser return: poll until webhook marks deposit held.
  useEffect(() => {
    const isReturn = searchParams.get("auction_deposit_return") === "1";
    if (!isReturn) return;

    const failed = searchParams.get("paytabs_failed") === "1";
    if (failed) {
      setError(
        t("auctions.paytabs_failed") ||
          "Payment was not completed. Please try again.",
      );
      setStep(1);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    setPollingReturn(true);
    setStep(2);

    const poll = async () => {
      try {
        const viewerRegistration = await refreshAuction();
        if (cancelled) return;
        if (isDepositHeld(viewerRegistration)) {
          setPollingReturn(false);
          setStep(2);
          return;
        }
      } catch {
        // keep polling
      }

      attempts += 1;
      if (attempts >= 20) {
        if (!cancelled) {
          setPollingReturn(false);
          setError(
            t("auctions.deposit_pending_verification") ||
              "Payment received. Deposit verification is still processing — refresh shortly.",
          );
        }
        return;
      }

      if (!cancelled) {
        window.setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [refreshAuction, searchParams, t]);

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
      await refreshAuction();
      setStep(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register for auction.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaytabsCheckout = async () => {
    if (!registration) {
      setError("Registration is required before paying the deposit.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await createAuctionDepositCheckout(
        auctionId,
        registration.id,
        locale,
      );
      const redirectUrl = response.data.redirect_url;
      if (!redirectUrl) {
        throw new Error("Missing PayTabs checkout URL.");
      }
      window.location.href = redirectUrl;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start PayTabs checkout.",
      );
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

  const depositHeld = isDepositHeld(registration);

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
                onContinue={handlePaytabsCheckout}
                paytabsOnly
              />
            )}

            {step === 2 && (
              <DepositStatusStep
                method={method}
                variant={
                  pollingReturn || !depositHeld ? "awaiting" : "success"
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
                showCheckAmount={false}
              />
              <AuctionBenefitsCard />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
