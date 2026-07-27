"use client";

import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount } from "@/components/ui";
import type { CreateListingData } from "./CreateListingWizard";

interface GoLiveStepProps {
  data: CreateListingData;
  onBack: () => void;
  onProceed: () => void;
  loading?: boolean;
}

export default function GoLiveStep({
  data,
  onBack,
  onProceed,
  loading = false,
}: GoLiveStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const isPaid = data.listingPlanRequiresPayment && data.listingPlanPrice > 0;
  const durationLabel = data.listingPlanDurationDays
    ? t("listings.days_n").replace(
        "{days}",
        String(data.listingPlanDurationDays),
      ) || `${data.listingPlanDurationDays} DAYS`
    : t("listings.days_30");

  return (
    <div className="max-w-[944px] mx-auto">
      <div
        className="rounded-2xl border shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-6 md:p-9"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <h2
          className="text-2xl font-serif font-bold mb-2"
          style={{ color: getColor("primaryText") }}
        >
          {t("listings.go_live_heading")}
        </h2>
        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: getColor("secondaryText") }}
        >
          {isPaid
            ? t("listings.go_live_paytabs_desc") ||
              "Your listing will be created, then you'll complete the listing plan payment securely via PayTabs."
            : t("listings.go_live_free_desc") ||
              "Submit your listing for admin approval. No listing fee is required for this plan."}
        </p>

        <div
          className="rounded-2xl border p-5 mb-6 space-y-3"
          style={{
            backgroundColor: getColor("primaryLight"),
            borderColor: getColor("border"),
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck
              className="w-4 h-4"
              style={{ color: getColor("primary") }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: getColor("primary") }}
            >
              {t("listings.plan_summary") || "Plan summary"}
            </span>
          </div>
          {[
            [t("listings.tier"), data.listingPlanName],
            [t("listings.duration"), durationLabel],
            [
              t("listings.ownership_doc"),
              data.ownershipFileName || t("listings.upload_document"),
            ],
            [t("listings.total"), data.listingPlanPrice] as const,
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between text-sm"
            >
              <span style={{ color: getColor("secondaryText") }}>{label}</span>
              <span
                className="font-semibold text-end max-w-[60%] truncate"
                style={{ color: getColor("primaryText") }}
              >
                {typeof value === "number" ? (
                  value > 0 ? (
                    <DirhamAmount amount={value} weight="semibold" />
                  ) : (
                    t("listings.plan_free") || "Free"
                  )
                ) : (
                  value
                )}
              </span>
            </div>
          ))}
        </div>

        {isPaid && (
          <p
            className="text-xs mb-6 leading-relaxed"
            style={{ color: getColor("mutedText") }}
          >
            {t("listings.paytabs_hint") ||
              "You will be redirected to PayTabs. After payment, your listing moves to admin approval automatically."}
          </p>
        )}

        <div
          className="flex items-center justify-between border-t pt-5"
          style={{ borderColor: getColor("border") }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            leftIcon={<BackIcon className="w-4 h-4" />}
          >
            {t("listings.back")}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onProceed}
            loading={loading}
            rightIcon={<NextIcon className="w-4 h-4" />}
            className="!rounded-lg px-5"
          >
            {isPaid
              ? t("listings.pay_with_paytabs") || "Pay with PayTabs"
              : t("listings.proceed")}
          </Button>
        </div>
      </div>
    </div>
  );
}
