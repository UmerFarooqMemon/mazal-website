"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Stepper, { type StepItem } from "@/components/private-deal/Stepper";
import AuctionPageHero from "./AuctionPageHero";
import AddPlateForm, { type AuctionPlateDraft } from "./AddPlateForm";
import AuctionPlanStep from "./AuctionPlanStep";
import AuctionPlanPaymentStep from "./AuctionPlanPaymentStep";
import {
  createAuctionPlanCheckout,
  createListing,
  getListingDetail,
  type MarketplaceAuctionPlan,
} from "@/services/marketplace";
import { handlePayTabsCheckoutResult } from "@/lib/paytabs";

type Step = 1 | 2 | 3;

export default function CreateAuctionWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const { getColor } = useTheme();

  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<AuctionPlateDraft | null>(null);
  const [planId, setPlanId] = useState<number | null>(null);
  const [planSlug, setPlanSlug] = useState("free");
  const [planName, setPlanName] = useState("Free");
  const [planPrice, setPlanPrice] = useState(0);
  const [planRequiresPayment, setPlanRequiresPayment] = useState(false);
  const [planDurationDays, setPlanDurationDays] = useState<number | null>(null);
  const [pendingListingId, setPendingListingId] = useState<
    string | number | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const doneHref = `/${locale}/auctions`;

  useEffect(() => {
    const isReturn = searchParams.get("auction_plan_return") === "1";
    if (!isReturn) return;

    const listingId = searchParams.get("listing_id");
    const failed = searchParams.get("paytabs_failed") === "1";

    if (failed) {
      toast.error(
        t("listings.paytabs_failed") ||
          "Payment was not completed. Please try again.",
      );
      router.replace(`/${locale}/auctions/add`);
      return;
    }

    if (!listingId) {
      router.replace(doneHref);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    setPolling(true);

    const poll = async () => {
      try {
        const response = await getListingDetail(listingId, locale);
        if (cancelled) return;
        const listing = response.data.listing;

        if (
          listing.status === "pending_approval" ||
          listing.plan_payment_status === "paid" ||
          !listing.needs_plan_payment
        ) {
          setPolling(false);
          toast.success(
            t("auctions.plan_payment_success") ||
              t("auctions.create_success") ||
              "Auction plan paid. Your listing is awaiting admin approval.",
          );
          router.replace(doneHref);
          return;
        }
      } catch {
        // keep polling
      }

      attempts += 1;
      if (attempts >= 20) {
        if (!cancelled) {
          setPolling(false);
          toast(
            t("listings.plan_payment_pending") ||
              "Payment received. Approval status is still updating.",
          );
          router.replace(doneHref);
        }
        return;
      }

      if (!cancelled) {
        window.setTimeout(poll, 2000);
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [doneHref, locale, router, searchParams, t]);

  const selectPlan = (plan: MarketplaceAuctionPlan) => {
    setPlanId(plan.id);
    setPlanSlug(plan.slug);
    setPlanName(plan.name);
    setPlanPrice(Number(plan.price) || 0);
    setPlanRequiresPayment(Boolean(plan.requires_payment));
    setPlanDurationDays(plan.duration_days ?? null);
  };

  const completeCheckout = async (
    listingId: string | number,
    paymentToken?: string,
  ) => {
    const checkout = await createAuctionPlanCheckout(listingId, locale, {
      payment_token: paymentToken,
    });

    handlePayTabsCheckoutResult(checkout.data, {
      onImmediateSuccess: () => {
        toast.success(
          t("auctions.plan_payment_success") ||
            t("auctions.create_success") ||
            "Auction plan paid. Your listing is awaiting admin approval.",
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

  const handleCreateListing = async () => {
    if (!draft) return;

    setLoading(true);
    try {
      const response = await createListing(
        {
          listing_type: "auction",
          title: draft.title,
          emirate: draft.emirate,
          plate_variant: draft.plate_variant,
          plate_type: draft.plate_type,
          plate_design: draft.plate_design,
          plate_code: draft.plate_code,
          plate_digits: draft.plate_digits,
          asking_price: draft.asking_price,
          description: draft.description,
          auction_plan_id: planId,
          ownership_document: draft.ownership_document,
        },
        locale,
      );

      const listing = response.data.listing;
      if (listing.needs_plan_payment) {
        setPendingListingId(listing.id);
        setStep(3);
        return;
      }

      toast.success(
        t("auctions.create_success") ||
          "Auction listing submitted for approval.",
      );
      router.push(doneHref);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("common.error_submission") || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManagedFormPayment = async (paymentToken: string) => {
    if (!pendingListingId) return;
    setLoading(true);
    try {
      await completeCheckout(pendingListingId, paymentToken);
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
      const checkout = await createAuctionPlanCheckout(pendingListingId, locale);
      const redirectUrl = checkout.data.redirect_url;
      if (!redirectUrl) {
        handlePayTabsCheckoutResult(checkout.data, {
          onImmediateSuccess: () => {
            toast.success(
              t("auctions.plan_payment_success") ||
                t("auctions.create_success") ||
                "Auction plan paid. Your listing is awaiting admin approval.",
            );
            router.push(doneHref);
          },
        });
        return;
      }
      toast.success(
        t("listings.redirecting_paytabs") || "Redirecting to secure payment…",
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

  const steps: StepItem[] = useMemo(
    () => [
      {
        key: "plate",
        label: t("auctions.add_plate_title"),
        status: step > 1 ? "completed" : "current",
      },
      {
        key: "plan",
        label: t("auctions.step_auction_plan") || "Auction plan",
        status:
          step > 2 ? "completed" : step === 2 ? "current" : "upcoming",
      },
      ...(pendingListingId
        ? [
            {
              key: "payment",
              label: t("auctions.step_plan_payment") || "Auction plan payment",
              status: step === 3 ? ("current" as const) : ("upcoming" as const),
            },
          ]
        : []),
    ],
    [pendingListingId, step, t],
  );

  if (polling) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: getColor("background") }}
      >
        <p style={{ color: getColor("mutedText") }}>
          {t("listings.verifying_payment") ||
            "Verifying auction plan payment…"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <AuctionPageHero />
        </div>
      </section>

      <section
        className="px-4 sm:px-6 lg:px-8 pb-16"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, #F2F8F3 40px, #F2F8F3 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Stepper steps={steps} />
          </div>

          {step === 1 && (
            <AddPlateForm
              onBack={() => router.push(doneHref)}
              onContinue={(nextDraft) => {
                setDraft(nextDraft);
                setStep(2);
              }}
            />
          )}

          {step === 2 && draft && (
            <AuctionPlanStep
              draft={draft}
              selectedPlanId={planId}
              selectedPlanSlug={planSlug}
              selectedPlanName={planName}
              selectedPlanPrice={planPrice}
              selectedPlanRequiresPayment={planRequiresPayment}
              onSelectPlan={selectPlan}
              onBack={() => setStep(1)}
              onContinue={() => void handleCreateListing()}
              submitting={loading}
            />
          )}

          {step === 3 && pendingListingId && (
            <AuctionPlanPaymentStep
              planName={planName}
              planPrice={planPrice}
              durationDays={planDurationDays}
              listingId={pendingListingId}
              onBack={() => setStep(2)}
              onPay={handleManagedFormPayment}
              onHostedFallback={handleHostedFallbackPayment}
              loading={loading}
            />
          )}
        </div>
      </section>
    </div>
  );
}
