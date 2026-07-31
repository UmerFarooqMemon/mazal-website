"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, EmiratesIdInput, Input, PhoneInput } from "@/components/ui";
import Select from "@/components/ui/Select";
import {
  isValidEmail,
  isValidEmiratesId,
  type KycIdentityData,
  type KycProfileType,
} from "@/components/kyc/types";
import {
  isValidUaeMobile,
  uaeMobileStartsWithFive,
} from "@/lib/uae-phone";

interface IdentityStepProps {
  profileType: Exclude<KycProfileType, null>;
  identity: KycIdentityData;
  setIdentity: (data: KycIdentityData) => void;
  onContinue: () => Promise<void> | void;
  onBack: () => void;
  loading?: boolean;
  emiratesOptions?: { key: string; label: string }[];
  fieldErrors?: Record<string, string>;
}

/** API expects full country names (e.g. "United Kingdom") */
const COUNTRIES = [
  { key: "United Arab Emirates", label: "United Arab Emirates" },
  { key: "Saudi Arabia", label: "Saudi Arabia" },
  { key: "Kuwait", label: "Kuwait" },
  { key: "Bahrain", label: "Bahrain" },
  { key: "Qatar", label: "Qatar" },
  { key: "Oman", label: "Oman" },
  { key: "India", label: "India" },
  { key: "Pakistan", label: "Pakistan" },
  { key: "United Kingdom", label: "United Kingdom" },
  { key: "United States", label: "United States" },
  { key: "Other", label: "Other" },
];

export default function IdentityStep({
  profileType,
  identity,
  setIdentity,
  onContinue,
  onBack,
  loading = false,
  emiratesOptions,
  fieldErrors = {},
}: IdentityStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const isUae = profileType === "uae_resident";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emirates =
    emiratesOptions && emiratesOptions.length > 0
      ? emiratesOptions
      : [
          { key: "dubai", label: t("kyc.emirate_dubai") },
          { key: "abu_dhabi", label: t("kyc.emirate_abu_dhabi") },
          { key: "sharjah", label: t("kyc.emirate_sharjah") },
          { key: "ajman", label: t("kyc.emirate_ajman") },
          { key: "uaq", label: t("kyc.emirate_uaq") },
          { key: "rak", label: t("kyc.emirate_rak") },
          { key: "fujairah", label: t("kyc.emirate_fujairah") },
        ];

  const update = (field: keyof KycIdentityData, value: string) => {
    setIdentity({ ...identity, [field]: value });
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!identity.fullLegalName.trim()) {
      next.fullLegalName = t("kyc.fill_required");
    }
    if (!identity.dateOfBirth) {
      next.dateOfBirth = t("kyc.fill_required");
    }
    if (!identity.phone.trim()) {
      next.phone = t("kyc.fill_required");
    } else if (uaeMobileStartsWithFive(identity.phone) === false) {
      next.phone = t("common.mobile_must_start_with_5");
    } else if (!isValidUaeMobile(identity.phone)) {
      next.phone = t("common.mobile_invalid");
    }
    if (!identity.email.trim()) {
      next.email = t("kyc.fill_required");
    } else if (!isValidEmail(identity.email)) {
      next.email = t("kyc.invalid_email");
    }

    if (isUae) {
      if (!identity.emiratesId.trim()) {
        next.emiratesId = t("kyc.fill_required");
      } else if (!isValidEmiratesId(identity.emiratesId)) {
        next.emiratesId = t("kyc.invalid_emirates_id");
      }
      if (!identity.emirateOfResidence) {
        next.emirateOfResidence = t("kyc.fill_required");
      }
    } else {
      if (!identity.passportNumber.trim()) {
        next.passportNumber = t("kyc.fill_required");
      }
      if (!identity.countryOfResidence) {
        next.countryOfResidence = t("kyc.fill_required");
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) {
      const phoneInvalid =
        !!identity.phone.trim() && !isValidUaeMobile(identity.phone);
      const phoneStartInvalid =
        !!identity.phone.trim() &&
        uaeMobileStartsWithFive(identity.phone) === false;
      toast.error(
        phoneStartInvalid
          ? t("common.mobile_must_start_with_5")
          : phoneInvalid
            ? t("common.mobile_invalid")
            : t("kyc.fill_required"),
      );
      return;
    }
    await onContinue();
  };

  const getError = (localKey: string, apiKeys: string[]) =>
    errors[localKey] ||
    apiKeys.map((key) => fieldErrors[key]).find(Boolean) ||
    undefined;

  return (
    <div
      className="rounded-[20px] border p-8 md:p-10 shadow-[0_30px_60px_-25px_rgba(1,15,81,0.2)]"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h2
        className={`text-2xl font-serif tracking-tight mb-1 text-start`}
        style={{ color: getColor("primaryText") }}
      >
        {t("kyc.identity_title")}
      </h2>
      <p
        className={`text-sm mb-8 text-start`}
        style={{ color: getColor("secondaryText") }}
      >
        {isUae ? t("kyc.identity_subtitle_uae") : t("kyc.identity_subtitle_intl")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5 mb-8">
        <Input
          label={t("kyc.full_legal_name")}
          value={identity.fullLegalName}
          onChange={(e) => update("fullLegalName", e.target.value)}
          placeholder={
            isUae
              ? t("kyc.full_legal_name_placeholder")
              : t("kyc.full_legal_name_placeholder_intl")
          }
          error={getError("fullLegalName", ["full_legal_name"])}
        />
        <Input
          label={t("kyc.date_of_birth")}
          type="date"
          value={identity.dateOfBirth}
          onChange={(e) => update("dateOfBirth", e.target.value)}
          error={getError("dateOfBirth", ["date_of_birth"])}
        />

        {isUae ? (
          <>
            <EmiratesIdInput
              label={t("kyc.emirates_id_number")}
              value={identity.emiratesId}
              onChange={(value) => update("emiratesId", value)}
              error={getError("emiratesId", ["emirates_id"])}
            />
            <Select
              label={t("kyc.emirate_of_residence")}
              options={emirates}
              value={identity.emirateOfResidence}
              onChange={(value) => update("emirateOfResidence", value)}
              placeholder={t("kyc.select_emirate")}
              error={getError("emirateOfResidence", ["emirate_of_residence"])}
            />
          </>
        ) : (
          <>
            <Input
              label={t("kyc.passport_number")}
              value={identity.passportNumber}
              onChange={(e) => update("passportNumber", e.target.value)}
              placeholder={t("kyc.passport_placeholder")}
              error={getError("passportNumber", ["passport_number"])}
            />
            <Select
              label={t("kyc.country_of_residence")}
              options={COUNTRIES}
              value={identity.countryOfResidence}
              onChange={(value) => update("countryOfResidence", value)}
              placeholder={t("kyc.select_country")}
              error={getError("countryOfResidence", ["country_of_residence"])}
            />
          </>
        )}

        <PhoneInput
          label={t("kyc.mobile_number")}
          value={identity.phone}
          onChange={(phone) => {
            setIdentity({
              ...identity,
              phone,
              phoneCountryCode: "+971",
            });
            setErrors((prev) => {
              if (!prev.phone && !prev.phoneCountryCode) return prev;
              const next = { ...prev };
              delete next.phone;
              delete next.phoneCountryCode;
              return next;
            });
          }}
          error={getError("phone", ["phone", "phone_country_code"])}
        />

        <Input
          label={t("kyc.email_address")}
          type="email"
          value={identity.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder={t("kyc.email_placeholder")}
          error={getError("email", ["email"])}
        />
      </div>

      <div
        className={`flex items-center justify-between border-t pt-6`}
        style={{ borderColor: getColor("border") }}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
          className="opacity-70"
          disabled={loading}
        >
          {t("kyc.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleContinue}
          loading={loading}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("kyc.confirm")}
        </Button>
      </div>
    </div>
  );
}
