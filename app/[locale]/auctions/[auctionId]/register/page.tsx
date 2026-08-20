"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import type { StepItem } from "@/components/private-deal/Stepper";
import toast from "react-hot-toast";
import DepositFlowHeader from "@/components/auction/DepositFlowHeader";
import BeneficiaryInformation from "@/components/ui/BeneficiaryInformation";
import DepositStatusStep from "@/components/auction/DepositStatusStep";
import AuctionSummaryCard from "@/components/auction/AuctionSummaryCard";
import AuctionBenefitsCard from "@/components/auction/AuctionBenefitsCard";
import WalletPaymentModal from "@/components/wallet/WalletPaymentModal";
import { formatPriceInput } from "@/lib/card-input";
import SplitPaymentProcessStep from "@/components/private-deal/SplitPaymentProcessStep";
import { useWalletPaymentChoice } from "@/hooks/useWalletPaymentChoice";
import PaymentMethodStep, {
  type PaymentMethod,
  type SplitPaymentEntry,
} from "@/components/private-deal/PaymentMethodStep";
import { mapToAuctionSummary } from "@/components/auction/mappers";
import type {
  AuctionSummaryData,
  DepositPaymentSubmitPayload,
} from "@/components/auction/types";
import {
  createBuyerAuctionDeposit,
  createBuyerAuctionDepositCheckout,
  getAuctionCapacity,
  getAuctionState,
  getBuyerAuctionDepositMethods,
  getBuyerAuctionDeposits,
  payBuyerAuctionDepositWithWallet,
  submitBuyerAuctionBankProof,
  submitBuyerAuctionCashCollection,
  submitBuyerAuctionManagersCheck,
  toAuctionCapacityNumber,
  type MarketplaceAuctionBankInstructions,
  type BuyerAuctionDepositPayment,
  type MarketplaceAuctionDepositMethod,
} from "@/services/marketplace";
import { useAuctionCapacity } from "@/context/AuctionCapacityContext";
import { handlePayTabsCheckoutResult } from "@/lib/paytabs";

function parseMoneyInput(value: string) {
  const parsed = Number(String(value).replace(/\D/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasActiveBuyerDeposit(
  heldDeposit: number,
  minDeposit: number,
): boolean {
  return heldDeposit >= minDeposit && minDeposit > 0;
}

function isPaymentPending(payment?: BuyerAuctionDepositPayment | null) {
  if (!payment) return false;
  const status = payment.status?.toLowerCase() || "";
  return (
    status.includes("pending") ||
    status.includes("await") ||
    status.includes("verification")
  );
}

export default function AuctionRegisterPage({
  params,
}: {
  params: Promise<{ auctionId: string }>;
}) {
  const { auctionId } = use(params);
  const { t, locale } = useLocale();
  const { getColor, cashChequeCollectionFeeAmount } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { capacity, refresh: refreshCapacity, applyCapacity } =
    useAuctionCapacity();

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("bank");
  const [splitPayments, setSplitPayments] = useState<SplitPaymentEntry[]>([]);
  const [summary, setSummary] = useState<AuctionSummaryData | null>(null);
  const [depositPayment, setDepositPayment] =
    useState<BuyerAuctionDepositPayment | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
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
  const [walletPaid, setWalletPaid] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [depositInput, setDepositInput] = useState("");
  const [depositCollectionFee, setDepositCollectionFee] = useState<
    string | null
  >(null);
  const [depositMethodFees, setDepositMethodFees] = useState<
    MarketplaceAuctionDepositMethod[]
  >([]);
  const minDeposit = summary?.minimumDeposit ?? 0;
  const chosenAmount = Math.max(parseMoneyInput(depositInput), minDeposit);
  const amountRef = useRef(chosenAmount);
  amountRef.current = chosenAmount;
  // Keep capacity out of refreshAuction deps — applying capacity must not
  // recreate the callback or the mount effect will loop forever.
  const capacityRef = useRef(capacity);
  capacityRef.current = capacity;
  const walletChoice = useWalletPaymentChoice(chosenAmount);

  useEffect(() => {
    if (minDeposit <= 0) return;
    setDepositInput((prev) => {
      const current = parseMoneyInput(prev);
      if (!prev || current < minDeposit) {
        return formatPriceInput(String(minDeposit));
      }
      return prev;
    });
  }, [minDeposit]);

  const refreshAuction = useCallback(async () => {
    const [auctionResponse, capacityResponse] = await Promise.all([
      getAuctionState(auctionId, locale),
      getAuctionCapacity(locale).catch(() => null),
    ]);
    const auction = auctionResponse.data.auction;
    const previousCapacity = capacityRef.current;
    const nextCapacity =
      capacityResponse?.data.auction_capacity ??
      auction.viewer_auction_capacity ??
      previousCapacity;
    if (nextCapacity) {
      applyCapacity(nextCapacity);
    }
    const viewerRegistration = auction.viewer_registration ?? null;
    setSummary(
      mapToAuctionSummary(
        auction,
        viewerRegistration,
        nextCapacity ?? previousCapacity,
      ),
    );
    return nextCapacity;
  }, [applyCapacity, auctionId, locale]);

  const ensureDepositPayment = useCallback(async () => {
    if (paymentId) {
      return { id: paymentId, ...depositPayment };
    }

    const response = await createBuyerAuctionDeposit(locale, amountRef.current);
    const payment = response.data.payment;
    const catalogFee =
      response.data.cash_cheque_collection_fee_amount ??
      response.data.catalog?.cash_cheque_collection_fee_amount;
    if (catalogFee) setDepositCollectionFee(catalogFee);
    if (response.data.catalog?.methods?.length) {
      setDepositMethodFees(response.data.catalog.methods);
    }
    if (response.data.auction_capacity) {
      applyCapacity(response.data.auction_capacity);
    }
    setDepositPayment(payment);
    setPaymentId(payment.id);
    await refreshAuction();
    return payment;
  }, [
    applyCapacity,
    depositPayment,
    locale,
    paymentId,
    refreshAuction,
  ]);

  const loadDepositInstructions = useCallback(
    async (nextPaymentId: number, selectedMethod: PaymentMethod) => {
      setInstructionsLoading(true);
      try {
        const catalogResponse = await getBuyerAuctionDepositMethods(
          nextPaymentId,
          locale,
        );
        const catalog =
          catalogResponse.data.catalog ?? catalogResponse.data;
        const methods = catalog.methods ?? catalogResponse.data.methods ?? [];
        const fee =
          catalog.cash_cheque_collection_fee_amount ??
          catalogResponse.data.cash_cheque_collection_fee_amount;
        if (fee) setDepositCollectionFee(fee);
        if (methods.length) setDepositMethodFees(methods);
        setBankInstructions(
          (catalog.bank_instructions ??
            catalogResponse.data.bank_instructions ??
            null) as MarketplaceAuctionBankInstructions | null,
        );

        const selectedApiKey =
          selectedMethod === "bank"
            ? "bank_transfer"
            : selectedMethod === "cash"
              ? "cash_collection"
              : selectedMethod;
        const selected = methods.find((item) => item.key === selectedApiKey);
        const selectedInstructions = (selected?.instructions ||
          null) as MarketplaceAuctionBankInstructions | null;
        setCustodyInstructions(selectedInstructions);
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
    [locale],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    // Always land on payment methods so users can top up again, even if they
    // already hold a deposit. Success/awaiting (step 2) is only shown after an
    // in-session payment or the PayTabs return handler below.
    refreshAuction()
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
        const [nextCapacity, depositsResponse] = await Promise.all([
          refreshAuction(),
          getBuyerAuctionDeposits(locale).catch(() => null),
        ]);
        if (cancelled) return;

        const heldPayment = depositsResponse?.data.payments?.find(
          (item) => String(item.status || "").toLowerCase() === "held",
        );
        if (heldPayment) {
          setDepositPayment(heldPayment);
          if (depositsResponse?.data.auction_capacity) {
            applyCapacity(depositsResponse.data.auction_capacity);
          }
          setPollingReturn(false);
          setStep(2);
          return;
        }

        const held = toAuctionCapacityNumber(nextCapacity?.held_deposit);
        const min = toAuctionCapacityNumber(
          nextCapacity?.min_deposit ?? minDeposit,
        );
        if (hasActiveBuyerDeposit(held, min)) {
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
  }, [applyCapacity, locale, refreshAuction, searchParams, t]);

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
  const heldDeposit = toAuctionCapacityNumber(capacity?.held_deposit);
  const depositHeld =
    walletPaid || hasActiveBuyerDeposit(heldDeposit, minDeposit);
  const pendingVerification =
    offlineSubmitted || isPaymentPending(depositPayment);

  const handleWalletClick = () => {
    if (submitting) return;
    walletChoice.selectWalletOrRedirect(() => {
      setMethod("wallet");
      setWalletModalOpen(true);
    });
  };

  const handleMethodContinue = async () => {
    if (method === "wallet") {
      handleWalletClick();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payment = await ensureDepositPayment();
      await loadDepositInstructions(payment.id, method);
      setStep(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start auction deposit.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalletPaid = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payment = await ensureDepositPayment();
      const response = await payBuyerAuctionDepositWithWallet(
        payment.id,
        locale,
        { amount: amountRef.current },
      );
      if (response.data.auction_capacity) {
        applyCapacity(response.data.auction_capacity);
      }
      if (response.data.payment) {
        setDepositPayment(response.data.payment);
      }
      setWalletPaid(true);
      setOfflineSubmitted(true);
      setStep(2);
      toast.success(t("wallet.paid_from_wallet"));
      await refreshAuction();
      await refreshCapacity();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("wallet.pay_failed"),
      );
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaytabsCheckout = async (
    nextPaymentId: number,
    paymentToken?: string,
  ) => {
    const amount = amountRef.current;
    const response = await createBuyerAuctionDepositCheckout(
      nextPaymentId,
      locale,
      paymentToken
        ? { payment_token: paymentToken, amount }
        : { amount },
    );

    handlePayTabsCheckoutResult(response.data, {
      onImmediateSuccess: async () => {
        if (response.data.payment) {
          setDepositPayment(response.data.payment);
        }
        if (response.data.auction_capacity) {
          applyCapacity(response.data.auction_capacity);
        }
        await refreshAuction();
        await refreshCapacity();
        if (response.data.payment?.status === "held") {
          setStep(2);
          toast.success(
            t("auctions.deposit_success") ||
              "Auction deposit paid successfully.",
          );
        } else {
          setStep(2);
        }
      },
      onRedirect: () => {
        toast.success(
          t("listings.redirecting_paytabs") ||
            "Redirecting to secure payment…",
        );
      },
    });
  };

  const handleCardPay = async (paymentToken: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const payment = await ensureDepositPayment();
      if (!payment?.id) {
        throw new Error("Deposit payment is required before checkout.");
      }
      await handlePaytabsCheckout(payment.id, paymentToken);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("auctions.paytabs_failed") ||
              "Payment was not completed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentContinue = async (
    payload: DepositPaymentSubmitPayload,
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      const payment = await ensureDepositPayment();
      if (!payment?.id) {
        throw new Error("Deposit payment is required before paying.");
      }

      if (payload.method === "card") {
        await handlePaytabsCheckout(payment.id);
        return;
      }

      const amount = payload.amount;

      if (payload.method === "bank") {
        const response = await submitBuyerAuctionBankProof(
          payment.id,
          locale,
          {
            amount,
            payment_reference: payload.payment_reference,
            notes: payload.notes,
            evidence: payload.evidence,
          },
        );
        if (response.data.payment) setDepositPayment(response.data.payment);
        if (response.data.auction_capacity) {
          applyCapacity(response.data.auction_capacity);
        }
      } else if (payload.method === "managers_check") {
        const response = await submitBuyerAuctionManagersCheck(
          payment.id,
          locale,
          {
            amount,
            check_number: payload.check_number,
            collection_slot_id: payload.collection_slot_id,
            pickup_address: payload.pickup_address,
            notes: payload.notes,
          },
        );
        if (response.data.payment) setDepositPayment(response.data.payment);
        if (response.data.auction_capacity) {
          applyCapacity(response.data.auction_capacity);
        }
      } else {
        const response = await submitBuyerAuctionCashCollection(
          payment.id,
          locale,
          {
            amount,
            collection_slot_id: payload.collection_slot_id,
            pickup_address: payload.pickup_address,
            notes: payload.notes,
          },
        );
        if (response.data.payment) setDepositPayment(response.data.payment);
        if (response.data.auction_capacity) {
          applyCapacity(response.data.auction_capacity);
        }
      }

      await refreshAuction();
      await refreshCapacity();
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

  const depositProcessPayment: SplitPaymentEntry | null =
    method === "wallet"
      ? null
      : {
          id: "auction-deposit",
          method,
          amount: chosenAmount,
          notes: "",
          status: "awaiting",
          createdAt: new Date().toISOString(),
        };

  const depositCustodyInstructions: Record<string, unknown> = {
    ...(custodyInstructions || {}),
    iban: bankInstructions?.iban || custodyInstructions?.iban,
    bank_name: bankInstructions?.bank_name || custodyInstructions?.bank_name,
    account_holder_name:
      bankInstructions?.account_holder_name ||
      custodyInstructions?.account_holder_name,
    collection_location: custodyInstructions?.collection_location,
    collection_address: custodyInstructions?.collection_address,
  };

  const handleProcessComplete = async (payload: {
    paymentReference?: string;
    senderBankName?: string;
    senderAccountLast4?: string;
    notes?: string;
    evidence?: File | null;
    checkNumber?: string;
    collectionSlotId?: number;
    pickupAddress?: string;
    amount?: number;
  }) => {
    if (payload.amount != null && Number.isFinite(payload.amount)) {
      const next = Math.max(payload.amount, minDeposit);
      amountRef.current = next;
      setDepositInput(formatPriceInput(String(next)));
    }

    const amount = Math.max(amountRef.current, minDeposit);

    if (method === "wallet") return;

    if (method === "card") {
      await handlePaymentContinue({ method: "card", amount });
      return;
    }

    if (method === "bank") {
      if (!payload.evidence) {
        setError(
          t("private-deal.error_evidence_required") ||
            "Payment evidence is required.",
        );
        return;
      }
      await handlePaymentContinue({
        method: "bank",
        amount,
        payment_reference: payload.paymentReference || "",
        notes: payload.notes,
        evidence: payload.evidence,
      });
      return;
    }

    if (method === "managers_check") {
      await handlePaymentContinue({
        method: "managers_check",
        amount,
        check_number: payload.checkNumber || "",
        collection_slot_id: payload.collectionSlotId || 0,
        pickup_address: payload.pickupAddress || "",
        notes: payload.notes,
      });
      return;
    }

    await handlePaymentContinue({
      method: "cash",
      amount,
      collection_slot_id: payload.collectionSlotId || 0,
      pickup_address: payload.pickupAddress || "",
      notes: payload.notes,
    });
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
              <PaymentMethodStep
                method={method}
                mode="single"
                allowSplit={false}
                totalAmount={minDeposit}
                splitPayments={splitPayments}
                collectionFeeAmount={
                  depositCollectionFee ?? cashChequeCollectionFeeAmount
                }
                paymentMethodFees={depositMethodFees}
                onMethodChange={setMethod}
                onModeChange={() => undefined}
                onSplitPaymentsChange={setSplitPayments}
                onBack={() => router.back()}
                onContinue={handleMethodContinue}
                onWalletClick={handleWalletClick}
                onProcessSplit={() => undefined}
                saving={submitting}
              />
            )}

            {step === 1 && method !== "wallet" && depositProcessPayment && (
              <SplitPaymentProcessStep
                payment={depositProcessPayment}
                collectionFeeAmount={
                  depositCollectionFee ?? cashChequeCollectionFeeAmount
                }
                custodyInstructions={depositCustodyInstructions}
                submitting={submitting || instructionsLoading}
                minAmount={minDeposit}
                onAmountChange={(amount) => {
                  const next = Math.max(amount, minDeposit);
                  amountRef.current = next;
                  setDepositInput(formatPriceInput(String(next)));
                }}
                onBack={() => setStep(0)}
                onComplete={handleProcessComplete}
                onCardPay={handleCardPay}
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
                data={{
                  ...summary,
                  targetBiddingLimit:
                    toAuctionCapacityNumber(capacity?.max_bidding_limit) ||
                    chosenAmount *
                      (capacity?.multiplier ?? 5),
                }}
                showCheckAmount={method === "managers_check"}
              />
              {method === "bank" && (
                <BeneficiaryInformation
                  beneficiaryName={
                    bankInstructions?.account_holder_name ||
                    bankInstructions?.recipient
                  }
                  iban={bankInstructions?.iban}
                  accountNumber={bankInstructions?.account_number}
                />
              )}
              <AuctionBenefitsCard />
            </div>
          )}
        </div>
      </section>

      <WalletPaymentModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        amountDue={chosenAmount}
        reference={t("auctions.summary_min_deposit")}
        onPaid={handleWalletPaid}
      />
    </div>
  );
}
