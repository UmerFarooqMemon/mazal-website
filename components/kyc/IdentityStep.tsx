"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, CountryPhoneInput, EmiratesIdInput, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import {
  dialCodeForCountry,
  isoForCountry,
  isValidEmail,
  isValidEmiratesId,
  KYC_RESIDENCE_COUNTRIES,
  type KycIdentityData,
  type KycProfileType,
} from "@/components/kyc/types";
import {
  hasNationalPhoneDigits,
  isValidCountryPhoneNumber,
  ensurePhoneDigitsWithDial,
  toNationalFromPhoneDigits,
} from "@/lib/phone-validation";

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
    } else {
      const dial = isUae
        ? "+971"
        : identity.phoneCountryCode || "+971";
      const iso = isUae ? "ae" : identity.phoneCountryIso || "ae";
      if (!hasNationalPhoneDigits(identity.phone, dial)) {
        next.phone = t("kyc.fill_required");
      } else if (!isValidCountryPhoneNumber(identity.phone, iso)) {
        next.phone =
          t("common.phone_length_invalid") ||
          "Enter the full phone number for the selected country.";
      }
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
      const dial = isUae
        ? "+971"
        : identity.phoneCountryCode ||
          dialCodeForCountry(identity.countryOfResidence);
      const iso = isUae ? "ae" : identity.phoneCountryIso || "ae";
      const phoneInvalid =
        !!identity.phone.trim() &&
        hasNationalPhoneDigits(identity.phone, dial) &&
        !isValidCountryPhoneNumber(identity.phone, iso);
      toast.error(
        phoneInvalid
          ? t("common.phone_length_invalid") ||
              "Enter the full phone number for the selected country."
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
              options={KYC_RESIDENCE_COUNTRIES}
              searchable
              value={identity.countryOfResidence}
              onChange={(value) => {
                const nextCode = dialCodeForCountry(value);
                const nextIso = isoForCountry(value);
                setIdentity({
                  ...identity,
                  countryOfResidence: value,
                  phoneCountryCode: nextCode,
                  phoneCountryIso: nextIso,
                  // Keep national digits, re-prefix with new dial for CountryPhoneInput
                  phone: ensurePhoneDigitsWithDial(
                    toNationalFromPhoneDigits(
                      identity.phone,
                      identity.phoneCountryCode || "+971",
                    ),
                    nextCode,
                  ),
                });
                setErrors((prev) => {
                  if (!prev.countryOfResidence && !prev.phone) return prev;
                  const next = { ...prev };
                  delete next.countryOfResidence;
                  delete next.phone;
                  return next;
                });
              }}
              placeholder={t("kyc.select_country")}
              error={getError("countryOfResidence", ["country_of_residence"])}
            />
          </>
        )}

        <CountryPhoneInput
          label={t("kyc.mobile_number")}
          country={isUae ? "ae" : identity.phoneCountryIso || "ae"}
          onlyCountries={isUae ? ["ae"] : undefined}
          value={identity.phone}
          onChange={(phone, meta) => {
            setIdentity({
              ...identity,
              phone,
              phoneCountryCode: isUae ? "+971" : meta.dialCode,
              phoneCountryIso: isUae ? "ae" : meta.countryIso,
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
          required
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
