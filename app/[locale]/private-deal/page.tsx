"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
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
import PaymentDetailsStep from "@/components/private-deal/PaymentDetailsStep";
import PaymentSuccessStep from "@/components/private-deal/PaymentSuccessStep";
import SplitPaymentProcessStep from "@/components/private-deal/SplitPaymentProcessStep";

export default function PrivateDealPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";

  const [step, setStep] = useState(0);
  const [deal, setDeal] = useState<DealData>({
    role: null,
    emirate: "DUBAI",
    plateType: "private",
    code: "AA",
    digit: "777",
    price: 450000,
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
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("single");
  const [splitPayments, setSplitPayments] = useState<SplitPaymentEntry[]>([]);
  const [splitAllocatedLive, setSplitAllocatedLive] = useState(0);
  const [processingSplitId, setProcessingSplitId] = useState<string | null>(
    null,
  );

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
            onContinue={() => setStep(2)}
          />
        );
      }
      if (step === 2) {
        return (
          <ConfirmDetailsStep
            data={details}
            onChange={patchDetails}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
            variant="seller"
          />
        );
      }
      if (step === 3) {
        return (
          <TransferDetailsStep
            onBack={() => setStep(2)}
            onComplete={() => setStep(4)}
          />
        );
      }
      return <TransferProgressStep />;
    }

    if (isBuyer) {
      if (step === 1) {
        return (
          <OtpVerificationStep
            otp={otp}
            onChange={setOtp}
            onBack={() => setStep(0)}
            onContinue={() => setStep(2)}
          />
        );
      }
      if (step === 2) {
        return (
          <ConfirmDetailsStep
            data={details}
            onChange={patchDetails}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
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
            onSplitPaymentsChange={setSplitPayments}
            onAllocatedChange={setSplitAllocatedLive}
            onBack={() => setStep(2)}
            onContinue={() => setStep(4)}
            onProcessSplit={(id) => {
              setProcessingSplitId(id);
              setStep(4);
            }}
          />
        );
      }
      if (step === 4) {
        if (paymentMode === "split" && processingPayment) {
          return (
            <SplitPaymentProcessStep
              payment={processingPayment}
              onBack={() => {
                setProcessingSplitId(null);
                setStep(3);
              }}
              onComplete={completeSplitPayment}
            />
          );
        }
        return (
          <PaymentDetailsStep
            method={paymentMethod}
            amount={deal.price}
            onBack={() => setStep(3)}
            onContinue={() => setStep(5)}
          />
        );
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

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <section className="border-b border-[#d9dee6] bg-gradient-to-b from-[rgba(234,239,247,0.4)] to-[#fbfaf7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div
            className={`inline-flex items-center gap-2 bg-[rgba(10,47,148,0.05)] border border-[rgba(10,47,148,0.2)] text-[#0a2f94] text-[12px] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Shield className="w-3.5 h-3.5" />
            {t("private-deal.badge")}
          </div>

          <h1
            className={`max-w-3xl font-serif text-4xl md:text-5xl text-[#081123] tracking-tight leading-[1.15] mb-4 ${isRTL ? "text-right mr-0 ml-auto" : "text-left"}`}
          >
            <span>{t("private-deal.title_line1")} </span>
            <span className="text-[#0a2f94]">{t("private-deal.title_line2")}</span>
          </h1>

          <p
            className={`max-w-2xl text-[#545e6f] text-base md:text-lg leading-relaxed ${isRTL ? "text-right mr-0 ml-auto" : "text-left"}`}
          >
            {t("private-deal.description")}
          </p>

          {visibleStepper && (
            <Stepper steps={isBuyer ? buyerSteps : sellerSteps} />
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
