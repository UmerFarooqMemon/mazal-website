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
  DepositPaymentSubmitPayload,
} from "@/components/auction/types";
import {
  createAuctionDepositCheckout,
  getAuctionBankInstructions,
  getAuctionDepositMethods,
  getAuctionState,
  registerForAuction,
  submitAuctionBankProof,
  submitAuctionCashCollection,
  submitAuctionManagersCheck,
  type MarketplaceAuctionBankInstructions,
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

function isPendingVerification(
  registration?: MarketplaceAuctionRegistration | null,
) {
  if (!registration) return false;
  return (
    registration.deposit_status?.toLowerCase() === "pending_verification"
  );
}

function mapApiMethodToUi(
  method?: string | null,
): DepositPaymentMethod | null {
  if (!method) return null;
  if (method === "bank_transfer") return "bank";
  if (method === "cash_collection") return "cash";
  if (method === "managers_check") return "managers_check";
  if (method === "card") return "card";
  return null;
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
  const [summary, setSummary] = useState<AuctionSummaryData | null>(null);
  const [registration, setRegistration] =
    useState<MarketplaceAuctionRegistration | null>(null);
  const [bankInstructions, setBankInstructions] =
    useState<MarketplaceAuctionBankInstructions | null>(null);
  const [custodyInstructions, setCustodyInstructions] =
    useState<MarketplaceAuctionBankInstructions | null>(null);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
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

  const loadDepositInstructions = useCallback(
    async (
      nextRegistration: MarketplaceAuctionRegistration,
      selectedMethod: DepositPaymentMethod,
    ) => {
      setInstructionsLoading(true);
      try {
        const catalog = await getAuctionDepositMethods(
          auctionId,
          nextRegistration.id,
          locale,
        );
        setBankInstructions(catalog.data.bank_instructions ?? null);

        const selectedApiKey =
          selectedMethod === "bank"
            ? "bank_transfer"
            : selectedMethod === "cash"
              ? "cash_collection"
              : selectedMethod;
        const selected = catalog.data.methods?.find(
          (item) => item.key === selectedApiKey,
        );
        const selectedInstructions = (selected?.instructions ||
          null) as MarketplaceAuctionBankInstructions | null;
        setCustodyInstructions(selectedInstructions);

        if (selectedMethod === "bank") {
          try {
            const bank = await getAuctionBankInstructions(
              auctionId,
              nextRegistration.id,
              locale,
            );
            setBankInstructions(bank.data.bank_instructions);
          } catch {
            // Catalog already includes bank_instructions fallback.
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load deposit instructions.",
        );
      } finally {
        setInstructionsLoading(false);
      }
    },
    [auctionId, locale],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    refreshAuction()
      .then((viewerRegistration) => {
        if (!active) return;
        if (isDepositHeld(viewerRegistration)) {
          setStep(2);
          return;
        }
        if (isPendingVerification(viewerRegistration)) {
          const uiMethod = mapApiMethodToUi(
            viewerRegistration?.deposit_method,
          );
          if (uiMethod) setMethod(uiMethod);
          setOfflineSubmitted(true);
          setStep(2);
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
  const pendingVerification =
    offlineSubmitted || isPendingVerification(registration);

  const handleMethodContinue = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const nextRegistration = await ensureRegistration();
      await loadDepositInstructions(nextRegistration, method);
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

  const handlePaymentContinue = async (
    payload: DepositPaymentSubmitPayload,
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      const nextRegistration = await ensureRegistration();
      if (!nextRegistration?.id) {
        throw new Error("Registration is required before paying the deposit.");
      }

      if (payload.method === "card") {
        await handlePaytabsCheckout(nextRegistration);
        return;
      }

      if (payload.method === "bank") {
        const response = await submitAuctionBankProof(
          auctionId,
          nextRegistration.id,
          locale,
          {
            payment_reference: payload.payment_reference,
            notes: payload.notes,
            evidence: payload.evidence,
          },
        );
        setRegistration(response.data.registration);
      } else if (payload.method === "managers_check") {
        const response = await submitAuctionManagersCheck(
          auctionId,
          nextRegistration.id,
          locale,
          {
            check_number: payload.check_number,
            collection_date: payload.collection_date,
            collection_time: payload.collection_time,
            notes: payload.notes,
          },
        );
        setRegistration(response.data.registration);
      } else {
        const response = await submitAuctionCashCollection(
          auctionId,
          nextRegistration.id,
          locale,
          {
            collection_date: payload.collection_date,
            collection_time: payload.collection_time,
            notes: payload.notes,
          },
        );
        setRegistration(response.data.registration);
      }

      await refreshAuction();
      setOfflineSubmitted(true);
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
      : pendingVerification && !depositHeld
        ? "awaiting"
        : depositHeld
          ? "success"
          : "awaiting";

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
                onBack={() => setStep(0)}
                onContinue={handlePaymentContinue}
                depositAmount={summary?.minimumDeposit}
                bankInstructions={bankInstructions}
                custodyInstructions={custodyInstructions}
                instructionsLoading={instructionsLoading}
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
