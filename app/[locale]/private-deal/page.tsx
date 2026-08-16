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
import BeneficiaryInformation from "@/components/ui/BeneficiaryInformation";
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
import GiftNoPaymentBanner from "@/components/private-deal/GiftNoPaymentBanner";
import WalletPaymentModal from "@/components/wallet/WalletPaymentModal";
import { useGiftProducts } from "@/hooks/useGiftProducts";
import {
  useWalletPaymentChoice,
  walletCoversAmount,
} from "@/hooks/useWalletPaymentChoice";
import { detailsFromGiftProduct, resolveGiftBoxSummary } from "@/lib/gift-box";
import {
  buildRemoveGiftProductPayload,
  buildSelectGiftProductPayload,
} from "@/services/products";
import {
  hasNationalPhoneDigits,
  isValidCountryPhoneNumber,
  toE164FromPhoneDigits,
} from "@/lib/phone-validation";
import { resolveLicenseSourceOptions } from "@/config/license-sources";
import {
  createPrivateDeal,
  createPrivateDealCheckout,
  createPrivateDealFormData,
  extractPrivateDeal,
  getPrivateDeal,
  getPrivateDealOptions,
  issuePrivateDealInvitation,
  joinPrivateDeal,
  payPrivateDealWithWallet,
  resolveOtherItemOptions,
  savePrivateDealParty,
  savePrivateDealPaymentPlan,
  submitPrivateDealPayment,
  updatePrivateDealGiftProduct,
  updatePrivateDealTerms,
  updatePrivateDealTermsFormData,
  type PrivateDeal,
  type PrivateDealOptions,
} from "@/services/private-deals";
import { handlePayTabsCheckoutResult } from "@/lib/paytabs";

const STICKY_HEADER_OFFSET = 69;

const PAYMENT_METHOD_MAP: Record<PaymentMethod, string> = {
  bank: "bank_transfer",
  card: "card",
  managers_check: "managers_check",
  cash: "cash_collection",
  wallet: "wallet",
};

export default function PrivateDealPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const { products: giftProducts } = useGiftProducts();
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
  const [inviteDelivery, setInviteDelivery] = useState("manual_share");
  const [inviteEmailSent, setInviteEmailSent] = useState(false);
  const [deal, setDeal] = useState<DealData>({
    role: null,
    emirate: "dubai",
    plateType: "private",
    plateVariant: "private_new_colorful",
    code: "",
    digit: "",
    price: 0,
    sellingType: "plate",
    itemTitle: "",
    itemDescription: "",
    itemImageFiles: [],
    itemImageUrls: [],
    itemApiImages: [],
    removedItemImageIds: [],
    itemSerial: "",
  });
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
    giftPackageId: "" as const,
    giftRecipientName: "",
    giftRecipientPhone: "",
    giftRecipientPhoneCountryIso: "ae",
    giftRecipientPhoneDialCode: "+971",
    giftRecipientAddress: "",
    giftRecipientNotes: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("single");
  const [splitPayments, setSplitPayments] = useState<SplitPaymentEntry[]>([]);
  const [splitAllocatedLive, setSplitAllocatedLive] = useState(0);
  const [processingSplitId, setProcessingSplitId] = useState<string | null>(
    null,
  );
  const [walletModalOpen, setWalletModalOpen] = useState(false);

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

    const isOtherDeal = nextDeal.deal_type === "other";
    setDeal((prev) => ({
      ...prev,
      role: roleOverride || prev.role,
      sellingType: isOtherDeal ? "other" : "plate",
      emirate: nextDeal.plate?.emirate || prev.emirate,
      plateType: nextDeal.plate?.type || prev.plateType,
      plateVariant: nextDeal.plate?.variant || prev.plateVariant,
      code: nextDeal.plate?.code || prev.code,
      digit: nextDeal.plate?.digits || prev.digit,
      itemTitle: isOtherDeal
        ? nextDeal.item?.title || prev.itemTitle || ""
        : "",
      itemDescription: isOtherDeal
        ? nextDeal.item?.description || prev.itemDescription || ""
        : "",
      itemSerial: isOtherDeal
        ? nextDeal.item?.serial_number || prev.itemSerial || ""
        : "",
      itemApiImages: isOtherDeal ? nextDeal.item?.images || [] : [],
      itemImageFiles: [],
      itemImageUrls: [],
      removedItemImageIds: [],
      price: Number(nextDeal.agreed_price || prev.price || 0),
    }));

    if (nextDeal.is_gift != null || nextDeal.recipient_email) {
      setDetails((prev) => ({
        ...prev,
        giftPlate: Boolean(nextDeal.is_gift),
        giftEmail: nextDeal.recipient_email || prev.giftEmail || "",
        giftMessage: nextDeal.gift_message || prev.giftMessage || "",
      }));
    }

    if (nextDeal.gift_product) {
      setDetails((prev) => ({
        ...prev,
        ...detailsFromGiftProduct(nextDeal.gift_product),
      }));
    }
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
  const isPhysicalGiftBox = details.custodyIntent === "gift";
  const isGiftDeal =
    !isPhysicalGiftBox &&
    (Boolean(apiDeal?.is_gift) ||
      Boolean(details.giftPlate) ||
      apiDeal?.buyer_payment_required === false);
  const buyerPaymentRequired =
    isPhysicalGiftBox ||
    (!isGiftDeal && apiDeal?.buyer_payment_required !== false);
  const giftBoxSummary = resolveGiftBoxSummary({
    isGiftCustody: isPhysicalGiftBox,
    selectedProductId: details.giftPackageId,
    products: giftProducts,
    apiGift: apiDeal?.gift_product,
    apiTotalDue: apiDeal?.total_due,
    labelTemplate: t("private-deal.gift_package_label") || "{name} Package",
  });
  const summaryPricing = {
    feeBreakdown: apiDeal?.fee_breakdown,
    totalFees: apiDeal?.total_fees,
    totalDue: isGiftDeal ? (apiDeal?.total_due ?? "0.00") : apiDeal?.total_due,
    sellerNet: isGiftDeal
      ? (apiDeal?.seller_net ?? "0.00")
      : apiDeal?.seller_net,
    isGift: isGiftDeal,
    buyerPaymentRequired: !buyerPaymentRequired ? false : undefined,
    giftPackageLabel: giftBoxSummary.label,
    giftPackageAmount: giftBoxSummary.amount,
    giftIncludedInTotals: giftBoxSummary.includedInTotals,
  };
  const payableTotal =
    Number(apiDeal?.total_due) > 0 ? Number(apiDeal?.total_due) : deal.price;
  const walletChoice = useWalletPaymentChoice(payableTotal);

  const licenseSourceOptions = useMemo(
    () => resolveLicenseSourceOptions(options?.license_sources),
    [options?.license_sources],
  );
  const otherItemOptions = useMemo(
    () => resolveOtherItemOptions(options),
    [options],
  );

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
  // Gift deals skip payment (buyer_payment_required === false).
  const buyerSteps: StepItem[] = useMemo(() => {
    const labels = buyerPaymentRequired
      ? [
          t("private-deal.stepper_role"),
          t("private-deal.stepper_verification"),
          t("private-deal.stepper_confirm"),
          t("private-deal.stepper_payment"),
          t("private-deal.stepper_escrow"),
        ]
      : [
          t("private-deal.stepper_role"),
          t("private-deal.stepper_verification"),
          t("private-deal.stepper_confirm"),
          t("private-deal.stepper_escrow"),
        ];
    const stepperIndex = buyerPaymentRequired
      ? step <= 2
        ? step
        : step === 3 || step === 4
          ? 3
          : 4
      : step <= 2
        ? step
        : 3;
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
  }, [step, t, buyerPaymentRequired]);

  const visibleStepper = step >= 1;

  const patchDeal = (patch: Partial<DealData>) =>
    setDeal((prev) => ({ ...prev, ...patch }));
  const patchDetails = (patch: Partial<ConfirmDetailsData>) =>
    setDetails((prev) => ({ ...prev, ...patch }));

  const handleRemoveItemImage = () => {
    deal.itemImageUrls?.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    const activeApiImages =
      deal.itemApiImages?.filter(
        (image) => !deal.removedItemImageIds?.includes(image.id),
      ) || [];

    patchDeal({
      itemImageFiles: [],
      itemImageUrls: [],
      removedItemImageIds:
        activeApiImages.length > 0
          ? [
              ...new Set([
                ...(deal.removedItemImageIds || []),
                ...activeApiImages.map((image) => image.id),
              ]),
            ]
          : deal.removedItemImageIds,
    });
  };

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

  const appendGiftFields = (target: FormData | Record<string, unknown>) => {
    const isGift = Boolean(details.giftPlate);
    const recipientEmail = isGift ? (details.giftEmail || "").trim() : "";
    const giftMessage = isGift
      ? details.giftMessage?.trim() || undefined
      : undefined;

    if (target instanceof FormData) {
      if (isGift) {
        target.append("is_gift", "1");
      }
      if (recipientEmail) {
        target.append("recipient_email", recipientEmail);
      }
      if (giftMessage) {
        target.append("gift_message", giftMessage);
      }
      return;
    }

    target.is_gift = isGift;
    if (recipientEmail) {
      target.recipient_email = recipientEmail;
    }
    if (giftMessage) {
      target.gift_message = giftMessage;
    }
  };

  const buildOtherDealFormData = (intent: "complete" | "draft" = "complete") => {
    const formData = new FormData();
    formData.append("deal_type", "other");
    formData.append("intent", intent);
    formData.append("item_title", (deal.itemTitle || "").trim());
    formData.append("item_description", (deal.itemDescription || "").trim());
    if ((deal.itemSerial || "").trim()) {
      formData.append("item_serial_number", (deal.itemSerial || "").trim());
    }
    formData.append("agreed_price", asMoney(deal.price));
    appendGiftFields(formData);

    for (const file of deal.itemImageFiles || []) {
      formData.append("images[]", file);
    }

    for (const imageId of deal.removedItemImageIds || []) {
      formData.append("remove_image_ids[]", String(imageId));
    }

    return formData;
  };

  const syncOtherDealTerms = async (activeDealId: string) => {
    const response = await updatePrivateDealTermsFormData(
      activeDealId,
      buildOtherDealFormData("complete"),
      locale,
    );
    const nextDeal = extractPrivateDeal(response);
    hydrateFromApiDeal(nextDeal, "seller");
    return nextDeal;
  };

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
    const mobile = toE164FromPhoneDigits(details.mobile) || details.mobile;
    const secondaryMobile =
      toE164FromPhoneDigits(details.secondaryMobile) || details.secondaryMobile;
    const isHoldCustody = details.custodyIntent === "hold";
    const isGiftCustody = details.custodyIntent === "gift";

    // Hold custody / physical gift box: personal details only.
    // Gift package + recipient go through PATCH /gift-product.
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

  const handleSellerPlateContinue = () => {
    setStep(2);
  };

  const handleSavePartyDetails = async (variant: "seller" | "buyer") => {
    await withSubmit(async () => {
      const mobileIso = details.mobileCountryIso || "ae";
      const mobileDial = details.mobileDialCode || "+971";
      const secondaryIso = details.secondaryMobileCountryIso || "ae";
      const secondaryDial = details.secondaryMobileDialCode || "+971";

      if (!hasNationalPhoneDigits(details.mobile, mobileDial)) {
        throw new Error(t("common.email_or_mobile_required"));
      }
      if (!isValidCountryPhoneNumber(details.mobile, mobileIso)) {
        throw new Error(
          t("common.phone_length_invalid") ||
            "Enter the full phone number for the selected country.",
        );
      }
      if (
        details.custodyIntent === "transfer" &&
        hasNationalPhoneDigits(details.secondaryMobile, secondaryDial) &&
        !isValidCountryPhoneNumber(details.secondaryMobile, secondaryIso)
      ) {
        throw new Error(
          t("common.phone_length_invalid") ||
            "Enter the full phone number for the selected country.",
        );
      }

      if (variant === "buyer" && details.custodyIntent === "gift") {
        if (!details.giftPackageId) {
          throw new Error(
            t("private-deal.gift_package_required") ||
              "Please select a gift package to continue.",
          );
        }
        if (!(details.giftRecipientName || "").trim()) {
          throw new Error(
            t("private-deal.gift_recipient_name_required") ||
              "Recipient name is required.",
          );
        }
        const giftIso = details.giftRecipientPhoneCountryIso || "ae";
        const giftDial = details.giftRecipientPhoneDialCode || "+971";
        if (
          !hasNationalPhoneDigits(details.giftRecipientPhone || "", giftDial) ||
          !isValidCountryPhoneNumber(details.giftRecipientPhone || "", giftIso)
        ) {
          throw new Error(
            t("private-deal.gift_recipient_phone_required") ||
              "Recipient phone number is required.",
          );
        }
        if (!(details.giftRecipientAddress || "").trim()) {
          throw new Error(
            t("private-deal.gift_recipient_address_required") ||
              "Recipient address is required.",
          );
        }
      }

      if (variant === "seller" && details.giftPlate) {
        const email = (details.giftEmail || "").trim();
        if (!email) {
          throw new Error(
            t("private-deal.gift_email_required") ||
              "Recipient email is required for gift deals.",
          );
        }
      }

      let activeDealId = resolveDealId();
      let nextDeal: PrivateDeal;

      if (variant === "seller" && !activeDealId) {
        if (deal.sellingType === "other") {
          const createResponse = await createPrivateDealFormData(
            buildOtherDealFormData("complete"),
            locale,
          );
          nextDeal = extractPrivateDeal(createResponse);
        } else {
          const createPayload: Record<string, unknown> = {
            intent: "complete",
            emirate: deal.emirate,
            plate_variant: deal.plateVariant,
            plate_type: deal.plateType,
            plate_code: deal.code || undefined,
            plate_digits: deal.digit,
            plate_design: undefined,
            agreed_price: asMoney(deal.price),
          };
          appendGiftFields(createPayload);
          const createResponse = await createPrivateDeal(createPayload, locale);
          nextDeal = extractPrivateDeal(createResponse);
        }
        hydrateFromApiDeal(nextDeal, "seller");
        activeDealId = String(nextDeal.id);
      } else {
        if (!activeDealId) {
          throw new Error("Deal not found.");
        }

        if (variant === "seller") {
          if (deal.sellingType === "other") {
            nextDeal = await syncOtherDealTerms(activeDealId);
          } else {
            const termsPayload: Record<string, unknown> = {
              intent: "complete",
              deal_type: "plate",
              emirate: deal.emirate,
              plate_variant: deal.plateVariant,
              plate_type: deal.plateType,
              plate_code: deal.code || undefined,
              plate_digits: deal.digit,
              agreed_price: asMoney(deal.price),
            };
            appendGiftFields(termsPayload);
            const termsResponse = await updatePrivateDealTerms(
              activeDealId,
              termsPayload,
              locale,
            );
            nextDeal = extractPrivateDeal(termsResponse);
            hydrateFromApiDeal(nextDeal, "seller");
          }
        }
      }

      if (!activeDealId) {
        throw new Error("Deal not found.");
      }

      const partyResponse = await savePrivateDealParty(
        activeDealId,
        getPartyPayload(),
        locale,
      );
      nextDeal = extractPrivateDeal(partyResponse);
      hydrateFromApiDeal(nextDeal, variant);

      if (variant === "buyer") {
        if (details.custodyIntent === "gift") {
          const giftRecipientPhone =
            toE164FromPhoneDigits(details.giftRecipientPhone || "") ||
            details.giftRecipientPhone ||
            "";
          const giftResponse = await updatePrivateDealGiftProduct(
            activeDealId,
            buildSelectGiftProductPayload({
              productId: Number(details.giftPackageId),
              name: details.giftRecipientName || "",
              phone: giftRecipientPhone,
              address: details.giftRecipientAddress || "",
              notes: details.giftRecipientNotes,
            }),
            locale,
          );
          nextDeal = extractPrivateDeal(giftResponse);
          hydrateFromApiDeal(nextDeal, variant);
        } else if (nextDeal.gift_product) {
          const giftResponse = await updatePrivateDealGiftProduct(
            activeDealId,
            buildRemoveGiftProductPayload(),
            locale,
          );
          nextDeal = extractPrivateDeal(giftResponse);
          hydrateFromApiDeal(nextDeal, variant);
        }
      }

      if (
        variant === "buyer" &&
        details.custodyIntent !== "gift" &&
        nextDeal.buyer_payment_required === false
      ) {
        setStep(5);
        return;
      }

      setStep(3);
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
      setInviteDelivery(response.data.invitation.delivery || "manual_share");
      setInviteEmailSent(Boolean(response.data.invitation_email_sent));
      setStep(4);
    });
  };

  const handleJoinDeal = async () => {
    await withSubmit(async () => {
      const response = await joinPrivateDeal(otp.join(""), locale);
      hydrateFromApiDeal(extractPrivateDeal(response), "buyer");
      setStep(2);
    });
  };

  const startWalletConfirm = async () => {
    if (!walletChoice.coversAmount) {
      walletChoice.goToWallet();
      return;
    }
    await withSubmit(async () => {
      const activeDealId = resolveDealId();
      if (!activeDealId) {
        throw new Error("Deal not found.");
      }
      const response = await savePrivateDealPaymentPlan(
        activeDealId,
        {
          intent: "complete",
          plan: "single",
          entries: [
            {
              amount: asMoney(payableTotal),
              method: "wallet",
            },
          ],
        },
        locale,
      );
      const nextDeal = extractPrivateDeal(response);
      hydrateFromApiDeal(nextDeal);
      const backendPaymentId = nextDeal.payments?.[0]?.id;
      if (!backendPaymentId) {
        throw new Error("Wallet payment is not ready yet.");
      }
      setSplitPayments([
        {
          id: "single-payment",
          method: "wallet",
          amount: payableTotal,
          notes: "",
          status: "awaiting",
          createdAt: new Date().toISOString(),
          backendPaymentId,
        },
      ]);
      setProcessingSplitId("single-payment");
      setPaymentMethod("wallet");
      setWalletModalOpen(true);
    });
  };

  const handleSinglePaymentContinue = async () => {
    if (paymentMethod === "wallet") {
      await startWalletConfirm();
      return;
    }

    await withSubmit(async () => {
      const singlePayment: SplitPaymentEntry = {
        id: "single-payment",
        method: paymentMethod,
        amount: payableTotal,
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

  const handleCardPay = async (paymentToken: string) => {
    await withSubmit(async () => {
      const activeDealId = resolveDealId();
      if (!activeDealId || !processingPayment?.backendPaymentId) {
        throw new Error("Payment is not ready yet.");
      }

      const checkout = await createPrivateDealCheckout(
        activeDealId,
        processingPayment.backendPaymentId,
        locale,
        { payment_token: paymentToken },
      );

      handlePayTabsCheckoutResult(checkout.data, {
        onImmediateSuccess: () => {
          toast.success(
            t("private-deal.payment_success_title") ||
              "Payment completed successfully.",
          );
          completeSplitPayment();
        },
        onRedirect: () => {
          toast.success(
            t("listings.redirecting_paytabs") ||
              "Redirecting to secure payment…",
          );
        },
      });
    });
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
        handlePayTabsCheckoutResult(checkout.data, {
          onImmediateSuccess: () => {
            toast.success(
              t("private-deal.payment_success_title") ||
                "Payment completed successfully.",
            );
            completeSplitPayment();
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
        if (!(payload.pickupAddress || "").trim()) {
          throw new Error(
            t("private-deal.pickup_address_required") ||
              "Pickup address is required.",
          );
        }
        if (!payload.collectionSlotId) {
          throw new Error(
            t("private-deal.collection_slot_required") ||
              "Please select an available collection slot.",
          );
        }
        formData.append("check_number", payload.checkNumber || "");
        formData.append("collection_slot_id", String(payload.collectionSlotId || ""));
        formData.append("pickup_address", payload.pickupAddress || "");
        formData.append("notes", payload.notes || "");
      }

      if (processingPayment.method === "cash") {
        if (!(payload.pickupAddress || "").trim()) {
          throw new Error(
            t("private-deal.pickup_address_required") ||
              "Pickup address is required.",
          );
        }
        if (!payload.collectionSlotId) {
          throw new Error(
            t("private-deal.collection_slot_required") ||
              "Please select an available collection slot.",
          );
        }
        formData.append("collection_slot_id", String(payload.collectionSlotId || ""));
        formData.append("pickup_address", payload.pickupAddress || "");
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
            onContinue={handleSellerPlateContinue}
            otherItemOptions={otherItemOptions}
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
            submitting={submitting}
            licenseSources={licenseSourceOptions}
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
        <TransferProgressStep
          otp={verificationCode}
          shareUrl={shareUrl}
          delivery={inviteDelivery}
          invitationEmailSent={inviteEmailSent}
          recipientEmail={apiDeal?.recipient_email || details.giftEmail}
        />
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
            showCustodyOptions
            continueLabel={t("private-deal.confirm")}
            submitting={submitting}
            licenseSources={licenseSourceOptions}
            products={giftProducts}
          />
        );
      }
      if (step === 3) {
        if (!buyerPaymentRequired) {
          return (
            <PaymentSuccessStep
              variant="gift"
              onDone={() => router.push(`/${locale}/marketplace`)}
            />
          );
        }
        return (
          <PaymentMethodStep
            method={paymentMethod}
            mode={paymentMode}
            totalAmount={payableTotal}
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
            onWalletClick={() => {
              void startWalletConfirm();
            }}
            onProcessSplit={(id) => {
              const row = splitPayments.find((payment) => payment.id === id);
              setProcessingSplitId(id);
              if (row?.method === "wallet") {
                if (
                  !walletCoversAmount(
                    walletChoice.availableBalance,
                    row.amount,
                  )
                ) {
                  walletChoice.goToWallet();
                  return;
                }
                setWalletModalOpen(true);
                return;
              }
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
              onCardPay={(token) => void handleCardPay(token)}
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
          variant={buyerPaymentRequired ? "payment" : "gift"}
          onDone={() => router.push(`/${locale}/marketplace`)}
        />
      );
    }

    return null;
  };

  const showSidebar =
    step >= 1 &&
    !(isSeller && step === 4) &&
    !(isBuyer && step >= 5) &&
    !(isBuyer && !buyerPaymentRequired && step >= 3);

  const showSplitAllocation =
    isBuyer && buyerPaymentRequired && step >= 3 && paymentMode === "split";

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
            className={`inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4 border`}
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
            className={`max-w-3xl font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] mb-4 ${isRTL ? "text-right" : "text-left"}`}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ color: getColor("primaryText"), unicodeBidi: "isolate" }}
          >
            <span className="block">{t("private-deal.title_line1")}</span>
            <span className="block" style={{ color: getColor("primary") }}>
              {t("private-deal.title_line2")}
            </span>
          </h1>

          <p
            className="max-w-2xl text-base md:text-lg leading-relaxed text-start"
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2">{renderMain()}</div>
            <div className="lg:col-span-1 space-y-6">
              {isGiftDeal && <GiftNoPaymentBanner />}
              <DealSummary
                data={deal}
                showAllocation={showSplitAllocation}
                allocatedAmount={splitAllocated}
                plateCrop="deal-summary"
                pricing={summaryPricing}
                onRemoveItemImage={
                  isSeller && deal.sellingType === "other"
                    ? handleRemoveItemImage
                    : undefined
                }
              />
              {paymentMethod === "bank" && isBuyer && step >= 3 && step <= 4 && (
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
        amountDue={payableTotal}
        reference={t("private-deal.payment_title")}
        onPaid={async () => {
          const activeDealId = resolveDealId();
          const paymentId =
            splitPayments.find((p) => p.id === processingSplitId)
              ?.backendPaymentId || splitPayments[0]?.backendPaymentId;
          if (!activeDealId || !paymentId) {
            throw new Error("Payment is not ready yet.");
          }
          const response = await payPrivateDealWithWallet(
            activeDealId,
            paymentId,
            locale,
          );
          hydrateFromApiDeal(extractPrivateDeal(response));
          toast.success(t("wallet.paid_from_wallet"));
          setStep(5);
        }}
      />
    </div>
  );
}
