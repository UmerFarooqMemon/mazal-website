"use client";

/**
 * Custody checkout for MarketplacePurchase (`/purchases/*`).
 * Used by marketplace listing checkout and auction winner checkout.
 * Private deals stay on `services/private-deals`.
 */

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
import {
  useWalletPaymentChoice,
  walletCoversAmount,
} from "@/hooks/useWalletPaymentChoice";
import { detailsFromGiftProduct, resolveGiftBoxSummary } from "@/lib/gift-box";
import {
  canTransactListing,
  createPurchaseCheckout,
  buyListingAtAskingPrice,
  getListingDetail,
  getMyPurchases,
  getPurchase,
  isHiddenPlateCode,
  isListingReserved,
  isListingSold,
  isOpenMarketplacePurchase,
  isPurchaseCustodyFunded,
  payPurchaseWithWallet,
  resolvePlateParts,
  savePurchasePaymentPlan,
  asMarketplaceMoney,
  submitPurchasePaymentEvidence,
  updatePurchaseAddons,
  downloadPurchaseInvoice,
  type MarketplaceListingDetail,
  type MarketplacePaymentPlanMethod,
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
import {
  readCheckoutIntent,
  rememberCheckoutIntent,
  stripUrlSearch,
  type CheckoutIntent,
} from "@/lib/checkout-intent";

const PAYMENT_METHOD_MAP: Record<
  Exclude<PaymentMethod, "wallet">,
  "bank_transfer" | "card" | "managers_check" | "cash_collection"
> = {
  bank: "bank_transfer",
  card: "card",
  managers_check: "managers_check",
  cash: "cash_collection",
};

interface PurchaseCheckoutProps {
  listingId: string;
  /** marketplace = listing buy/offer; auction = winning-bid custody pay */
  flow?: "marketplace" | "auction";
}

function asCustodyRecord(
  value: unknown,
): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as Record<string, unknown>;
}

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

function purchasesFromPayload(payload: unknown): MarketplacePurchase[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  if (Array.isArray(data.purchases)) {
    return data.purchases as MarketplacePurchase[];
  }
  if (Array.isArray(data.data)) {
    return data.data as MarketplacePurchase[];
  }
  return [];
}

function isFundedPaymentStatus(status?: string | null) {
  return ["funded", "confirmed", "paid", "completed"].includes(
    String(status || "").toLowerCase(),
  );
}

function fromApiPaymentMethod(method?: string | null): PaymentMethod {
  const value = String(method || "").toLowerCase();
  if (value === "wallet") return "wallet";
  if (value === "card") return "card";
  if (value === "managers_check") return "managers_check";
  if (value === "cash_collection" || value === "cash") return "cash";
  return "bank";
}

function toApiPaymentMethod(method: PaymentMethod): MarketplacePaymentPlanMethod {
  if (method === "wallet") return "wallet";
  if (method === "card") return "card";
  if (method === "managers_check") return "managers_check";
  if (method === "cash") return "cash_collection";
  return "bank_transfer";
}

function mapPurchasePaymentsToSplits(
  purchase: MarketplacePurchase,
): SplitPaymentEntry[] {
  return (purchase.payments || []).map((payment) => ({
    id: `pay-${payment.id}`,
    method: fromApiPaymentMethod(payment.method),
    amount: Number(payment.amount) || 0,
    notes: "",
    backendPaymentId: payment.id,
    status: isFundedPaymentStatus(payment.status) ? "completed" : "awaiting",
    createdAt: payment.submitted_at || purchase.created_at,
  }));
}

function purchaseMatchesListing(
  purchase: MarketplacePurchase,
  listingId: string,
) {
  return (
    String(purchase.listing_id) === listingId ||
    String(purchase.listing?.id) === listingId
  );
}

export default function PurchaseCheckout({
  listingId,
  flow = "marketplace",
}: PurchaseCheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const { products: giftProducts } = useGiftProducts();
  const isRTL = locale === "ar";

  const [purchaseLookupDone, setPurchaseLookupDone] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | undefined>();
  const [initialRole, setInitialRole] = useState<"buyer" | "seller">("buyer");
  const [agreedPrice, setAgreedPrice] = useState(0);

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
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("single");
  const [splitPayments, setSplitPayments] = useState<SplitPaymentEntry[]>([]);
  const [processingSplitId, setProcessingSplitId] = useState<string | null>(
    null,
  );
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [offerRequiredModalOpen, setOfferRequiredModalOpen] = useState(false);
  const [gatewayReturn] = useState(() => ({
    isReturn:
      searchParams.get("purchase_return") === "1" ||
      searchParams.get("paytabs_return") === "1",
    failed: searchParams.get("paytabs_failed") === "1",
    purchaseId: searchParams.get("purchaseId") || undefined,
    role:
      searchParams.get("role") === "seller"
        ? ("seller" as const)
        : searchParams.get("role") === "buyer"
          ? ("buyer" as const)
          : undefined,
    price: Number(searchParams.get("price")),
  }));

  useEffect(() => {
    const stored = readCheckoutIntent(flow, listingId);
    const queryPrice =
      Number.isFinite(gatewayReturn.price) && gatewayReturn.price > 0
        ? gatewayReturn.price
        : undefined;
    const merged: CheckoutIntent = {
      role: gatewayReturn.role || stored?.role || "buyer",
      purchaseId: gatewayReturn.purchaseId || stored?.purchaseId,
      price: queryPrice ?? stored?.price,
      step: stored?.step,
      details: stored?.details,
    };
    rememberCheckoutIntent(flow, listingId, merged);
    setInitialRole(merged.role === "seller" ? "seller" : "buyer");
    if (merged.details && typeof merged.details === "object") {
      setDetails((prev) => ({
        ...prev,
        ...(merged.details as Partial<ConfirmDetailsData>),
      }));
    }
    if (
      !gatewayReturn.isReturn &&
      typeof merged.step === "number" &&
      merged.step >= 0 &&
      merged.step <= 2
    ) {
      setStep(merged.step);
    }
    if (merged.price && merged.price > 0) {
      setAgreedPrice(merged.price);
      setResolvedPrice(merged.price);
    }
    if (merged.purchaseId) {
      setPurchaseId(String(merged.purchaseId));
      setPurchaseLookupDone(true);
    } else {
      getMyPurchases(locale, "buyer")
        .then((response) => {
          const match = purchasesFromPayload(response.data).find(
            (row) =>
              purchaseMatchesListing(row, listingId) &&
              isOpenMarketplacePurchase(row),
          );
          if (!match?.id) return;
          const id = String(match.id);
          setPurchaseId(id);
          const agreed = Number(match.agreed_price);
          rememberCheckoutIntent(flow, listingId, {
            ...merged,
            purchaseId: id,
            price:
              merged.price ||
              (Number.isFinite(agreed) && agreed > 0 ? agreed : undefined),
          });
        })
        .catch(() => undefined)
        .finally(() => setPurchaseLookupDone(true));
    }
    stripUrlSearch();
  }, [flow, gatewayReturn, listingId, locale]);

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
    const mapped = mapPurchasePaymentsToSplits(next);
    if (mapped.length > 0) {
      setSplitPayments(mapped);
    }
    if (next.can_split_payment) {
      setPaymentMode(
        next.payment_plan === "split" || mapped.length > 1 ? "split" : "single",
      );
    } else {
      setPaymentMode("single");
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

  // PayTabs return may briefly include query flags; they are stripped after capture.
  useEffect(() => {
    if (!gatewayReturn.isReturn || !purchaseId) return;

    if (gatewayReturn.failed) {
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
          isFundedPaymentStatus(payment.status),
        );
        if (isPurchaseCustodyFunded(next)) {
          setStep(3);
          toast.success(
            t("offer.payment_success") || "Payment completed successfully.",
          );
          return;
        }
        if (funded || String(next.status).toLowerCase() === "partially_funded") {
          setStep(1);
          toast.success(
            t("offer.installment_paid") ||
              "Installment funded. Remaining amount is still due.",
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
  }, [purchaseId, gatewayReturn, t]);

  const plateSource = purchase?.listing || listing;
  const plateType = plateSource?.plate_type || listing?.plate_type || "private";
  const plateDesign =
    plateSource?.plate_design || listing?.plate_design || "new_colorful";
  const plateVariant = `${plateType}_${plateDesign}`;
  const hideCode = purchase ? false : isHiddenPlateCode(listing);
  const plate = resolvePlateParts(plateSource || listing);

  const { totalDue: payableTotal, totalFees: payableFees } =
    resolvePayableTotal(resolvedPrice, purchase);
  const walletAmountDue =
    Number(purchase?.total_due) || payableTotal;
  const walletChoice = useWalletPaymentChoice(walletAmountDue);

  const feeBreakdown = (purchase?.fee_snapshot ?? [])
    .filter((row) => row?.label != null && row.amount != null)
    .map((row) => ({
      slug: String(row.slug || row.label),
      label: String(row.label),
      amount: String(row.amount),
    }));

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
    feeBreakdown: feeBreakdown.length > 0 ? feeBreakdown : undefined,
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

  useEffect(() => {
    rememberCheckoutIntent(flow, listingId, {
      purchaseId,
      price: resolvedPrice || agreedPrice,
      step,
      details: details as unknown as Record<string, unknown>,
    });
  }, [agreedPrice, details, flow, listingId, purchaseId, resolvedPrice, step]);

  const licenseSourceOptions = useMemo(
    () => resolveLicenseSourceOptions(null),
    [],
  );

  const addonFlagsFromPurchase = (current?: MarketplacePurchase | null) => ({
    include_delivery: Boolean(current?.addons?.include_delivery),
    include_fitting: Boolean(current?.addons?.include_fitting),
    delivery_address: current?.addons?.delivery_address || undefined,
    delivery_notes: current?.addons?.delivery_notes || undefined,
  });

  const handleSavePartyDetails = async () => {
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
      let activeId = purchaseId;
      let nextPurchase = purchase;

      if (!activeId && flow === "marketplace") {
        const created = await buyListingAtAskingPrice(
          listingId,
          locale,
          resolvedPrice,
        );
        const createdPurchase = created.data.purchase;
        if (!createdPurchase?.id) {
          throw new Error("Failed to start purchase.");
        }
        activeId = String(createdPurchase.id);
        setPurchaseId(activeId);
        nextPurchase = applyPurchase(createdPurchase);
        rememberCheckoutIntent(flow, listingId, {
          role: "buyer",
          purchaseId: activeId,
          price: resolvedPrice,
          step: 1,
          details: details as unknown as Record<string, unknown>,
        });
      }

      if (!activeId) {
        if (flow === "auction") {
          toast.error("Auction payment is not ready yet.");
          return;
        }
        setOfferRequiredModalOpen(true);
        return;
      }

      const addonFlags = addonFlagsFromPurchase(nextPurchase);

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
          activeId,
          {
            ...addonFlags,
            ...giftPayload,
          },
          locale,
        );
        nextPurchase = addonsResponse.data.purchase;
      } else if (nextPurchase?.gift_product) {
        const addonsResponse = await updatePurchaseAddons(
          activeId,
          {
            ...addonFlags,
            ...buildRemoveGiftProductPayload(),
          },
          locale,
        );
        nextPurchase = addonsResponse.data.purchase;
      }

      if (nextPurchase) {
        applyPurchase(nextPurchase);
      }
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

  const pendingPurchasePaymentId =
    processingPayment?.backendPaymentId ?? pendingPurchasePayment?.id;

  const canReplacePlan =
    Boolean(purchase?.can_split_payment) &&
    !(purchase?.payments || []).some((payment) =>
      isFundedPaymentStatus(payment.status),
    );

  const persistPaymentPlan = async (payments: SplitPaymentEntry[]) => {
    if (!purchaseId) {
      setSplitPayments(payments);
      return;
    }
    const plan = payments.length > 1 ? "split" : "single";
    const response = await savePurchasePaymentPlan(purchaseId, locale, {
      intent: "complete",
      plan,
      entries: payments.map((payment) => ({
        amount: asMarketplaceMoney(payment.amount),
        method: toApiPaymentMethod(payment.method),
        notes: payment.notes || undefined,
      })),
    });
    applyPurchase(response.data.purchase);
  };

  const finishPaymentIfComplete = (next?: MarketplacePurchase | null) => {
    if (next && isPurchaseCustodyFunded(next)) {
      setStep(3);
      return;
    }
    setProcessingSplitId(null);
    setStep(1);
  };

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
      if (flow === "auction") {
        toast.error("Auction payment is not ready yet.");
        return null;
      }
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
      walletChoice.selectWalletOrRedirect(() => {
        setWalletModalOpen(true);
      });
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
            applyPurchase(checkout.data.purchase);
          }
          toast.success(
            t("offer.payment_success") || "Payment completed successfully.",
          );
          finishPaymentIfComplete(checkout.data.purchase);
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
    collectionSlotId?: number;
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
              applyPurchase(checkout.data.purchase);
            }
            toast.success(
              t("offer.payment_success") || "Payment completed successfully.",
            );
            finishPaymentIfComplete(checkout.data.purchase);
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

      if (processingPayment.method === "wallet") {
        setWalletModalOpen(true);
        return;
      }

      const apiMethod = PAYMENT_METHOD_MAP[processingPayment.method];
      let nextPurchase: MarketplacePurchase | undefined;

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
        nextPurchase = applyPurchase(response.data.purchase);
      } else if (processingPayment.method === "managers_check") {
        const response = await submitPurchasePaymentEvidence(
          activePurchaseId,
          paymentId,
          locale,
          {
            method: "managers_check",
            check_number: payload.checkNumber,
            collection_slot_id: payload.collectionSlotId,
            pickup_address: payload.pickupAddress,
            collection_notes: payload.notes,
          },
        );
        nextPurchase = applyPurchase(response.data.purchase);
      } else {
        const response = await submitPurchasePaymentEvidence(
          activePurchaseId,
          paymentId,
          locale,
          {
            method: "cash_collection",
            collection_slot_id: payload.collectionSlotId,
            pickup_address: payload.pickupAddress,
            collection_notes: payload.notes,
          },
        );
        nextPurchase = applyPurchase(response.data.purchase);
      }

      toast.success(
        t("offer.payment_submitted") ||
          "Payment submitted for Mazal verification.",
      );
      finishPaymentIfComplete(nextPurchase);
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
          onBack={() =>
            router.push(
              flow === "auction"
                ? `/${locale}/auctions/${listingId}`
                : `/${locale}/listings/${listingId}`,
            )
          }
          beforeContinue={undefined}
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
          totalAmount={Number(purchase?.total_due) || payableTotal}
          splitPayments={splitPayments}
          allowSplit={Boolean(purchase?.can_split_payment)}
          allowWalletSplit={Boolean(purchase?.can_split_payment)}
          requireExactSum
          minSplitEntries={2}
          maxSplitEntries={10}
          allowEditSplits={canReplacePlan}
          onMethodChange={setPaymentMethod}
          onModeChange={(mode) => {
            setPaymentMode(mode);
            if (
              mode === "single" &&
              purchaseId &&
              purchase?.can_split_payment &&
              canReplacePlan
            ) {
              void persistPaymentPlan([
                {
                  id: "single-payment",
                  method: paymentMethod === "wallet" ? "card" : paymentMethod,
                  amount: Number(purchase.total_due) || payableTotal,
                  notes: "",
                  status: "awaiting",
                  createdAt: new Date().toISOString(),
                },
              ]).catch((err) => {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Could not save payment plan.",
                );
              });
            }
          }}
          onSplitPaymentsChange={async (payments) => {
            try {
              await persistPaymentPlan(payments);
            } catch (err) {
              toast.error(
                err instanceof Error
                  ? err.message
                  : "Could not save payment plan.",
              );
              throw err;
            }
          }}
          onBack={() => setStep(0)}
          onContinue={handleSinglePaymentContinue}
          onWalletClick={() => {
            walletChoice.selectWalletOrRedirect(() => {
              setPaymentMethod("wallet");
              setWalletModalOpen(true);
            });
          }}
          onProcessSplit={(paymentId) => {
            const row = splitPayments.find((payment) => payment.id === paymentId);
            setProcessingSplitId(paymentId);
            if (row?.method === "wallet") {
              if (
                !walletCoversAmount(walletChoice.availableBalance, row.amount)
              ) {
                walletChoice.goToWallet();
                return;
              }
              setWalletModalOpen(true);
              return;
            }
            setStep(2);
          }}
          saving={submitting}
        />
      );
    }

    if (step === 2 && processingPayment) {
      return (
        <SplitPaymentProcessStep
          payment={processingPayment}
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
      <>
        <PaymentSuccessStep
          onDone={() =>
            router.push(
              flow === "auction"
                ? `/${locale}/dashboard`
                : `/${locale}/marketplace`,
            )
          }
        />
        {purchaseId && isPurchaseCustodyFunded(purchase) ? (
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                downloadPurchaseInvoice(purchaseId, locale)
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `mazal-invoice-${purchaseId}.pdf`;
                    link.click();
                    URL.revokeObjectURL(url);
                  })
                  .catch((err) => {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Invoice is not available yet.",
                    );
                  });
              }}
            >
              {t("offer.download_invoice") || "Download invoice"}
            </Button>
            {purchase?.can_gift ? (
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/buyer/gifts`)}
              >
                {t("offer.send_gift") || "Send as gift"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </>
    );
  };

  const showSidebar = step < 3;

  const listingBlocked =
    flow !== "auction" &&
    listing != null &&
    purchaseLookupDone &&
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
              {purchase?.paid_amount != null && purchase?.total_due != null ? (
                <p
                  className="text-sm"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("offer.paid_progress") || "Paid"}{" "}
                  {asMarketplaceMoney(purchase.paid_amount)} /{" "}
                  {asMarketplaceMoney(purchase.total_due)}
                  {purchase.remaining_amount != null
                    ? ` · ${t("offer.remaining") || "Remaining"} ${asMarketplaceMoney(purchase.remaining_amount)}`
                    : ""}
                </p>
              ) : null}
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
        isOpen={flow !== "auction" && offerRequiredModalOpen}
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
        amountDue={processingPayment?.amount || payableTotal}
        reference={t("private-deal.payment_title")}
        onPaid={async () => {
          const ready = requirePurchaseOrPrompt();
          if (!ready) {
            throw new Error("Offer not accepted yet.");
          }
          const response = await payPurchaseWithWallet(
            ready.purchaseId,
            ready.paymentId,
            locale,
          );
          if (response.data.purchase) {
            applyPurchase(response.data.purchase);
          }
          toast.success(t("wallet.paid_from_wallet"));
          finishPaymentIfComplete(response.data.purchase);
        }}
      />
    </div>
  );
}
