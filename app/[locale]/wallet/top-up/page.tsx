"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamSymbolIcon, Input } from "@/components/ui";
import BeneficiaryInformation from "@/components/ui/BeneficiaryInformation";
import type { StepItem } from "@/components/private-deal/Stepper";
import WalletFlowHeader from "@/components/wallet/WalletFlowHeader";
import { useWallet } from "@/hooks/useWallet";
import { formatPriceInput } from "@/lib/card-input";
import {
  createWalletDeposit,
  createWalletPayTabsCheckout,
  getWalletDeposit,
  submitWalletOfflinePayment,
  type WalletCustodyInstructions,
  type WalletDeposit,
  type WalletDepositMethod,
  type WalletDepositPayment,
} from "@/services/wallet";
import { usePayTabsConfig } from "@/hooks/usePayTabsConfig";
import PayTabsManagedForm from "@/components/payments/PayTabsManagedForm";
import { handlePayTabsCheckoutResult } from "@/lib/paytabs";

type TopUpStep = 0 | 1 | 2;

const METHOD_ICONS: Record<
  string,
  typeof CreditCard
> = {
  card: CreditCard,
  bank_transfer: Building2,
  managers_check: FileText,
  cash_collection: Banknote,
};

export default function WalletTopUpPage() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wallet = useWallet();
  const paytabs = usePayTabsConfig(locale);
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const methodsFromApi = wallet.paymentMethods.length
    ? wallet.paymentMethods
    : [
        { key: "card", label: t("wallet.method_card") },
        { key: "bank_transfer", label: t("wallet.method_bank") },
        { key: "managers_check", label: t("wallet.method_cheque") },
        { key: "cash_collection", label: t("wallet.method_cash") },
      ];

  const [step, setStep] = useState<TopUpStep>(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WalletDepositMethod>("card");
  const [deposit, setDeposit] = useState<WalletDeposit | null>(null);
  const [activePayment, setActivePayment] = useState<WalletDepositPayment | null>(
    null,
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [senderBankName, setSenderBankName] = useState("");
  const [senderAccountLast4, setSenderAccountLast4] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [collectionTime, setCollectionTime] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [collectionNotes, setCollectionNotes] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [donePending, setDonePending] = useState(false);

  const minDeposit = wallet.limits?.min_deposit ?? 100;
  const maxDeposit = wallet.limits?.max_deposit ?? 5_000_000;
  const parsedAmount = amount.replace(/\D/g, "")
    ? Number(amount.replace(/\D/g, ""))
    : NaN;

  useEffect(() => {
    if (methodsFromApi[0]?.key && !methodsFromApi.some((m) => m.key === method)) {
      setMethod(methodsFromApi[0].key as WalletDepositMethod);
    }
  }, [method, methodsFromApi]);

  const refreshWallet = wallet.refresh;

  // Resume / poll after PayTabs browser return (lands on wallet; also support deposit_id on top-up).
  useEffect(() => {
    const depositId = searchParams.get("deposit_id");
    if (!depositId) return;
    let cancelled = false;
    let tries = 0;

    const poll = async () => {
      try {
        const response = await getWalletDeposit(depositId, locale);
        if (cancelled) return;
        const next = response.data.deposit;
        setDeposit(next);
        if (next.status === "funded") {
          setDone(true);
          setDonePending(false);
          setStep(2);
          await refreshWallet();
          toast.success(t("wallet.topup_funded"));
          return;
        }
        if (
          next.payments?.every((p) =>
            ["funded", "pending_verification", "rejected"].includes(p.status),
          )
        ) {
          setDone(true);
          setDonePending(next.status !== "funded");
          setStep(2);
        }
        tries += 1;
        if (tries < 12) {
          window.setTimeout(() => void poll(), 2500);
        }
      } catch {
        tries += 1;
        if (tries < 8) {
          window.setTimeout(() => void poll(), 2500);
        }
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [locale, refreshWallet, searchParams, t]);

  const steps: StepItem[] = useMemo(() => {
    const labels = [
      t("wallet.step_select_payment"),
      t("wallet.step_payment_details"),
      t("wallet.step_submit_request"),
    ];
    return labels.map((label, index) => ({
      key: `topup-${index}`,
      label,
      status:
        done || step > index
          ? "completed"
          : step === index
            ? "current"
            : "upcoming",
    }));
  }, [done, step, t]);

  const custody: WalletCustodyInstructions | null =
    activePayment?.custody_instructions || null;

  const goBack = () => {
    if (done) {
      router.push(`/${locale}/wallet`);
      return;
    }
    if (step === 0) {
      router.push(`/${locale}/wallet`);
      return;
    }
    setStep((prev) => (prev - 1) as TopUpStep);
    setError("");
  };

  const createDepositAndContinue = async () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount < minDeposit) {
      setError(
        t("wallet.topup_invalid_amount_range").replace(
          "{min}",
          String(minDeposit),
        ),
      );
      return;
    }
    if (parsedAmount > maxDeposit) {
      setError(t("wallet.topup_amount_too_high"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await createWalletDeposit(locale, {
        amount: parsedAmount,
        payments: [{ method, amount: parsedAmount }],
      });
      const nextDeposit = response.data.deposit;
      const payment = nextDeposit.payments?.[0] || null;
      setDeposit(nextDeposit);
      setActivePayment(payment);

      if (method === "card" && payment) {
        if (paytabs.managedFormEnabled && paytabs.clientKey) {
          setStep(1);
          setSubmitting(false);
          return;
        }

        const checkout = await createWalletPayTabsCheckout(
          nextDeposit.id,
          payment.id,
          locale,
        );
        handlePayTabsCheckoutResult(checkout.data, {
          onRedirect: () => {
            toast.success(
              t("listings.redirecting_paytabs") ||
                "Redirecting to secure payment…",
            );
          },
          onImmediateSuccess: async () => {
            setDone(true);
            setDonePending(false);
            setStep(2);
            await refreshWallet();
            toast.success(t("wallet.topup_funded"));
          },
        });
        return;
      }

      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("wallet.topup_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const submitOffline = async () => {
    if (!deposit || !activePayment) {
      setError(t("wallet.topup_failed"));
      return;
    }

    const formData = new FormData();
    formData.append("method", activePayment.method);

    if (activePayment.method === "bank_transfer") {
      if (!paymentReference.trim()) {
        setError(t("wallet.payment_reference_required"));
        return;
      }
      if (!evidence) {
        setError(t("wallet.evidence_required"));
        return;
      }
      formData.append("payment_reference", paymentReference.trim());
      if (senderBankName.trim()) {
        formData.append("sender_bank_name", senderBankName.trim());
      }
      if (senderAccountLast4.trim()) {
        formData.append("sender_account_last4", senderAccountLast4.trim());
      }
      formData.append("evidence", evidence);
    }

    if (activePayment.method === "managers_check") {
      if (!checkNumber.trim()) {
        setError(t("wallet.check_number_required"));
        return;
      }
      if (!pickupAddress.trim()) {
        setError(t("wallet.pickup_address_required"));
        return;
      }
      formData.append("check_number", checkNumber.trim());
      formData.append("pickup_address", pickupAddress.trim());
      if (collectionDate) formData.append("collection_date", collectionDate);
      if (collectionTime) formData.append("collection_time", collectionTime);
      if (collectionNotes.trim()) {
        formData.append("collection_notes", collectionNotes.trim());
      }
      if (evidence) formData.append("evidence", evidence);
    }

    if (activePayment.method === "cash_collection") {
      if (!pickupAddress.trim()) {
        setError(t("wallet.pickup_address_required"));
        return;
      }
      formData.append("pickup_address", pickupAddress.trim());
      if (collectionDate) formData.append("collection_date", collectionDate);
      if (collectionTime) formData.append("collection_time", collectionTime);
      if (collectionNotes.trim()) {
        formData.append("collection_notes", collectionNotes.trim());
      }
      if (evidence) formData.append("evidence", evidence);
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await submitWalletOfflinePayment(
        deposit.id,
        activePayment.id,
        locale,
        formData,
      );
      setDeposit(response.data.deposit);
      setActivePayment(response.data.payment);
      setDone(true);
      setDonePending(true);
      setStep(2);
      toast.success(t("wallet.topup_pending_verification"));
      await wallet.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("wallet.topup_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPay = async (paymentToken: string) => {
    if (!deposit || !activePayment) {
      setError(t("wallet.topup_failed"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const checkout = await createWalletPayTabsCheckout(
        deposit.id,
        activePayment.id,
        locale,
        { payment_token: paymentToken },
      );

      handlePayTabsCheckoutResult(checkout.data, {
        onImmediateSuccess: async () => {
          if (checkout.data.deposit) {
            setDeposit(checkout.data.deposit);
          }
          setDone(true);
          setDonePending(false);
          setStep(2);
          await refreshWallet();
          toast.success(t("wallet.topup_funded"));
        },
        onRedirect: () => {
          toast.success(
            t("listings.redirecting_paytabs") ||
              "Redirecting to secure payment…",
          );
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("wallet.topup_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleHostedCardCheckout = async () => {
    if (!deposit || !activePayment) {
      setError(t("wallet.topup_failed"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const checkout = await createWalletPayTabsCheckout(
        deposit.id,
        activePayment.id,
        locale,
      );
      handlePayTabsCheckoutResult(checkout.data, {
        onImmediateSuccess: async () => {
          if (checkout.data.deposit) {
            setDeposit(checkout.data.deposit);
          }
          setDone(true);
          setDonePending(false);
          setStep(2);
          await refreshWallet();
          toast.success(t("wallet.topup_funded"));
        },
        onRedirect: () => {
          toast.success(
            t("listings.redirecting_paytabs") ||
              "Redirecting to secure payment…",
          );
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("wallet.topup_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    setError("");
    if (step === 0) {
      void createDepositAndContinue();
      return;
    }
    if (step === 1) {
      if (activePayment?.method === "card") {
        void handleHostedCardCheckout();
        return;
      }
      void submitOffline();
    }
  };

  const showManagedCardForm =
    step === 1 &&
    activePayment?.method === "card" &&
    paytabs.managedFormEnabled &&
    Boolean(paytabs.clientKey);

  const methodTile = (
    key: string,
    title: string,
    Icon: typeof CreditCard,
  ) => {
    const selected = method === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setMethod(key as WalletDepositMethod)}
        className="w-full flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all text-start"
        style={
          selected
            ? {
                borderColor: getColor("primary"),
                backgroundColor: `${getColor("primary")}0D`,
              }
            : {
                borderColor: getColor("border"),
                backgroundColor: getColor("surface"),
              }
        }
      >
        <div
          className="size-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${getColor("primary")}1A`,
            color: getColor("primary"),
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium" style={{ color: getColor("primaryText") }}>
            {title}
          </div>
          <div className="text-sm" style={{ color: getColor("mutedText") }}>
            {t("wallet.secure_online")}
          </div>
        </div>
        <div
          className="size-5 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{
            borderColor: selected ? getColor("primary") : getColor("border"),
          }}
        >
          {selected && (
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: getColor("primary") }}
            />
          )}
        </div>
      </button>
    );
  };

  const methodLabel = (key: string) => {
    const fromApi = methodsFromApi.find((item) => item.key === key)?.label;
    if (fromApi) return fromApi;
    if (key === "card") return t("wallet.method_card");
    if (key === "bank_transfer") return t("wallet.method_bank");
    if (key === "managers_check") return t("wallet.method_cheque");
    if (key === "cash_collection") return t("wallet.method_cash");
    return key;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: getColor("background") }}>
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <WalletFlowHeader
          badge={t("wallet.topup_badge")}
          title={t("wallet.topup_title")}
          subtitle={t("wallet.topup_subtitle")}
          steps={steps}
        />
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.18)] p-6 md:p-8"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: getColor("border"),
            }}
          >
            {done ? (
              <div className="text-center py-6">
                <div
                  className="size-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{
                    backgroundColor: `${getColor("primary")}14`,
                    color: getColor("primary"),
                  }}
                >
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2
                  className="text-2xl font-serif mb-2"
                  style={{ color: getColor("primaryText") }}
                >
                  {donePending
                    ? t("wallet.topup_pending_title")
                    : t("wallet.topup_success_title")}
                </h2>
                <p
                  className="text-sm mb-8"
                  style={{ color: getColor("secondaryText") }}
                >
                  {donePending
                    ? t("wallet.topup_pending_desc")
                    : t("wallet.topup_success_desc")}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push(`/${locale}/wallet`)}
                >
                  {t("wallet.back_to_wallet")}
                </Button>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <>
                    <h2
                      className="text-2xl font-serif mb-1"
                      style={{ color: getColor("primaryText") }}
                    >
                      {t("wallet.topup_amount_title")}
                    </h2>
                    <p
                      className="text-sm mb-6"
                      style={{ color: getColor("secondaryText") }}
                    >
                      {t("wallet.topup_amount_subtitle")}
                    </p>

                    <div className="mb-5">
                      <Input
                        label={t("wallet.amount")}
                        type="text"
                        inputMode="numeric"
                        value={amount}
                        onChange={(event) => {
                          setAmount(formatPriceInput(event.target.value));
                          setError("");
                        }}
                        placeholder="0"
                        icon={<DirhamSymbolIcon size={14} />}
                      />
                    </div>

                    <div className="space-y-3 mb-2">
                      <p
                        className="text-sm font-medium"
                        style={{ color: getColor("primaryText") }}
                      >
                        {t("wallet.topup_method_title")}
                      </p>
                      {methodsFromApi.map((item) =>
                        methodTile(
                          item.key,
                          item.label || methodLabel(item.key),
                          METHOD_ICONS[item.key] || CreditCard,
                        ),
                      )}
                    </div>

                    {method === "bank_transfer" && (
                      <BeneficiaryInformation className="mt-5" />
                    )}
                  </>
                )}

                {step === 1 && activePayment && (
                  <>
                    <h2
                      className="text-2xl font-serif mb-1"
                      style={{ color: getColor("primaryText") }}
                    >
                      {activePayment.method === "card"
                        ? t("wallet.card_payment_title") || t("wallet.topup_details_title")
                        : t("wallet.topup_details_title")}
                    </h2>
                    <p
                      className="text-sm mb-6"
                      style={{ color: getColor("secondaryText") }}
                    >
                      {activePayment.method === "card"
                        ? t("wallet.card_payment_subtitle") ||
                          t("wallet.topup_details_subtitle")
                        : t("wallet.topup_details_subtitle")}
                    </p>

                    {activePayment.method === "card" &&
                    paytabs.managedFormEnabled &&
                    paytabs.clientKey ? (
                      <PayTabsManagedForm
                        clientKey={paytabs.clientKey}
                        submitLabel={
                          t("wallet.continue_to_paytabs") ||
                          t("listings.pay_with_paytabs")
                        }
                        loading={submitting}
                        onToken={handleCardPay}
                      />
                    ) : activePayment.method === "card" ? (
                      <p
                        className="text-sm leading-relaxed mb-2"
                        style={{ color: getColor("secondaryText") }}
                      >
                        {paytabs.loading
                          ? t("listings.loading_payment_form") ||
                            "Loading secure payment form…"
                          : t("listings.paytabs_hint") ||
                            "You will be redirected to PayTabs to complete payment securely."}
                      </p>
                    ) : (
                      <>
                        {activePayment.method === "bank_transfer" ? (
                          <BeneficiaryInformation
                            className="mb-5"
                            beneficiaryName={custody?.account_holder_name}
                            iban={custody?.iban}
                            accountNumber={custody?.account_number}
                          />
                        ) : (
                          custody && (
                            <div
                              className="rounded-2xl border px-4 py-4 mb-5 space-y-2 text-sm"
                              style={{ borderColor: getColor("border") }}
                            >
                              <p
                                className="font-medium"
                                style={{ color: getColor("primaryText") }}
                              >
                                {t("wallet.custody_instructions")}
                              </p>
                              {custody.account_holder_name && (
                                <p style={{ color: getColor("secondaryText") }}>
                                  {custody.account_holder_name}
                                </p>
                              )}
                              {custody.bank_name && (
                                <p style={{ color: getColor("secondaryText") }}>
                                  {custody.bank_name}
                                </p>
                              )}
                              {custody.iban && (
                                <p style={{ color: getColor("secondaryText") }}>
                                  IBAN: {custody.iban}
                                </p>
                              )}
                              {custody.cheque_payee && (
                                <p style={{ color: getColor("secondaryText") }}>
                                  {custody.cheque_payee}
                                </p>
                              )}
                              {(custody.collection_location ||
                                custody.collection_address) && (
                                <p style={{ color: getColor("secondaryText") }}>
                                  {custody.collection_location ||
                                    custody.collection_address}
                                </p>
                              )}
                              {custody.note && (
                                <p style={{ color: getColor("mutedText") }}>
                                  {custody.note}
                                </p>
                              )}
                            </div>
                          )
                        )}

                        <div className="space-y-3.5">
                          {activePayment.method === "bank_transfer" && (
                            <>
                              <Input
                                label={t("wallet.payment_reference")}
                                value={paymentReference}
                                onChange={(event) =>
                                  setPaymentReference(event.target.value)
                                }
                              />
                              <Input
                                label={t("wallet.sender_bank_name")}
                                value={senderBankName}
                                onChange={(event) =>
                                  setSenderBankName(event.target.value)
                                }
                              />
                              <Input
                                label={t("wallet.sender_account_last4")}
                                value={senderAccountLast4}
                                onChange={(event) =>
                                  setSenderAccountLast4(
                                    event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 4),
                                  )
                                }
                                placeholder="1234"
                              />
                            </>
                          )}

                          {activePayment.method === "managers_check" && (
                            <Input
                              label={t("wallet.check_number")}
                              value={checkNumber}
                              onChange={(event) =>
                                setCheckNumber(event.target.value)
                              }
                            />
                          )}

                          {(activePayment.method === "managers_check" ||
                            activePayment.method === "cash_collection") && (
                            <>
                              <Input
                                label={t("wallet.pickup_address")}
                                value={pickupAddress}
                                onChange={(event) =>
                                  setPickupAddress(event.target.value)
                                }
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  label={t("wallet.collection_date")}
                                  type="date"
                                  value={collectionDate}
                                  onChange={(event) =>
                                    setCollectionDate(event.target.value)
                                  }
                                />
                                <Input
                                  label={t("wallet.collection_time")}
                                  type="time"
                                  value={collectionTime}
                                  onChange={(event) =>
                                    setCollectionTime(event.target.value)
                                  }
                                />
                              </div>
                              <Input
                                label={t("wallet.field_notes")}
                                value={collectionNotes}
                                onChange={(event) =>
                                  setCollectionNotes(event.target.value)
                                }
                              />
                            </>
                          )}

                          <label
                            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 cursor-pointer text-center"
                            style={{
                              borderColor: getColor("border"),
                              backgroundColor: getColor("primaryLight"),
                              color: getColor("secondaryText"),
                            }}
                          >
                            <Upload
                              className="w-5 h-5"
                              style={{ color: getColor("primary") }}
                            />
                            <span className="text-sm font-medium">
                              {evidence?.name || t("wallet.upload_payment_proof")}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={(event) =>
                                setEvidence(event.target.files?.[0] || null)
                              }
                            />
                          </label>
                        </div>
                      </>
                    )}

                  </>
                )}

                {error && (
                  <p className="text-xs mt-4" style={{ color: getColor("error") }}>
                    {error}
                  </p>
                )}

                <div
                  className="flex items-center justify-between border-t pt-6 mt-6"
                  style={{ borderColor: getColor("border") }}
                >
                  <Button
                    variant="outline"
                    size="md"
                    onClick={goBack}
                    leftIcon={<BackIcon className="w-4 h-4" />}
                    disabled={submitting}
                  >
                    {t("wallet.back")}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={goNext}
                    rightIcon={<NextIcon className="w-4 h-4" />}
                    disabled={submitting || (step === 1 && activePayment?.method === "card" && paytabs.loading)}
                    className={showManagedCardForm ? "hidden" : undefined}
                  >
                    {submitting
                      ? t("wallet.processing")
                      : step === 0
                        ? t("wallet.continue")
                        : step === 1 && activePayment?.method === "card"
                          ? t("wallet.continue_to_paytabs")
                          : step === 1
                            ? t("wallet.submit_topup")
                            : t("wallet.continue")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
