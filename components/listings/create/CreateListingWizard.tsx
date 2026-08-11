"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Stepper, { type StepItem } from "@/components/private-deal/Stepper";
import PlatePriceFormStep from "./PlatePriceFormStep";
import BoostStep from "./BoostStep";
import GoLiveStep from "./GoLiveStep";
import ListingPlanPaymentStep from "./ListingPlanPaymentStep";
import {
  createListing,
  createListingPlanCheckout,
  type MarketplaceListingPlan,
} from "@/services/marketplace";
import { handlePayTabsCheckoutResult } from "@/lib/paytabs";

export interface CreateListingData {
  emirate: string;
  emirateId: string;
  plateType: string;
  plateVariant: string;
  code: string;
  digits: string;
  hideCode: boolean;
  price: string;
  notes: string;
  ownershipFileName: string;
  ownershipFile: File | null;
  listingPlanId: number | null;
  listingPlanSlug: string;
  listingPlanName: string;
  listingPlanPrice: number;
  listingPlanRequiresPayment: boolean;
  listingPlanDurationDays: number | null;
}

const INITIAL: CreateListingData = {
  emirate: "dubai",
  emirateId: "",
  plateType: "private",
  plateVariant: "private_new_colorful",
  code: "",
  digits: "",
  hideCode: false,
  price: "0",
  notes: "",
  ownershipFileName: "",
  ownershipFile: null,
  listingPlanId: null,
  listingPlanSlug: "free",
  listingPlanName: "Free",
  listingPlanPrice: 0,
  listingPlanRequiresPayment: false,
  listingPlanDurationDays: null,
};

type Step = 1 | 2 | 3 | 4;

interface CreateListingWizardProps {
  backHref?: string;
  successHref?: string;
  initialStep?: Step;
  initialData?: Partial<CreateListingData>;
}

export default function CreateListingWizard({
  backHref,
  successHref,
  initialStep = 1,
  initialData,
}: CreateListingWizardProps = {}) {
  const router = useRouter();
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const [step, setStep] = useState<Step>(initialStep);
  const [data, setData] = useState<CreateListingData>({
    ...INITIAL,
    ...initialData,
  });
  const [loading, setLoading] = useState(false);
  const [pendingListingId, setPendingListingId] = useState<
    string | number | null
  >(null);
  const cancelHref = backHref || `/${locale}/marketplace`;
  const doneHref = successHref || `/${locale}/marketplace`;

  const onChange = (patch: Partial<CreateListingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const selectPlan = (plan: MarketplaceListingPlan) => {
    onChange({
      listingPlanId: plan.id,
      listingPlanSlug: plan.slug,
      listingPlanName: plan.name,
      listingPlanPrice: Number(plan.price) || 0,
      listingPlanRequiresPayment: Boolean(plan.requires_payment),
      listingPlanDurationDays: plan.duration_days ?? null,
    });
  };

  const steps: StepItem[] = useMemo(
    () => [
      {
        key: "plate",
        label: t("listings.step_plate_price"),
        status:
          step > 1 ? "completed" : step === 1 ? "current" : "upcoming",
      },
      {
        key: "boost",
        label: t("listings.step_fee_boost"),
        status:
          step > 2 ? "completed" : step === 2 ? "current" : "upcoming",
      },
      {
        key: "live",
        label: t("listings.step_go_live"),
        status:
          step > 3 ? "completed" : step === 3 ? "current" : "upcoming",
      },
      ...(pendingListingId
        ? [
            {
              key: "payment",
              label:
                t("listings.step_listing_plan_payment") || "Listing plan payment",
              status: step === 4 ? ("current" as const) : ("upcoming" as const),
            },
          ]
        : []),
    ],
    [pendingListingId, step, t],
  );

  const eyebrow =
    step === 1
      ? t("listings.create_listing_eyebrow")
      : step === 2
        ? t("listings.featured_listing_eyebrow")
        : t("listings.go_live_eyebrow");

  const title =
    step === 1
      ? t("listings.publish_title")
      : step === 2
        ? t("listings.boost_title")
        : t("listings.publish_title");

  const description =
    step === 2 ? t("listings.boost_desc") : t("listings.publish_desc");

  const submitListing = async () => {
    const listingTitle =
      `${data.emirate} ${data.code ? data.code + " " : ""}${data.digits}`.trim();

    const response = await createListing(
      {
        listing_type: "direct",
        title: listingTitle,
        emirate: data.emirate,
        plate_variant: data.plateVariant || undefined,
        plate_type: data.plateType || undefined,
        plate_code: data.code || undefined,
        plate_digits: data.digits,
        asking_price: Number(data.price.replace(/[^\d.]/g, "")) || 0,
        description: data.notes || undefined,
        hide_code: Boolean(data.code) && data.hideCode,
        listing_plan_id: data.listingPlanId,
        ownership_document: data.ownershipFile,
      },
      locale,
    );

    return response.data.listing;
  };

  const completeListingPlanCheckout = async (
    listingId: string | number,
    paymentToken?: string,
  ) => {
    const checkout = await createListingPlanCheckout(listingId, locale, {
      payment_token: paymentToken,
    });

    handlePayTabsCheckoutResult(checkout.data, {
      onImmediateSuccess: () => {
        toast.success(
          t("listings.plan_payment_success") ||
            "Listing plan paid. Your listing is awaiting admin approval.",
        );
        router.push(doneHref);
      },
      onRedirect: () => {
        toast.success(
          t("listings.redirecting_paytabs") ||
            "Redirecting to secure payment…",
        );
      },
    });
  };

  const handleProceed = async () => {
    if (!data.ownershipFile) {
      toast.error(
        t("listings.ownership_required") ||
          "Please upload the ownership document.",
      );
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const listing = await submitListing();

      if (listing.needs_plan_payment) {
        setPendingListingId(listing.id);
        setStep(4);
        setLoading(false);
        return;
      }

      toast.success(
        t("listings.publish_pending") ||
          t("listings.publish_success") ||
          "Listing submitted for approval.",
      );
      router.push(doneHref);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("common.error_submission") || "Something went wrong",
      );
      setLoading(false);
    }
  };

  const handleManagedFormPayment = async (paymentToken: string) => {
    if (!pendingListingId) return;

    setLoading(true);
    try {
      await completeListingPlanCheckout(pendingListingId, paymentToken);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("listings.paytabs_failed") ||
              "Payment was not completed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHostedFallbackPayment = async () => {
    if (!pendingListingId) return;

    setLoading(true);
    try {
      const checkout = await createListingPlanCheckout(
        pendingListingId,
        locale,
      );
      const redirectUrl = checkout.data.redirect_url;
      if (!redirectUrl) {
        handlePayTabsCheckoutResult(checkout.data, {
          onImmediateSuccess: () => {
            toast.success(
              t("listings.plan_payment_success") ||
                "Listing plan paid. Your listing is awaiting admin approval.",
            );
            router.push(doneHref);
          },
        });
        return;
      }
      toast.success(
        t("listings.redirecting_paytabs") ||
          "Redirecting to secure payment…",
      );
      window.location.href = redirectUrl;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("listings.paytabs_failed") ||
              "Payment was not completed. Please try again.",
      );
      setLoading(false);
    }
  };

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
      className="min-h-screen pb-16"
      style={{ backgroundColor: getColor("background") }}
    >
      <div
        className="border-b"
        style={{
          borderColor: getColor("border"),
          backgroundColor: getColor("background"),
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10 pb-8">
          <p
            className="text-xs font-bold uppercase tracking-[0.14em] mb-3"
            style={{
              color:
                step === 2 ? getColor("mutedText") : getColor("primary"),
            }}
          >
            {eyebrow}
          </p>
          <h1
            className="text-3xl md:text-4xl font-serif font-bold leading-tight max-w-xl"
            style={{ color: getColor("primaryText") }}
          >
            {title}
          </h1>
          <p
            className="text-base mt-3 max-w-2xl leading-relaxed"
            style={{ color: getColor("secondaryText") }}
          >
            {description}
          </p>
          <Stepper steps={steps} />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10">
        {step === 1 && (
          <PlatePriceFormStep
            data={data}
            onChange={onChange}
            onBack={() => router.push(cancelHref)}
            onContinue={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <BoostStep
            data={data}
            onSelectPlan={selectPlan}
            onBack={() =>
              initialStep >= 2 ? router.push(cancelHref) : setStep(1)
            }
            onContinue={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <GoLiveStep
            data={data}
            onBack={() => setStep(2)}
            onProceed={handleProceed}
            loading={loading}
          />
        )}
        {step === 4 && pendingListingId && (
          <ListingPlanPaymentStep
            data={data}
            listingId={pendingListingId}
            onBack={() => setStep(3)}
            onPay={handleManagedFormPayment}
            onHostedFallback={handleHostedFallbackPayment}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
