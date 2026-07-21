"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button, DirhamAmount } from "@/components/ui";
import {
  confirmRevealPayment,
  getRevealStatus,
  initiateReveal,
  proceedAfterReveal,
  type MarketplaceReveal,
} from "@/services/marketplace";

export default function RevealPage() {
  const params = useParams<{ id: string }>();
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const { isAuthenticated } = useAuth();
  const isRTL = locale === "ar";

  const [feeAmount, setFeeAmount] = useState<number | null>(null);
  const [codeHidden, setCodeHidden] = useState(true);
  const [reveal, setReveal] = useState<MarketplaceReveal | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRevealStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRevealStatus(params.id, locale);
      setFeeAmount(response.data.reveal_fee_amount);
      setCodeHidden(response.data.code_hidden);
      setReveal(response.data.reveal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reveal status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadRevealStatus();
  }, [isAuthenticated, locale, params.id]);

  const handleInitiateReveal = async () => {
    setActionLoading(true);
    try {
      const response = await initiateReveal(params.id, locale);
      setReveal(response.data.reveal);
      setFeeAmount(response.data.reveal_fee_amount);
      toast.success(response.data.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate reveal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setActionLoading(true);
    try {
      const response = await confirmRevealPayment(params.id, locale);
      setReveal(response.data.reveal);
      setCodeHidden(false);
      toast.success(t("listings.reveal_confirmed") || "Reveal payment confirmed.");
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
      toast.success(response.data.message);
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

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className={`mb-8 ${isRTL ? "text-right" : "text-left"}`}>
          <Link
            href={`/${locale}/listings/${params.id}`}
            className="text-sm mb-4 inline-block"
            style={{ color: getColor("primary") }}
          >
            ← {t("listings.back_to_listing") || "Back to listing"}
          </Link>
          <h1
            className="text-3xl font-serif font-bold mb-2"
            style={{ color: getColor("primaryText") }}
          >
            {t("listings.reveal_title") || "Reveal plate code"}
          </h1>
          <p className="text-sm" style={{ color: getColor("mutedText") }}>
            {t("listings.reveal_desc") ||
              "Pay the non-refundable reveal fee to unlock the hidden plate code. You will have 72 hours to decide after payment confirmation."}
          </p>
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
        ) : error ? (
          <p className="text-sm" style={{ color: "#DC2626" }}>
            {error}
          </p>
        ) : (
          <div
            className="rounded-2xl border p-6 space-y-4"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: getColor("border"),
            }}
          >
            <div className={`${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: getColor("mutedText") }}>
                {t("listings.reveal_fee") || "Reveal fee"}
              </p>
              <p className="text-2xl font-serif font-bold" style={{ color: getColor("primaryText") }}>
                {feeAmount != null ? (
                  <DirhamAmount amount={feeAmount} weight="bold" />
                ) : (
                  "—"
                )}
              </p>
              <p className="text-sm mt-2" style={{ color: getColor("mutedText") }}>
                {codeHidden
                  ? t("listings.code_hidden") || "Plate code is currently hidden."
                  : t("listings.code_revealed") || "Plate code has been revealed."}
              </p>
              {reveal?.status && (
                <p className="text-sm mt-1" style={{ color: getColor("secondaryText") }}>
                  Status: {reveal.status}
                </p>
              )}
            </div>

            {!reveal && codeHidden && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={actionLoading}
                onClick={handleInitiateReveal}
              >
                {actionLoading
                  ? t("common.loading")
                  : t("listings.start_reveal") || "Start reveal"}
              </Button>
            )}

            {reveal?.status === "pending_payment" && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={actionLoading}
                onClick={handleConfirmPayment}
              >
                {actionLoading
                  ? t("common.loading")
                  : t("listings.confirm_reveal_payment") || "Confirm payment (dev)"}
              </Button>
            )}

            {reveal?.status === "revealed" && reveal.is_active && (
              <Button
                variant="outline"
                size="lg"
                fullWidth
                disabled={actionLoading}
                onClick={handleProceed}
              >
                {actionLoading
                  ? t("common.loading")
                  : t("listings.proceed_after_reveal") || "Proceed with purchase credit"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
