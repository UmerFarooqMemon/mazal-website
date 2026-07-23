"use client";

import { ArrowLeft, ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import type { KycFormState } from "@/components/kyc/types";
import type { KycReviewSummary } from "@/services/kyc";

interface ReviewStepProps {
  state: KycFormState;
  review?: KycReviewSummary | null;
  submitting?: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export default function ReviewStep({
  state,
  review = null,
  submitting = false,
  onSubmit,
  onBack,
}: ReviewStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const isUae = state.profileType === "uae_resident";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const rows = [
    {
      label: t("kyc.review_profile"),
      value:
        review?.profile ||
        (isUae ? t("kyc.review_profile_uae") : t("kyc.review_profile_intl")),
    },
    {
      label: t("kyc.review_verification"),
      value:
        review?.verification ||
        (isUae
          ? t("kyc.review_verification_uae")
          : t("kyc.review_verification_intl")),
    },
    {
      label: t("kyc.review_legal_name"),
      value:
        review?.legal_name || state.identity.fullLegalName || "—",
    },
    {
      label: t("kyc.review_custody"),
      value:
        review?.custody ||
        (isUae
          ? t("kyc.review_custody_uae")
          : t("kyc.review_custody_intl")),
    },
  ];

  return (
    <div
      className="rounded-[20px] border p-8 md:p-10 shadow-[0_30px_60px_-25px_rgba(1,15,81,0.2)]"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h2
        className={`text-2xl font-serif tracking-tight mb-1 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("primaryText") }}
      >
        {t("kyc.review_title")}
      </h2>
      <p
        className={`text-sm mb-8 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("kyc.review_subtitle")}
      </p>

      <div className="mb-6">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-4 py-4 ${isRTL ? "flex-row-reverse" : ""}`}
            style={{
              borderBottom:
                index < rows.length - 1
                  ? `1px solid ${getColor("border")}`
                  : undefined,
            }}
          >
            <span
              className="text-sm"
              style={{ color: getColor("secondaryText") }}
            >
              {row.label}
            </span>
            <span
              className="text-sm font-semibold text-end"
              style={{ color: getColor("primaryText") }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div
        className={`flex items-start gap-3 rounded-2xl px-4 py-4 mb-8 ${isRTL ? "flex-row-reverse text-right" : ""}`}
        style={{
          backgroundColor: `${getColor("primary")}0D`,
        }}
      >
        <Lock
          className="w-4 h-4 mt-0.5 shrink-0"
          style={{ color: getColor("primary") }}
        />
        <p className="text-sm leading-relaxed" style={{ color: getColor("primaryText") }}>
          {t("kyc.privacy_note")}
        </p>
      </div>

      <div
        className={`flex items-center justify-between border-t pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ borderColor: getColor("border") }}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
          className="opacity-70"
          disabled={submitting}
        >
          {t("kyc.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onSubmit}
          loading={submitting}
          disabled={
            state.verified ||
            state.status === "approved" ||
            state.status === "pending_review"
          }
          rightIcon={<ShieldCheck className="w-4 h-4" />}
        >
          {state.verified || state.status === "approved"
            ? t("kyc.submit_verified")
            : state.status === "pending_review"
              ? t("kyc.submit_pending")
              : t("kyc.submit")}
        </Button>
      </div>
    </div>
  );
}
