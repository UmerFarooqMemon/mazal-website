"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Stepper, { type StepItem } from "@/components/private-deal/Stepper";
import DealSummary, { type DealData } from "@/components/private-deal/DealSummary";
import EscrowBenefits from "@/components/private-deal/EscrowBenefits";
import ConfirmDetailsStep, {
  type ConfirmDetailsData,
} from "@/components/private-deal/ConfirmDetailsStep";
import PaymentMethodStep, {
  type PaymentMethod,
  type PaymentMode,
  type SplitPaymentEntry,
} from "@/components/private-deal/PaymentMethodStep";
import PaymentDetailsStep from "@/components/private-deal/PaymentDetailsStep";
import PaymentSuccessStep from "@/components/private-deal/PaymentSuccessStep";
import SplitPaymentProcessStep from "@/components/private-deal/SplitPaymentProcessStep";
import {
  getListingDetail,
  type MarketplaceListingDetail,
} from "@/services/marketplace";

interface MarketplaceCheckoutProps {
  listingId: string;
  initialRole: "buyer" | "seller";
  agreedPrice: number;
}

export default function MarketplaceCheckout({
  listingId,
  initialRole,
  agreedPrice,
}: MarketplaceCheckoutProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const [step, setStep] = useState(0);
  const [listing, setListing] = useState<MarketplaceListingDetail | null>(null);
  const [resolvedPrice, setResolvedPrice] = useState(agreedPrice);
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("single");
  const [splitPayments, setSplitPayments] = useState<SplitPaymentEntry[]>([]);
  const [splitAllocated, setSplitAllocated] = useState(0);
  const [processingSplitId, setProcessingSplitId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    getListingDetail(listingId, locale)
      .then((response) => {
        setListing(response.data.listing);
        if (!agreedPrice || agreedPrice <= 0) {
          setResolvedPrice(response.data.listing.asking_price);
        }
      })
      .catch(() => {
        // Keep query/fallback price
      });
  }, [agreedPrice, listingId, locale]);

  const deal: DealData = {
    role: initialRole,
    emirate: listing?.emirate || "dubai",
    plateType: listing?.plate_type || "private",
    plateVariant: listing?.plate_design || "private_new_colorful",
    code: listing?.plate_code || "AA",
    digit: listing?.plate_digits || "7777",
    price: resolvedPrice,
  };

  const steps: StepItem[] = useMemo(() => {
    const labels = [
      t("offer.checkout_role"),
      t("offer.checkout_verification"),
      t("offer.checkout_confirm"),
      t("offer.checkout_payment"),
      t("offer.checkout_escrow"),
    ];
    const currentIndex = step === 0 ? 2 : step === 1 || step === 2 ? 3 : 4;

    return labels.map((label, index) => ({
      key: `marketplace-checkout-${index}`,
      label,
      status:
        index < currentIndex
          ? "completed"
          : index === currentIndex
            ? "current"
            : "upcoming",
    }));
  }, [step, t]);

  const patchDetails = (patch: Partial<ConfirmDetailsData>) =>
    setDetails((previous) => ({ ...previous, ...patch }));

  const processingPayment = processingSplitId
    ? splitPayments.find((payment) => payment.id === processingSplitId) || null
    : null;

  const completeSplitPayment = () => {
    if (!processingSplitId) return;

    const nextPayments = splitPayments.map((payment) =>
      payment.id === processingSplitId
        ? { ...payment, status: "completed" as const }
        : payment,
    );
    setSplitPayments(nextPayments);
    setProcessingSplitId(null);

    if (nextPayments.every((payment) => payment.status === "completed")) {
      setStep(3);
    } else {
      setStep(1);
    }
  };

  const renderMain = () => {
    if (step === 0) {
      return (
        <ConfirmDetailsStep
          data={details}
          onChange={patchDetails}
          onBack={() => router.push(`/${locale}/listings/${listingId}`)}
          onContinue={() => setStep(1)}
          variant="buyer"
          continueLabel={t("private-deal.confirm")}
        />
      );
    }

    if (step === 1) {
      return (
        <PaymentMethodStep
          method={paymentMethod}
          mode={paymentMode}
          totalAmount={resolvedPrice}
          splitPayments={splitPayments}
          onMethodChange={setPaymentMethod}
          onModeChange={(mode) => {
            setPaymentMode(mode);
            setProcessingSplitId(null);
          }}
          onSplitPaymentsChange={setSplitPayments}
          onAllocatedChange={setSplitAllocated}
          onBack={() => setStep(0)}
          onContinue={() => setStep(2)}
          onProcessSplit={(paymentId) => {
            setProcessingSplitId(paymentId);
            setStep(2);
          }}
        />
      );
    }

    if (step === 2) {
      if (paymentMode === "split" && processingPayment) {
        return (
          <SplitPaymentProcessStep
            payment={processingPayment}
            onBack={() => {
              setProcessingSplitId(null);
              setStep(1);
            }}
            onComplete={completeSplitPayment}
          />
        );
      }

      return (
        <PaymentDetailsStep
          method={paymentMethod}
          amount={resolvedPrice}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      );
    }

    return (
      <PaymentSuccessStep
        onDone={() => router.push(`/${locale}/marketplace`)}
      />
    );
  };

  const showSidebar = step < 3;
  const showAllocation =
    paymentMode === "split" && (step === 1 || step === 2);

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
            {t("offer.checkout_badge")}
          </div>

          <h1
            className={`max-w-3xl font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] mb-4 ${isRTL ? "text-right mr-0 ml-auto" : "text-left"}`}
            style={{ color: getColor("primaryText") }}
          >
            {initialRole === "seller"
              ? t("offer.checkout_seller_title")
              : t("offer.checkout_buyer_title")}
          </h1>

          <p
            className={`max-w-2xl text-base md:text-lg leading-relaxed ${isRTL ? "text-right mr-0 ml-auto" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("offer.checkout_description")}
          </p>

          <Stepper steps={steps} />
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
                showAllocation={showAllocation}
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
