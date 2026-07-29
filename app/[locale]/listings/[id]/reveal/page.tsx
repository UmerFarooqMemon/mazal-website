"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button, DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import ListingSidebar from "@/components/listings/ListingSidebar";
import RevealPaymentMethodStep from "@/components/listings/reveal/RevealPaymentMethodStep";
import RevealCardFormStep, {
  type RevealCardFormData,
} from "@/components/listings/reveal/RevealCardFormStep";
import {
  confirmRevealPayment,
  getListingDetail,
  getRevealStatus,
  initiateReveal,
  isHiddenPlateCode,
  proceedAfterReveal,
  resolveListingPreview,
  resolvePlateParts,
  type MarketplaceListingDetail,
  type MarketplaceReveal,
} from "@/services/marketplace";

type RevealStep = "method" | "card" | "done";

export default function RevealPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const { isAuthenticated } = useAuth();
  const isRTL = locale === "ar";

  const [listing, setListing] = useState<MarketplaceListingDetail | null>(null);
  const [feeAmount, setFeeAmount] = useState<number | null>(null);
  const [codeHidden, setCodeHidden] = useState(true);
  const [reveal, setReveal] = useState<MarketplaceReveal | null>(null);
  const [step, setStep] = useState<RevealStep>("method");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<RevealCardFormData>({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const listingResponse = await getListingDetail(params.id, locale);
      setListing(listingResponse.data.listing);

      if (isAuthenticated) {
        const revealResponse = await getRevealStatus(params.id, locale);
        setFeeAmount(Number(revealResponse.data.reveal_fee_amount));
        setCodeHidden(revealResponse.data.code_hidden);
        setReveal(revealResponse.data.reveal);

        if (
          revealResponse.data.reveal?.status === "revealed" ||
          revealResponse.data.code_screen?.unlocked ||
          !revealResponse.data.code_hidden
        ) {
          setStep("done");
          setCodeHidden(false);
        } else if (revealResponse.data.reveal?.status === "pending_payment") {
          setStep("card");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reveal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated, locale, params.id]);

  const patchCard = (patch: Partial<RevealCardFormData>) =>
    setCardForm((previous) => ({ ...previous, ...patch }));

  const handleContinueToCard = async () => {
    if (!isAuthenticated) {
      toast.error(t("common.login_required"));
      return;
    }

    setActionLoading(true);
    try {
      if (!reveal) {
        const response = await initiateReveal(params.id, locale);
        setReveal(response.data.reveal);
        setFeeAmount(Number(response.data.reveal_fee_amount));
      }
      setStep("card");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start reveal.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const applyRevealConfirm = (
    response: Awaited<ReturnType<typeof confirmRevealPayment>>,
  ) => {
    setReveal(response.data.reveal);
    setCodeHidden(false);
    setStep("done");

    const codeScreen = response.data.code_screen;
    const revealedListing = response.data.listing;

    setListing((previous) => {
      const base = revealedListing ?? previous;
      if (!base) return previous;

      return {
        ...base,
        // Viewer can see the code now — do not keep blur from hide_code setting.
        code_hidden: false,
        plate_code:
          codeScreen?.plate_code ??
          revealedListing?.plate_code ??
          base.plate_code,
        plate_digits:
          codeScreen?.plate_digits ??
          revealedListing?.plate_digits ??
          base.plate_digits,
        display_plate:
          codeScreen?.display_plate ||
          revealedListing?.display_plate ||
          base.display_plate,
        reveal: response.data.reveal ?? base.reveal,
      };
    });
  };

  const handleWalletPaid = async () => {
    setActionLoading(true);
    try {
      if (!reveal) {
        const response = await initiateReveal(params.id, locale);
        setReveal(response.data.reveal);
        setFeeAmount(Number(response.data.reveal_fee_amount));
      }
      const reference = `wallet-${Date.now()}`;
      const response = await confirmRevealPayment(params.id, locale, reference);
      applyRevealConfirm(response);
      toast.success(t("wallet.paid_from_wallet"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to confirm reveal payment.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setActionLoading(true);
    try {
      const reference = `card-${cardForm.cardNumber.replace(/\D/g, "").slice(-4)}-${Date.now()}`;
      const response = await confirmRevealPayment(params.id, locale, reference);
      applyRevealConfirm(response);
      toast.success(t("listings.reveal_confirmed"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to confirm reveal payment.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleProceed = async () => {
    setActionLoading(true);
    try {
      const response = await proceedAfterReveal(params.id, locale);
      setReveal(response.data.reveal);
      toast.success(
        response.data.message ||
          "Reveal fee will be credited toward your final purchase price.",
      );
      router.push(`/${locale}/listings/${params.id}/checkout?role=buyer`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to proceed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (themeLoading || localeLoading || loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  if (error || !listing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: getColor("background") }}
      >
        <p style={{ color: getColor("mutedText") }}>
          {error || t("common.not_found")}
        </p>
      </div>
    );
  }

  const typeLabel = listing.listing_type_label || listing.listing_type;
  // Prefer local reveal state; fall back to listing.code_hidden (not hide_code).
  const hideCode = codeHidden || isHiddenPlateCode(listing);
  const { code: plateCode, digits: plateDigits } = resolvePlateParts({
    ...listing,
    code_hidden: hideCode,
  });

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10">
        <div
          className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-10`}
          style={{ color: getColor("mutedText") }}
        >
          <Link
            href={`/${locale}/marketplace`}
            className="hover:opacity-80 transition-opacity"
          >
            {t("listings.breadcrumb_marketplace")}
          </Link>
          <span>/</span>
          <span>{listing.emirate_label}</span>
          <span>/</span>
          <span style={{ color: getColor("secondaryText") }}>{typeLabel}</span>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-10"
        >
          <div
            className="lg:col-span-3 space-y-6"
          >
            <div
              className="rounded-2xl border px-6 py-8 md:px-10 md:py-9 flex items-center justify-center shadow-sm min-h-[182px]"
              style={{
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
              }}
            >
              <div className="w-full max-w-xl">
                <NumberPlateDisplay
                  plate_code={plateCode}
                  plate_digits={plateDigits}
                  emirate={
                    listing.emirate_label?.toUpperCase() ||
                    listing.emirate ||
                    ""
                  }
                  preview={resolveListingPreview(listing)}
                  plateType={listing.plate_type || undefined}
                  plateDesign={listing.plate_design || undefined}
                  crop="hero"
                  hideCode={hideCode}
                />
              </div>
            </div>

            {!isAuthenticated ? (
              <div
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: getColor("surface"),
                  borderColor: getColor("border"),
                }}
              >
                <p className="text-sm" style={{ color: getColor("mutedText") }}>
                  {t("common.login_required")}
                </p>
              </div>
            ) : step === "method" ? (
              <RevealPaymentMethodStep
                selected={paymentMethod}
                amountDue={feeAmount ?? 0}
                loading={actionLoading}
                onSelect={setPaymentMethod}
                onBack={() =>
                  router.push(`/${locale}/listings/${params.id}`)
                }
                onContinue={handleContinueToCard}
                onWalletPaid={() => void handleWalletPaid()}
              />
            ) : step === "card" ? (
              <RevealCardFormStep
                data={cardForm}
                onChange={patchCard}
                loading={actionLoading}
                onBack={() => setStep("method")}
                onProceed={handleConfirmPayment}
              />
            ) : (
              <div
                className="rounded-2xl border p-6 space-y-4"
                style={{
                  backgroundColor: getColor("surface"),
                  borderColor: getColor("border"),
                }}
              >
                <div className="text-start">
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: getColor("mutedText") }}
                  >
                    {t("listings.reveal_fee")}
                  </p>
                  <p
                    className="text-2xl font-serif font-bold mb-2"
                    style={{ color: getColor("primaryText") }}
                  >
                    {feeAmount != null ? (
                      <DirhamAmount amount={feeAmount} weight="bold" />
                    ) : (
                      "—"
                    )}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: getColor("mutedText") }}
                  >
                    {t("listings.code_revealed")}
                  </p>
                </div>

                {reveal?.is_active && (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={actionLoading}
                    onClick={handleProceed}
                  >
                    {actionLoading
                      ? t("common.loading")
                      : t("listings.proceed_after_reveal")}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() =>
                    router.push(`/${locale}/listings/${params.id}`)
                  }
                >
                  {t("listings.back_to_listing")}
                </Button>
              </div>
            )}
          </div>

          <div
            className="lg:col-span-2"
          >
            <ListingSidebar
              listing={{
                ...listing,
                code_hidden: codeHidden,
                hide_code: codeHidden,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
