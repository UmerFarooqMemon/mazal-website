"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Stepper, { type StepItem } from "@/components/private-deal/Stepper";
import RoleSelector from "@/components/private-deal/RoleSelector";
import DealSummary, { type DealData } from "@/components/private-deal/DealSummary";
import EscrowBenefits from "@/components/private-deal/EscrowBenefits";
import PlatePriceStep from "@/components/private-deal/PlatePriceStep";
import ConfirmDetailsStep, {
  type ConfirmDetailsData,
} from "@/components/private-deal/ConfirmDetailsStep";
import TransferDetailsStep from "@/components/private-deal/TransferDetailsStep";
import TransferProgressStep from "@/components/private-deal/TransferProgressStep";
import OtpVerificationStep from "@/components/private-deal/OtpVerificationStep";
import PaymentMethodStep, {
  type PaymentMethod,
  type PaymentMode,
  type SplitPaymentEntry,
} from "@/components/private-deal/PaymentMethodStep";
import PaymentSuccessStep from "@/components/private-deal/PaymentSuccessStep";
import SplitPaymentProcessStep from "@/components/private-deal/SplitPaymentProcessStep";
import {
  createPrivateDeal,
  createPrivateDealCheckout,
  extractPrivateDeal,
  getPrivateDeal,
  getPrivateDealOptions,
  issuePrivateDealInvitation,
  joinPrivateDeal,
  savePrivateDealParty,
  savePrivateDealPaymentPlan,
  submitPrivateDealPayment,
  type PrivateDeal,
  type PrivateDealOptions,
} from "@/services/private-deals";

const STICKY_HEADER_OFFSET = 69;

const PAYMENT_METHOD_MAP: Record<PaymentMethod, string> = {
  bank: "bank_transfer",
  card: "card",
  managers_check: "managers_check",
  cash: "cash_collection",
};

export default function PrivateDealPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRTL = locale === "ar";
  const stepperRef = useRef<HTMLDivElement>(null);
  const dealIdRef = useRef<string | null>(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [options, setOptions] = useState<PrivateDealOptions | null>(null);
  const [dealId, setDealId] = useState<string | null>(null);
  const [apiDeal, setApiDeal] = useState<PrivateDeal | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [deal, setDeal] = useState<DealData>({
    role: null,
    emirate: "dubai",
    plateType: "private",
    plateVariant: "private_new_colorful",
    code: "",
    digit: "",
    price: 0,
  });
  const [details, setDetails] = useState<ConfirmDetailsData>({
    fullName: "",
    mobile: "",
    email: "",
    emiratesId: "",
    personType: "individual",
    identification: "emirates_id",
    identificationValue: "",
    secondaryMobile: "",
    licenseSource: "mbr",
    giftPlate: false,
    giftEmail: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("single");
  const [splitPayments, setSplitPayments] = useState<SplitPaymentEntry[]>([]);
  const [splitAllocatedLive, setSplitAllocatedLive] = useState(0);
  const [processingSplitId, setProcessingSplitId] = useState<string | null>(
    null,
  );

  const resolveDealId = () => dealIdRef.current || dealId;

  function hydrateFromApiDeal(
    nextDeal: PrivateDeal,
    roleOverride?: "seller" | "buyer",
  ) {
    if (nextDeal?.id == null) {
      throw new Error("Deal response is missing an id.");
    }

    const nextDealId = String(nextDeal.id);
    dealIdRef.current = nextDealId;
    setApiDeal(nextDeal);
    setDealId(nextDealId);
    setDeal((prev) => ({
      ...prev,
      role: roleOverride || prev.role,
      emirate: nextDeal.plate?.emirate || prev.emirate,
      plateType: nextDeal.plate?.type || prev.plateType,
      plateVariant: nextDeal.plate?.variant || prev.plateVariant,
      code: nextDeal.plate?.code || prev.code,
      digit: nextDeal.plate?.digits || prev.digit,
      price: Number(nextDeal.agreed_price || prev.price || 0),
    }));
  }

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      try {
        const optionsResponse = await getPrivateDealOptions(locale);

        if (!ignore) {
          setOptions(optionsResponse.data);
        }

        const sharedDealId = searchParams.get("deal");
        if (sharedDealId && !dealIdRef.current) {
          const dealResponse = await getPrivateDeal(sharedDealId, locale);
          if (!ignore) {
            hydrateFromApiDeal(extractPrivateDeal(dealResponse), "buyer");
          }
        }
      } catch {
        // Keep page usable even if API bootstrap fails.
      }
    };

    void init();

    return () => {
      ignore = true;
    };
  }, [locale, searchParams]);

  useEffect(() => {
    if (step < 1) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const el = stepperRef.current;
    if (!el) return;

    const top =
      el.getBoundingClientRect().top + window.scrollY - STICKY_HEADER_OFFSET;
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "auto" });
  }, [step, processingSplitId]);

  const isSeller = deal.role === "seller";
  const isBuyer = deal.role === "buyer";

  const splitAllocated = useMemo(() => {
    if (paymentMode !== "split") return 0;
    if (step === 4 && processingSplitId) {
      return splitPayments.reduce((sum, p) => sum + p.amount, 0);
    }
    return splitAllocatedLive || splitPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [
    paymentMode,
    step,
    processingSplitId,
    splitAllocatedLive,
    splitPayments,
  ]);

  const sellerSteps: StepItem[] = useMemo(() => {
    const labels = [
      t("private-deal.stepper_role"),
      t("private-deal.stepper_plate"),
      t("private-deal.stepper_confirm"),
      t("private-deal.stepper_escrow"),
    ];
    return labels.map((label, index) => ({
      key: `seller-${index}`,
      label,
      status:
        step > index ? "completed" : step === index ? "current" : "upcoming",
    }));
  }, [step, t]);

  // Buyer page steps: 0 role, 1 otp, 2 confirm, 3 payment method,
  // 4 payment details / process split, 5 success.
  // Stepper collapses 3+4 into PAYMENT METHOD.
  const buyerSteps: StepItem[] = useMemo(() => {
    const labels = [
      t("private-deal.stepper_role"),
      t("private-deal.stepper_verification"),
      t("private-deal.stepper_confirm"),
      t("private-deal.stepper_payment"),
      t("private-deal.stepper_escrow"),
    ];
    const stepperIndex =
      step <= 2 ? step : step === 3 || step === 4 ? 3 : 4;
    return labels.map((label, index) => ({
      key: `buyer-${index}`,
      label,
      status:
        stepperIndex > index
          ? "completed"
          : stepperIndex === index
            ? "current"
            : "upcoming",
    }));
  }, [step, t]);

  const visibleStepper = step >= 1;

  const patchDeal = (patch: Partial<DealData>) =>
    setDeal((prev) => ({ ...prev, ...patch }));
  const patchDetails = (patch: Partial<ConfirmDetailsData>) =>
    setDetails((prev) => ({ ...prev, ...patch }));

  const goBackHome = () => router.push(`/${locale}`);

  const processingPayment = processingSplitId
    ? splitPayments.find((p) => p.id === processingSplitId) || null
    : null;

  const completeSplitPayment = () => {
    if (!processingSplitId) return;
    const next = splitPayments.map((p) =>
      p.id === processingSplitId ? { ...p, status: "completed" as const } : p,
    );
    setSplitPayments(next);
    setProcessingSplitId(null);
    setStep(3);
    if (next.every((p) => p.status === "completed")) {
      setStep(5);
    }
  };

  const asMoney = (value: number) => value.toFixed(2);

  const withSubmit = async (task: () => Promise<void>) => {
    try {
      setSubmitting(true);
      await task();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getPartyPayload = () => {
    const isCompany = details.personType === "organization";
    if (isCompany) {
      return {
        intent: "complete",
        party_type: "company",
        full_name: details.fullName,
        trade_license_number:
          details.identification === "trade_license"
            ? details.identificationValue
            : details.emiratesId,
        license_source:
          details.licenseSource ||
          Object.keys(options?.license_sources || {})[0] ||
          "dubai_det",
        authorized_mobile: details.secondaryMobile || details.mobile,
        email: details.email,
        accept_terms: true,
      };
    }

    return {
      intent: "complete",
      party_type: "individual",
      full_name: details.fullName,
      mobile_number: details.mobile,
      email: details.email,
      emirates_id:
        details.identification === "traffic"
          ? undefined
          : details.emiratesId || details.identificationValue,
      identification_type:
        details.identification === "traffic" ? "traffic_file" : "emirates_id",
      traffic_file_number:
        details.identification === "traffic"
          ? details.identificationValue
          : undefined,
      accept_terms: true,
      role_details: {
        notes: "",
      },
    };
  };

  const persistPaymentPlan = async (payments: SplitPaymentEntry[]) => {
    const activeDealId = resolveDealId();
    if (!activeDealId) {
      throw new Error("Deal not found.");
    }

    const response = await savePrivateDealPaymentPlan(
      activeDealId,
      {
        intent: "complete",
        plan: payments.length > 1 ? "split" : "single",
        entries: payments.map((payment) => ({
          amount: asMoney(payment.amount),
          method: PAYMENT_METHOD_MAP[payment.method],
          notes: payment.notes || undefined,
        })),
      },
      locale,
    );

    const nextDeal = extractPrivateDeal(response);
    hydrateFromApiDeal(nextDeal);

    const backendPayments = nextDeal.payments || [];
    setSplitPayments(
      payments.map((payment, index) => ({
        ...payment,
        backendPaymentId: backendPayments[index]?.id,
      })),
    );
  };

  const handleSellerDealCreate = async () => {
    await withSubmit(async () => {
      const response = await createPrivateDeal(
        {
          intent: "complete",
          emirate: deal.emirate,
          plate_variant: deal.plateVariant,
          plate_type: deal.plateType,
          plate_code: deal.code || undefined,
          plate_digits: deal.digit,
          plate_design: undefined,
          agreed_price: asMoney(deal.price),
        },
        locale,
      );

      const createdDeal = extractPrivateDeal(response);
      hydrateFromApiDeal(createdDeal, "seller");
      setStep(2);
    });
  };

  const handleSavePartyDetails = async (variant: "seller" | "buyer") => {
    await withSubmit(async () => {
      const activeDealId = resolveDealId();
      if (!activeDealId) {
        throw new Error("Deal not found.");
      }

      const response = await savePrivateDealParty(
        activeDealId,
        getPartyPayload(),
        locale,
      );
      hydrateFromApiDeal(extractPrivateDeal(response), variant);
      setStep(variant === "seller" ? 3 : 3);
    });
  };

  const handleIssueInvitation = async () => {
    await withSubmit(async () => {
      const activeDealId = resolveDealId();
      if (!activeDealId) {
        throw new Error("Deal not found.");
      }

      const response = await issuePrivateDealInvitation(activeDealId, locale);
      hydrateFromApiDeal(extractPrivateDeal(response), "seller");
      setVerificationCode(response.data.verification_code);
      setShareUrl(response.data.invitation.share_url);
      setStep(4);
    });
  };

  const handleJoinDeal = async () => {
    await withSubmit(async () => {
      const sharedDealId = resolveDealId() || searchParams.get("deal");
      if (!sharedDealId) {
        throw new Error("Invite link is missing a deal id.");
      }

      const response = await joinPrivateDeal(
        sharedDealId,
        otp.join(""),
        locale,
      );
      hydrateFromApiDeal(extractPrivateDeal(response), "buyer");
      setStep(2);
    });
  };

  const handleSinglePaymentContinue = async () => {
    await withSubmit(async () => {
      const singlePayment: SplitPaymentEntry = {
        id: "single-payment",
        method: paymentMethod,
        amount: deal.price,
        notes: "",
        status: "awaiting",
        createdAt: new Date().toISOString(),
      };

      await persistPaymentPlan([singlePayment]);
      setProcessingSplitId("single-payment");
      setStep(4);
    });
  };

  const handleSplitPaymentSave = async (payments: SplitPaymentEntry[]) => {
    await withSubmit(async () => {
      await persistPaymentPlan(payments);
    });
  };

  const handleSubmitPayment = async (payload: {
    paymentReference?: string;
    senderBankName?: string;
    senderAccountLast4?: string;
    notes?: string;
    evidence?: File | null;
    checkNumber?: string;
    collectionDate?: string;
    collectionTime?: string;
  }) => {
    await withSubmit(async () => {
      const activeDealId = resolveDealId();
      if (!activeDealId || !processingPayment?.backendPaymentId) {
        throw new Error("Payment is not ready yet.");
      }

      if (processingPayment.method === "card") {
        const checkout = await createPrivateDealCheckout(
          activeDealId,
          processingPayment.backendPaymentId,
          locale,
        );
        const redirectUrl = checkout.data.redirect_url;
        if (!redirectUrl) {
          throw new Error("Missing checkout URL.");
        }
        window.location.href = redirectUrl;
        return;
      }

      const formData = new FormData();
      if (processingPayment.method === "bank") {
        formData.append("payment_reference", payload.paymentReference || "");
        formData.append("sender_bank_name", payload.senderBankName || "");
        formData.append(
          "sender_account_last4",
          payload.senderAccountLast4 || "",
        );
        formData.append("notes", payload.notes || "");
        if (payload.evidence) {
          formData.append("evidence", payload.evidence);
        }
      }

      if (processingPayment.method === "managers_check") {
        formData.append("check_number", payload.checkNumber || "");
        formData.append("collection_date", payload.collectionDate || "");
        formData.append("collection_time", payload.collectionTime || "");
        formData.append("notes", payload.notes || "");
      }

      if (processingPayment.method === "cash") {
        formData.append("collection_date", payload.collectionDate || "");
        formData.append("collection_time", payload.collectionTime || "");
        formData.append("notes", payload.notes || "");
      }

      const response = await submitPrivateDealPayment(
        activeDealId,
        processingPayment.backendPaymentId,
        formData,
        locale,
      );

      hydrateFromApiDeal(extractPrivateDeal(response), "buyer");
      completeSplitPayment();
    });
  };

  const renderMain = () => {
    if (step === 0) {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          <RoleSelector
            role={deal.role}
            setRole={(role) => patchDeal({ role })}
            onContinue={() => setStep(1)}
            onBack={goBackHome}
          />
          <div className="max-w-xl mx-auto">
            <EscrowBenefits />
          </div>
        </div>
      );
    }

    if (isSeller) {
      if (step === 1) {
        return (
          <PlatePriceStep
            data={deal}
            onChange={patchDeal}
            onBack={() => setStep(0)}
            onContinue={handleSellerDealCreate}
          />
        );
      }
      if (step === 2) {
        return (
          <ConfirmDetailsStep
            data={details}
            onChange={patchDetails}
            onBack={() => setStep(1)}
            onContinue={() => void handleSavePartyDetails("seller")}
            variant="seller"
          />
        );
      }
      if (step === 3) {
        return (
          <TransferDetailsStep
            onBack={() => setStep(2)}
            onComplete={() => void handleIssueInvitation()}
          />
        );
      }
      return (
        <TransferProgressStep otp={verificationCode} shareUrl={shareUrl} />
      );
    }

    if (isBuyer) {
      if (step === 1) {
        return (
          <OtpVerificationStep
            otp={otp}
            onChange={setOtp}
            onBack={() => setStep(0)}
            onContinue={() => void handleJoinDeal()}
            loading={submitting}
          />
        );
      }
      if (step === 2) {
        return (
          <ConfirmDetailsStep
            data={details}
            onChange={patchDetails}
            onBack={() => setStep(1)}
            onContinue={() => void handleSavePartyDetails("buyer")}
            variant="buyer"
            continueLabel={t("private-deal.confirm")}
          />
        );
      }
      if (step === 3) {
        return (
          <PaymentMethodStep
            method={paymentMethod}
            mode={paymentMode}
            totalAmount={deal.price}
            splitPayments={splitPayments}
            onMethodChange={setPaymentMethod}
            onModeChange={(mode) => {
              setPaymentMode(mode);
              setProcessingSplitId(null);
            }}
            onSplitPaymentsChange={handleSplitPaymentSave}
            onAllocatedChange={setSplitAllocatedLive}
            onBack={() => setStep(2)}
            onContinue={() => void handleSinglePaymentContinue()}
            onProcessSplit={(id) => {
              setProcessingSplitId(id);
              setStep(4);
            }}
            saving={submitting}
          />
        );
      }
      if (step === 4) {
        if (processingPayment) {
          return (
            <SplitPaymentProcessStep
              payment={processingPayment}
              onBack={() => {
                setProcessingSplitId(null);
                setStep(3);
              }}
              onComplete={(payload) => void handleSubmitPayment(payload)}
              submitting={submitting}
              custodyInstructions={
                apiDeal?.payments?.find(
                  (item) => item.id === processingPayment.backendPaymentId,
                )?.custody_instructions
              }
            />
          );
        }
        return null;
      }
      return (
        <PaymentSuccessStep
          onDone={() => router.push(`/${locale}/marketplace`)}
        />
      );
    }

    return null;
  };

  const showSidebar =
    step >= 1 &&
    !(isSeller && step === 4) &&
    !(isBuyer && step >= 5);

  const showSplitAllocation = isBuyer && step >= 3 && paymentMode === "split";

  if (themeLoading || localeLoading) {
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
      <section
        className="border-b"
        style={{
          borderColor: getColor("border"),
          background: `linear-gradient(to bottom, ${getColor("primaryLight")}66, ${getColor("background")})`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div
            className={`inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4 border ${isRTL ? "flex-row-reverse" : ""}`}
            style={{
              backgroundColor: `${getColor("primary")}0D`,
              borderColor: `${getColor("primary")}33`,
              color: getColor("primary"),
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            {t("private-deal.badge")}
          </div>

          <h1
            className={`max-w-3xl font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] mb-4 ${isRTL ? "text-right mr-0 ml-auto" : "text-left"}`}
            style={{ color: getColor("primaryText") }}
          >
            <span>{t("private-deal.title_line1")} </span>
            <span style={{ color: getColor("primary") }}>
              {t("private-deal.title_line2")}
            </span>
          </h1>

          <p
            className={`max-w-2xl text-base md:text-lg leading-relaxed ${isRTL ? "text-right mr-0 ml-auto" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("private-deal.description")}
          </p>

          {visibleStepper && (
            <div ref={stepperRef}>
              <Stepper steps={isBuyer ? buyerSteps : sellerSteps} />
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        {showSidebar ? (
          <div
            className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRTL ? "direction-rtl" : ""}`}
          >
            <div className="lg:col-span-2">{renderMain()}</div>
            <div className="lg:col-span-1 space-y-6">
              <DealSummary
                data={deal}
                showAllocation={showSplitAllocation}
                allocatedAmount={splitAllocated}
                plateCrop="deal-summary"
              />
              <EscrowBenefits />
            </div>
          </div>
        ) : (
          renderMain()
        )}
      </section>
    </div>
  );
}
