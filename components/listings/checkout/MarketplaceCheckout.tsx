"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Handshake, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Stepper, { type StepItem } from "@/components/private-deal/Stepper";
import DealSummary, { type DealData } from "@/components/private-deal/DealSummary";
import EscrowBenefits from "@/components/private-deal/EscrowBenefits";
import BeneficiaryInformation, {
  MAZAL_BENEFICIARY_DEFAULTS,
} from "@/components/ui/BeneficiaryInformation";
import ConfirmDetailsStep, {
  type ConfirmDetailsData,
} from "@/components/private-deal/ConfirmDetailsStep";
import PaymentMethodStep, {
  type PaymentMethod,
  type PaymentMode,
  type SplitPaymentEntry,
} from "@/components/private-deal/PaymentMethodStep";
import PaymentSuccessStep from "@/components/private-deal/PaymentSuccessStep";
import SplitPaymentProcessStep from "@/components/private-deal/SplitPaymentProcessStep";
import WalletPaymentModal from "@/components/wallet/WalletPaymentModal";
import WalletDialog from "@/components/wallet/WalletDialog";
import { Button } from "@/components/ui";
import { useGiftProducts } from "@/hooks/useGiftProducts";
import { detailsFromGiftProduct, resolveGiftBoxSummary } from "@/lib/gift-box";
import {
  canTransactListing,
  createPurchaseCheckout,
  getListingDetail,
  getPurchase,
  isHiddenPlateCode,
  isListingReserved,
  isListingSold,
  payPurchaseWithWallet,
  resolvePlateParts,
  savePurchaseParty,
  submitPurchasePaymentEvidence,
  updatePurchaseAddons,
  type MarketplaceListingDetail,
  type MarketplacePurchase,
} from "@/services/marketplace";
import {
  buildRemoveGiftProductPayload,
  buildSelectGiftProductPayload,
} from "@/services/products";
import { handlePayTabsCheckoutResult } from "@/lib/paytabs";
import { resolveLicenseSourceOptions } from "@/config/license-sources";
import {
  hasNationalPhoneDigits,
  isValidCountryPhoneNumber,
  toE164FromPhoneDigits,
} from "@/lib/phone-validation";

const PAYMENT_METHOD_MAP: Record<
  Exclude<PaymentMethod, "wallet">,
  "bank_transfer" | "card" | "managers_check" | "cash_collection"
> = {
  bank: "bank_transfer",
  card: "card",
  managers_check: "managers_check",
  cash: "cash_collection",
};

interface MarketplaceCheckoutProps {
  listingId: string;
  initialRole: "buyer" | "seller";
  agreedPrice: number;
  purchaseId?: string;
}

function asCustodyRecord(
  value: unknown,
): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as Record<string, unknown>;
}

/** Same buyer total as DealSummary sidebar (agreed + fees, or API total_due). */
function resolvePayableTotal(
  agreedPrice: number,
  purchase?: MarketplacePurchase | null,
): { totalDue: number; totalFees: number } {
  const paymentAmount = Number(
    purchase?.payments?.find((payment) =>
      ["pending", "awaiting", "unpaid", "rejected", "processing"].includes(
        String(payment.status || "").toLowerCase(),
      ),
    )?.amount ?? purchase?.payments?.[0]?.amount,
  );
  const apiDue = Number(purchase?.total_due);
  const apiFees = Number(purchase?.total_fees);
  const fallbackFees = Math.round(agreedPrice * 0.08);

  if (Number.isFinite(paymentAmount) && paymentAmount > 0) {
    const fees =
      Number.isFinite(apiFees) && apiFees >= 0
        ? apiFees
        : Math.max(0, paymentAmount - agreedPrice);
    return { totalDue: paymentAmount, totalFees: fees };
  }

  if (Number.isFinite(apiDue) && apiDue > 0) {
    return {
      totalDue: apiDue,
      totalFees:
        Number.isFinite(apiFees) && apiFees >= 0
          ? apiFees
          : Math.max(0, apiDue - agreedPrice),
    };
  }

  return {
    totalDue: agreedPrice + fallbackFees,
    totalFees: fallbackFees,
  };
}

export default function MarketplaceCheckout({
  listingId,
  initialRole,
  agreedPrice,
  purchaseId: purchaseIdProp,
}: MarketplaceCheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const { products: giftProducts } = useGiftProducts();
  const isRTL = locale === "ar";

  const purchaseId =
    purchaseIdProp || searchParams.get("purchaseId") || undefined;

  const [step, setStep] = useState(0);
  const [listing, setListing] = useState<MarketplaceListingDetail | null>(null);
  const [purchase, setPurchase] = useState<MarketplacePurchase | null>(null);
  const [resolvedPrice, setResolvedPrice] = useState(agreedPrice);
  const [submitting, setSubmitting] = useState(false);
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
    custodyIntent: "hold",
    giftPlate: false,
    giftEmail: "",
    giftMessage: "",
    giftPackageId: "",
    giftRecipientName: "",
    giftRecipientPhone: "",
    giftRecipientPhoneCountryIso: "ae",
    giftRecipientPhoneDialCode: "+971",
    giftRecipientAddress: "",
    giftRecipientNotes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [paymentMode] = useState<PaymentMode>("single");
  const [splitPayments, setSplitPayments] = useState<SplitPaymentEntry[]>([]);
  const [processingSplitId, setProcessingSplitId] = useState<string | null>(
    null,
  );
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [offerRequiredModalOpen, setOfferRequiredModalOpen] = useState(false);

  const applyPurchase = (next: MarketplacePurchase) => {
    setPurchase(next);
    const agreed = Number(next.agreed_price);
    if (Number.isFinite(agreed) && agreed > 0) {
      setResolvedPrice(agreed);
    }
    if (next.gift_product) {
      setDetails((prev) => ({
        ...prev,
        ...detailsFromGiftProduct(next.gift_product),
      }));
    }
    return next;
  };

  const refreshPurchase = async (id: string) => {
    const response = await getPurchase(id, locale);
    return applyPurchase(response.data.purchase);
  };

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
    refreshPurchase(purchaseId).catch(() => {
      // Purchase may still be optional for UI-only checkout paths.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when purchaseId/locale change
  }, [locale, purchaseId]);

  // PayTabs browser return lands on purchases page; also support checkout query.
  useEffect(() => {
    const isReturn =
      searchParams.get("purchase_return") === "1" ||
      searchParams.get("paytabs_return") === "1";
    if (!isReturn || !purchaseId) return;

    const failed = searchParams.get("paytabs_failed") === "1";
    if (failed) {
      toast.error(
        t("offer.paytabs_failed") ||
          "Payment was not completed. Please try again.",
      );
      setPaymentMethod("card");
      setStep(2);
      return;
    }

    let cancelled = false;
    let tries = 0;

    const poll = async () => {
      try {
        const next = await refreshPurchase(purchaseId);
        if (cancelled) return;
        const funded = next.payments?.some((payment) =>
          ["funded", "confirmed", "paid", "completed"].includes(
            String(payment.status || "").toLowerCase(),
          ),
        );
        if (funded || String(next.status).toLowerCase().includes("fund")) {
          setStep(3);
          toast.success(
            t("offer.payment_success") || "Payment completed successfully.",
          );
          return;
        }
      } catch {
        // keep polling
      }

      tries += 1;
      if (tries >= 15) {
        if (!cancelled) {
          toast(
            t("offer.payment_pending") ||
              "Payment received. Verification is still processing.",
          );
          setStep(3);
        }
        return;
      }

      if (!cancelled) {
        window.setTimeout(poll, 2000);
      }
    };

    setPaymentMethod("card");
    setStep(2);
    poll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseId, searchParams, t]);

  const plateType = listing?.plate_type || "private";
  const plateDesign = listing?.plate_design || "new_colorful";
  const plateVariant = `${plateType}_${plateDesign}`;
  const hideCode = isHiddenPlateCode(listing);
  const plate = resolvePlateParts(listing);

  const { totalDue: payableTotal, totalFees: payableFees } = resolvePayableTotal(
    resolvedPrice,
    purchase,
  );

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

  const giftBoxSummary = resolveGiftBoxSummary({
    isGiftCustody: details.custodyIntent === "gift",
    selectedProductId: details.giftPackageId,
    products: giftProducts,
    apiGift: purchase?.gift_product,
    apiTotalDue: purchase?.total_due,
    labelTemplate: t("private-deal.gift_package_label") || "{name} Package",
  });
  const dealPricing = {
    totalDue: payableTotal,
    totalFees: payableFees,
    giftPackageLabel: giftBoxSummary.label,
    giftPackageAmount: giftBoxSummary.amount,
    giftIncludedInTotals: giftBoxSummary.includedInTotals,
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

  const licenseSourceOptions = useMemo(
    () => resolveLicenseSourceOptions(null),
    [],
  );

  const getPartyPayload = () => {
    const mobile = toE164FromPhoneDigits(details.mobile) || details.mobile;
    const secondaryMobile =
      toE164FromPhoneDigits(details.secondaryMobile) || details.secondaryMobile;
    const isHoldCustody = details.custodyIntent === "hold";
    const isGiftCustody = details.custodyIntent === "gift";

    if (isHoldCustody || isGiftCustody) {
      return {
        intent: "complete",
        party_type: "individual",
        full_name: details.fullName,
        mobile_number: mobile,
        email: details.email,
        emirates_id: details.emiratesId || undefined,
        identification_type: "emirates_id",
        accept_terms: true,
        role_details: {
          notes: "",
        },
      };
    }

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
          licenseSourceOptions[0]?.key ||
          "mbr",
        authorized_mobile: secondaryMobile || mobile,
        email: details.email,
        accept_terms: true,
      };
    }

    return {
      intent: "complete",
      party_type: "individual",
      full_name: details.fullName,
      mobile_number: mobile,
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

  const handleSavePartyDetails = async () => {
    const ready = requirePurchaseOrPrompt();
    if (!ready) return;

    const mobileIso = details.mobileCountryIso || "ae";
    const mobileDial = details.mobileDialCode || "+971";
    const secondaryIso = details.secondaryMobileCountryIso || "ae";
    const secondaryDial = details.secondaryMobileDialCode || "+971";

    if (!hasNationalPhoneDigits(details.mobile, mobileDial)) {
      toast.error(t("common.email_or_mobile_required"));
      return;
    }
    if (!isValidCountryPhoneNumber(details.mobile, mobileIso)) {
      toast.error(
        t("common.phone_length_invalid") ||
          "Enter the full phone number for the selected country.",
      );
      return;
    }
    if (
      details.custodyIntent !== "hold" &&
      details.custodyIntent !== "gift" &&
      hasNationalPhoneDigits(details.secondaryMobile, secondaryDial) &&
      !isValidCountryPhoneNumber(details.secondaryMobile, secondaryIso)
    ) {
      toast.error(
        t("common.phone_length_invalid") ||
          "Enter the full phone number for the selected country.",
      );
      return;
    }

    if (details.custodyIntent === "gift") {
      if (!details.giftPackageId) {
        toast.error(
          t("private-deal.gift_package_required") ||
            "Please select a gift package to continue.",
        );
        return;
      }
      if (!(details.giftRecipientName || "").trim()) {
        toast.error(
          t("private-deal.gift_recipient_name_required") ||
            "Recipient name is required.",
        );
        return;
      }
      const giftIso = details.giftRecipientPhoneCountryIso || "ae";
      const giftDial = details.giftRecipientPhoneDialCode || "+971";
      if (
        !hasNationalPhoneDigits(details.giftRecipientPhone || "", giftDial) ||
        !isValidCountryPhoneNumber(details.giftRecipientPhone || "", giftIso)
      ) {
        toast.error(
          t("private-deal.gift_recipient_phone_required") ||
            "Recipient phone number is required.",
        );
        return;
      }
      if (!(details.giftRecipientAddress || "").trim()) {
        toast.error(
          t("private-deal.gift_recipient_address_required") ||
            "Recipient address is required.",
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const partyResponse = await savePurchaseParty(
        ready.purchaseId,
        getPartyPayload(),
        locale,
      );
      let nextPurchase = partyResponse.data.purchase;
      const currentAddons = nextPurchase.addons || purchase?.addons;
      const addonFlags = {
        include_delivery: Boolean(currentAddons?.include_delivery),
        include_fitting: Boolean(currentAddons?.include_fitting),
      };

      if (details.custodyIntent === "gift") {
        const giftRecipientPhone =
          toE164FromPhoneDigits(details.giftRecipientPhone || "") ||
          details.giftRecipientPhone ||
          "";
        const giftPayload = buildSelectGiftProductPayload({
          productId: Number(details.giftPackageId),
          name: details.giftRecipientName || "",
          phone: giftRecipientPhone,
          address: details.giftRecipientAddress || "",
          notes: details.giftRecipientNotes,
        });
        const addonsResponse = await updatePurchaseAddons(
          ready.purchaseId,
          {
            ...addonFlags,
            ...giftPayload,
          },
          locale,
        );
        nextPurchase = addonsResponse.data.purchase;
      } else if (nextPurchase.gift_product) {
        const addonsResponse = await updatePurchaseAddons(
          ready.purchaseId,
          {
            ...addonFlags,
            ...buildRemoveGiftProductPayload(),
          },
          locale,
        );
        nextPurchase = addonsResponse.data.purchase;
      }

      applyPurchase(nextPurchase);
      setStep(1);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save your details.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const processingPayment = processingSplitId
    ? splitPayments.find((payment) => payment.id === processingSplitId) || null
    : null;

  const pendingPurchasePayment =
    purchase?.payments?.find((payment) =>
      ["pending", "awaiting", "unpaid", "rejected", "processing"].includes(
        String(payment.status || "").toLowerCase(),
      ),
    ) || purchase?.payments?.[0];

  const pendingPurchasePaymentId = pendingPurchasePayment?.id;

  const custodyFromPayment = asCustodyRecord(
    pendingPurchasePayment?.custody_instructions,
  );

  // Purchase rows default to card until offline submit; bank IBAN still shown via defaults.
  const custodyInstructions: Record<string, unknown> = {
    ...custodyFromPayment,
    iban:
      (typeof custodyFromPayment?.iban === "string" &&
        custodyFromPayment.iban) ||
      (paymentMethod === "bank" ? MAZAL_BENEFICIARY_DEFAULTS.iban : ""),
    bank_name: custodyFromPayment?.bank_name,
    account_holder_name:
      custodyFromPayment?.account_holder_name ||
      MAZAL_BENEFICIARY_DEFAULTS.beneficiaryName,
    collection_location: custodyFromPayment?.collection_location,
    collection_address: custodyFromPayment?.collection_address,
  };

  const requirePurchaseOrPrompt = (): {
    purchaseId: string;
    paymentId: number;
  } | null => {
    if (!purchaseId || !pendingPurchasePaymentId) {
      setOfferRequiredModalOpen(true);
      return null;
    }
    return {
      purchaseId,
      paymentId: pendingPurchasePaymentId,
    };
  };

  const goToOfferPage = () => {
    setOfferRequiredModalOpen(false);
    router.push(`/${locale}/listings/${listingId}/offer`);
  };

  const handleSinglePaymentContinue = async () => {
    if (!requirePurchaseOrPrompt()) return;

    if (paymentMethod === "wallet") {
      setWalletModalOpen(true);
      return;
    }

    const entry: SplitPaymentEntry = {
      id: "single-payment",
      method: paymentMethod,
      amount: payableTotal,
      notes: "",
      status: "awaiting",
      createdAt: new Date().toISOString(),
      backendPaymentId: pendingPurchasePaymentId,
    };

    setSplitPayments([entry]);
    setProcessingSplitId("single-payment");
    setStep(2);
  };

  const handleCardPay = async (paymentToken: string) => {
    if (!processingPayment) return;

    setSubmitting(true);
    try {
      const ready = requirePurchaseOrPrompt();
      if (!ready) return;
      const { purchaseId: activePurchaseId, paymentId } = ready;

      const checkout = await createPurchaseCheckout(
        activePurchaseId,
        paymentId,
        locale,
        { payment_token: paymentToken },
      );

      handlePayTabsCheckoutResult(checkout.data, {
        onImmediateSuccess: () => {
          if (checkout.data.purchase) {
            setPurchase(checkout.data.purchase);
          }
          toast.success(
            t("offer.payment_success") || "Payment completed successfully.",
          );
          setStep(3);
        },
        onRedirect: () => {
          toast.success(
            t("listings.redirecting_paytabs") ||
              "Redirecting to secure payment…",
          );
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit payment.",
      );
    } finally {
      setSubmitting(false);
    }
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
    pickupAddress?: string;
  }) => {
    if (!processingPayment) return;

    setSubmitting(true);
    try {
      const ready = requirePurchaseOrPrompt();
      if (!ready) return;
      const { purchaseId: activePurchaseId, paymentId } = ready;

      if (processingPayment.method === "card") {
        const checkout = await createPurchaseCheckout(
          activePurchaseId,
          paymentId,
          locale,
        );
        handlePayTabsCheckoutResult(checkout.data, {
          onImmediateSuccess: () => {
            if (checkout.data.purchase) {
              setPurchase(checkout.data.purchase);
            }
            toast.success(
              t("offer.payment_success") || "Payment completed successfully.",
            );
            setStep(3);
          },
          onRedirect: () => {
            toast.success(
              t("listings.redirecting_paytabs") ||
                "Redirecting to secure payment…",
            );
          },
        });
        return;
      }

      const apiMethod = PAYMENT_METHOD_MAP[processingPayment.method];

      if (processingPayment.method === "bank") {
        if (!payload.evidence) {
          throw new Error(
            t("private-deal.error_evidence_required") ||
              "Payment evidence is required.",
          );
        }
        const response = await submitPurchasePaymentEvidence(
          activePurchaseId,
          paymentId,
          locale,
          {
            method: apiMethod as "bank_transfer",
            payment_reference: payload.paymentReference,
            evidence: payload.evidence,
            collection_notes: payload.notes,
          },
        );
        setPurchase(response.data.purchase);
      } else if (processingPayment.method === "managers_check") {
        const response = await submitPurchasePaymentEvidence(
          activePurchaseId,
          paymentId,
          locale,
          {
            method: "managers_check",
            check_number: payload.checkNumber,
            collection_date: payload.collectionDate,
            collection_time: payload.collectionTime,
            pickup_address: payload.pickupAddress,
            collection_notes: payload.notes,
          },
        );
        setPurchase(response.data.purchase);
      } else {
        const response = await submitPurchasePaymentEvidence(
          activePurchaseId,
          paymentId,
          locale,
          {
            method: "cash_collection",
            collection_date: payload.collectionDate,
            collection_time: payload.collectionTime,
            pickup_address: payload.pickupAddress,
            collection_notes: payload.notes,
          },
        );
        setPurchase(response.data.purchase);
      }

      toast.success(
        t("offer.payment_submitted") ||
          "Payment submitted for Mazal verification.",
      );
      setStep(3);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit payment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderMain = () => {
    if (step === 0) {
      return (
        <ConfirmDetailsStep
          data={details}
          onChange={patchDetails}
          onBack={() => router.push(`/${locale}/listings/${listingId}`)}
          beforeContinue={() => Boolean(requirePurchaseOrPrompt())}
          onContinue={() => void handleSavePartyDetails()}
          variant="buyer"
          showCustodyOptions
          continueLabel={t("private-deal.confirm")}
          submitting={submitting}
          licenseSources={licenseSourceOptions}
          products={giftProducts}
        />
      );
    }

    if (step === 1) {
      return (
        <PaymentMethodStep
          method={paymentMethod}
          mode={paymentMode}
          totalAmount={payableTotal}
          splitPayments={splitPayments}
          allowSplit={false}
          onMethodChange={setPaymentMethod}
          onModeChange={() => undefined}
          onSplitPaymentsChange={setSplitPayments}
          onBack={() => setStep(0)}
          onContinue={handleSinglePaymentContinue}
          onOpenWallet={() => router.push(`/${locale}/wallet`)}
          onProcessSplit={() => undefined}
          saving={submitting}
        />
      );
    }

    if (step === 2 && processingPayment) {
      return (
        <SplitPaymentProcessStep
          payment={{ ...processingPayment, amount: payableTotal }}
          custodyInstructions={custodyInstructions}
          submitting={submitting}
          onBack={() => {
            setProcessingSplitId(null);
            setStep(1);
          }}
          onComplete={handleSubmitPayment}
          onCardPay={handleCardPay}
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
            {t("offer.checkout_title")}
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
                  pricing={dealPricing}
                  plateCrop="deal-summary"
                />
              </div>
              {paymentMethod === "bank" && step >= 1 && (
                <BeneficiaryInformation
                  beneficiaryName={
                    typeof custodyInstructions?.account_holder_name === "string"
                      ? custodyInstructions.account_holder_name
                      : typeof custodyInstructions?.recipient === "string"
                        ? custodyInstructions.recipient
                        : undefined
                  }
                  iban={
                    typeof custodyInstructions?.iban === "string"
                      ? custodyInstructions.iban
                      : undefined
                  }
                />
              )}
              <EscrowBenefits />
            </div>
          </div>
        ) : (
          renderMain()
        )}
      </section>

      <WalletDialog
        isOpen={offerRequiredModalOpen}
        onClose={() => setOfferRequiredModalOpen(false)}
        title="Offer not accepted yet"
        icon={<Handshake className="w-5 h-5" />}
        maxWidth="max-w-[440px]"
      >
        <div
          className="rounded-2xl px-4 py-3.5 mb-6 text-sm leading-relaxed"
          style={{
            backgroundColor: getColor("primaryLight"),
            color: getColor("secondaryText"),
          }}
        >
          You have not accepted an offer yet. Please accept an offer first, then
          come back here to complete your payment.
        </div>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={goToOfferPage}
        >
          Go to Offer Page
        </Button>
      </WalletDialog>

      <WalletPaymentModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        amountDue={payableTotal}
        reference={t("private-deal.payment_title")}
        onPaid={async () => {
          const ready = requirePurchaseOrPrompt();
          if (!ready) {
            throw new Error("Offer not accepted yet.");
          }
          await payPurchaseWithWallet(
            ready.purchaseId,
            ready.paymentId,
            locale,
          );
          toast.success(t("wallet.paid_from_wallet"));
          setStep(3);
        }}
      />
    </div>
  );
}
