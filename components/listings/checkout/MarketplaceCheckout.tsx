"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Stepper, { type StepItem } from "@/components/private-deal/Stepper";
import DealSummary, { type DealData } from "@/components/private-deal/DealSummary";
import EscrowBenefits from "@/components/private-deal/EscrowBenefits";
import BeneficiaryInformation from "@/components/ui/BeneficiaryInformation";
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
import WalletPaymentModal from "@/components/wallet/WalletPaymentModal";
import {
  canTransactListing,
  getListingDetail,
  getPurchase,
  isHiddenPlateCode,
  isListingReserved,
  isListingSold,
  payPurchaseWithWallet,
  resolvePlateParts,
  type MarketplaceListingDetail,
  type MarketplacePurchase,
} from "@/services/marketplace";

interface MarketplaceCheckoutProps {
  listingId: string;
  initialRole: "buyer" | "seller";
  agreedPrice: number;
  purchaseId?: string;
}

export default function MarketplaceCheckout({
  listingId,
  initialRole,
  agreedPrice,
  purchaseId,
}: MarketplaceCheckoutProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const [step, setStep] = useState(0);
  const [listing, setListing] = useState<MarketplaceListingDetail | null>(null);
  const [purchase, setPurchase] = useState<MarketplacePurchase | null>(null);
  const [resolvedPrice, setResolvedPrice] = useState(agreedPrice);
  const [details, setDetails] = useState<ConfirmDetailsData>({
    fullName: "",
    mobile: "",
    mobileCountryIso: "ae",
    mobileDialCode: "+971",
    email: "",
    emiratesId: "",
    personType: "individual",
    identification: "emirates_id",
    identificationValue: "",
    secondaryMobile: "",
    secondaryMobileCountryIso: "ae",
    secondaryMobileDialCode: "+971",
    licenseSource: "mbr",
    giftPlate: false,
    giftEmail: "",
    giftMessage: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("single");
  const [splitPayments, setSplitPayments] = useState<SplitPaymentEntry[]>([]);
  const [splitAllocated, setSplitAllocated] = useState(0);
  const [processingSplitId, setProcessingSplitId] = useState<string | null>(
    null,
  );
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    getListingDetail(listingId, locale)
      .then((response) => {
        setListing(response.data.listing);
        if (!agreedPrice || agreedPrice <= 0) {
          setResolvedPrice(Number(response.data.listing.asking_price) || 0);
        }
      })
      .catch(() => {
        // Keep query/fallback price
      });
  }, [agreedPrice, listingId, locale]);

  useEffect(() => {
    if (!purchaseId) return;
    getPurchase(purchaseId, locale)
      .then((response) => {
        setPurchase(response.data.purchase);
        const due = Number(response.data.purchase.total_due);
        if (Number.isFinite(due) && due > 0) {
          setResolvedPrice(due);
        }
      })
      .catch(() => {
        // Purchase may still be optional for UI-only checkout paths.
      });
  }, [locale, purchaseId]);

  const plateType = listing?.plate_type || "private";
  const plateDesign = listing?.plate_design || "new_colorful";
  const plateVariant = `${plateType}_${plateDesign}`;
  const hideCode = isHiddenPlateCode(listing);
  const plate = resolvePlateParts(listing);

  const deal: DealData = {
    role: initialRole,
    emirate: listing?.emirate_label || listing?.emirate || "dubai",
    plateType,
    plateVariant,
    plateDesign,
    code: plate.code,
    digit: plate.digits,
    price: resolvedPrice,
    hideCode,
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

  const pendingPurchasePaymentId =
    purchase?.payments?.find((payment) =>
      ["pending", "awaiting", "unpaid"].includes(
        String(payment.status || "").toLowerCase(),
      ),
    )?.id || purchase?.payments?.[0]?.id;

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
          onContinue={() => {
            if (paymentMethod === "wallet") {
              setWalletModalOpen(true);
              return;
            }
            setStep(2);
          }}
          onOpenWallet={() => router.push(`/${locale}/wallet`)}
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
          method={paymentMethod === "wallet" ? "bank" : paymentMethod}
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

  const listingBlocked =
    listing != null &&
    initialRole === "buyer" &&
    !purchaseId &&
    !canTransactListing(listing.status);

  const blockedMessage = isListingReserved(listing?.status)
    ? t("listings.listing_reserved_message")
    : isListingSold(listing?.status)
      ? t("listings.listing_sold_message")
      : t("listings.listing_not_available");

  if (listingBlocked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: getColor("background") }}
      >
        <div
          className="max-w-md w-full rounded-2xl border p-8 text-center"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
        >
          <p
            className="text-lg font-semibold mb-2"
            style={{ color: getColor("primaryText") }}
          >
            {blockedMessage}
          </p>
          <p className="text-sm" style={{ color: getColor("mutedText") }}>
            {t("listings.listing_not_available")}
          </p>
        </div>
      </div>
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
          backgroundColor: getColor("surface"),
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield
              className="w-5 h-5"
              style={{ color: getColor("primary") }}
            />
            <p
              className="text-xs font-semibold tracking-[0.14em] uppercase"
              style={{ color: getColor("primary") }}
            >
              {t("offer.checkout_badge") || "Checkout"}
            </p>
          </div>
          <h1
            className={`text-3xl sm:text-4xl font-serif mb-2 ${isRTL ? "text-right" : ""}`}
            style={{ color: getColor("primaryText") }}
          >
            {t("offer.checkout_title") || "Complete purchase"}
          </h1>
          <p
            className="text-sm mb-6"
            style={{ color: getColor("secondaryText") }}
          >
            {t("offer.checkout_description")}
          </p>

          <Stepper steps={steps} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        {showSidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">{renderMain()}</div>
            <div className="lg:col-span-1 space-y-6">
              <div className="marketplace-checkout-summary">
                <DealSummary
                  data={deal}
                  showAllocation={showAllocation}
                  allocatedAmount={splitAllocated}
                  plateCrop="deal-summary"
                />
              </div>
              {paymentMethod === "bank" && step >= 1 && (
                <BeneficiaryInformation />
              )}
              <EscrowBenefits />
            </div>
          </div>
        ) : (
          renderMain()
        )}
      </section>

      <WalletPaymentModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        amountDue={resolvedPrice}
        reference={t("private-deal.payment_title")}
        onPaid={async () => {
          if (!purchaseId || !pendingPurchasePaymentId) {
            throw new Error(
              t("wallet.purchase_not_ready") ||
                "Purchase payment is not ready yet.",
            );
          }
          await payPurchaseWithWallet(
            purchaseId,
            pendingPurchasePaymentId,
            locale,
          );
          toast.success(t("wallet.paid_from_wallet"));
          setStep(3);
        }}
      />
    </div>
  );
}
