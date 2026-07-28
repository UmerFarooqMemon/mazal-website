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
  confirmAuctionDeposit,
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

function isOfflineMethod(method: DepositPaymentMethod) {
  return method === "bank" || method === "managers_check" || method === "cash";
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
  const [method, setMethod] = useState<DepositPaymentMethod>("bank");
  const [mode, setMode] = useState<DepositPaymentMode>("single");
  const [summary, setSummary] = useState<AuctionSummaryData | null>(null);
  const [registration, setRegistration] =
    useState<MarketplaceAuctionRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingReturn, setPollingReturn] = useState(false);
  const [offlineSubmitted, setOfflineSubmitted] = useState(false);

  const refreshAuction = useCallback(async () => {
    const response = await getAuctionState(auctionId, locale);
    const auction = response.data.auction;
    const viewerRegistration = auction.viewer_registration ?? null;
    setRegistration(viewerRegistration);
    setSummary(mapToAuctionSummary(auction, viewerRegistration));
    return viewerRegistration;
  }, [auctionId, locale]);

  const ensureRegistration = useCallback(async () => {
    if (registration?.id) return registration;

    const response = await registerForAuction(auctionId, locale);
    const nextRegistration = response.data.registration;
    setRegistration(nextRegistration);
    await refreshAuction();
    return nextRegistration;
  }, [auctionId, locale, refreshAuction, registration]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    refreshAuction()
      .then((viewerRegistration) => {
        if (!active) return;
        if (isDepositHeld(viewerRegistration)) {
          setStep(2);
        }
        // Keep step 0 so the user can pick one of the four deposit methods.
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
      setMethod("card");
      setStep(1);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    setPollingReturn(true);
    setMethod("card");
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
  const depositHeld = isDepositHeld(registration);
  const paymentReference = registration?.id
    ? `AUC-${auctionId}-${registration.id}`
    : undefined;

  const handleMethodContinue = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await ensureRegistration();
      setStep(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register for auction.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaytabsCheckout = async (
    nextRegistration: MarketplaceAuctionRegistration,
  ) => {
    const response = await createAuctionDepositCheckout(
      auctionId,
      nextRegistration.id,
      locale,
    );
    const redirectUrl = response.data.redirect_url;
    if (!redirectUrl) {
      throw new Error("Missing PayTabs checkout URL.");
    }
    window.location.href = redirectUrl;
  };

  const handleOfflineSubmit = async (
    nextRegistration: MarketplaceAuctionRegistration,
  ) => {
    // Production auction deposits are PayTabs-only. Offline methods:
    // 1) Try local confirm-deposit when MARKETPLACE_FAKE_AUCTION_DEPOSITS is on
    // 2) Otherwise show awaiting/pending verification UI
    try {
      const response = await confirmAuctionDeposit(
        auctionId,
        nextRegistration.id,
        locale,
        paymentReference || `${method}-${Date.now()}`,
      );
      setRegistration(response.data.registration);
      await refreshAuction();
    } catch (err) {
      // Offline evidence APIs are not on backend yet — still advance to awaiting.
      console.warn("confirm-deposit unavailable for offline method:", err);
    } finally {
      setOfflineSubmitted(true);
      setStep(2);
    }
  };

  const handlePaymentContinue = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const nextRegistration = await ensureRegistration();
      if (!nextRegistration?.id) {
        throw new Error("Registration is required before paying the deposit.");
      }

      if (method === "card") {
        await handlePaytabsCheckout(nextRegistration);
        // Keep submitting=true while redirecting to PayTabs.
        return;
      }

      if (isOfflineMethod(method)) {
        await handleOfflineSubmit(nextRegistration);
        return;
      }

      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to continue deposit payment.",
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

  const statusVariant =
    pollingReturn || (method === "card" && !depositHeld)
      ? "awaiting"
      : offlineSubmitted && !depositHeld
        ? "awaiting"
        : depositHeld
          ? "success"
          : isOfflineMethod(method)
            ? "awaiting"
            : "success";

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
                onContinue={handleMethodContinue}
                submitting={submitting}
              />
            )}

            {step === 1 && (
              <DepositPaymentStep
                method={method}
                mode={mode}
                onModeChange={setMode}
                onBack={() => setStep(0)}
                onContinue={handlePaymentContinue}
                depositAmount={summary?.minimumDeposit}
                paymentReference={paymentReference}
                submitting={submitting}
              />
            )}

            {step === 2 && (
              <DepositStatusStep method={method} variant={statusVariant} />
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
                showCheckAmount={method === "managers_check"}
              />
              <AuctionBenefitsCard />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
