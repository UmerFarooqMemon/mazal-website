"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import type {
  KycIdentityData,
  KycProfileType,
} from "@/components/kyc/types";

interface IdentityStepProps {
  profileType: Exclude<KycProfileType, null>;
  identity: KycIdentityData;
  setIdentity: (data: KycIdentityData) => void;
  onContinue: () => void;
  onBack: () => void;
}

const COUNTRY_CODES = [
  { key: "+971", label: "+971" },
  { key: "+966", label: "+966" },
  { key: "+974", label: "+974" },
  { key: "+973", label: "+973" },
  { key: "+968", label: "+968" },
  { key: "+965", label: "+965" },
  { key: "+1", label: "+1" },
  { key: "+44", label: "+44" },
  { key: "+91", label: "+91" },
];

const COUNTRIES = [
  { key: "ae", label: "United Arab Emirates" },
  { key: "sa", label: "Saudi Arabia" },
  { key: "kw", label: "Kuwait" },
  { key: "bh", label: "Bahrain" },
  { key: "qa", label: "Qatar" },
  { key: "om", label: "Oman" },
  { key: "in", label: "India" },
  { key: "pk", label: "Pakistan" },
  { key: "gb", label: "United Kingdom" },
  { key: "us", label: "United States" },
  { key: "other", label: "Other" },
];

export default function IdentityStep({
  profileType,
  identity,
  setIdentity,
  onContinue,
  onBack,
}: IdentityStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const isUae = profileType === "uae_resident";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const emirates = [
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
  };

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
        {t("kyc.identity_title")}
      </h2>
      <p
        className={`text-sm mb-8 ${isRTL ? "text-right" : "text-left"}`}
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
        />
        <Input
          label={t("kyc.date_of_birth")}
          type="date"
          value={identity.dateOfBirth}
          onChange={(e) => update("dateOfBirth", e.target.value)}
        />

        {isUae ? (
          <>
            <Input
              label={t("kyc.emirates_id_number")}
              value={identity.emiratesId}
              onChange={(e) => update("emiratesId", e.target.value)}
              placeholder={t("kyc.emirates_id_placeholder")}
            />
            <Select
              label={t("kyc.emirate_of_residence")}
              options={emirates}
              value={identity.emirate}
              onChange={(value) => update("emirate", value)}
              placeholder={t("kyc.select_emirate")}
            />
          </>
        ) : (
          <>
            <Input
              label={t("kyc.passport_number")}
              value={identity.passportNumber}
              onChange={(e) => update("passportNumber", e.target.value)}
              placeholder={t("kyc.passport_placeholder")}
            />
            <Select
              label={t("kyc.country_of_residence")}
              options={COUNTRIES}
              value={identity.country}
              onChange={(value) => update("country", value)}
              placeholder={t("kyc.select_country")}
            />
          </>
        )}

        <div className="w-full">
          <label
            className={`block text-[11px] font-medium leading-none mb-2 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("kyc.mobile_number")}
          </label>
          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="w-[110px] shrink-0">
              <Select
                options={COUNTRY_CODES}
                value={identity.countryCode}
                onChange={(value) => update("countryCode", value)}
              />
            </div>
            <Input
              value={identity.mobile}
              onChange={(e) => update("mobile", e.target.value.replace(/[^\d]/g, ""))}
              placeholder="50 000 0000"
              inputMode="tel"
            />
          </div>
        </div>

        <Input
          label={t("kyc.email_address")}
          type="email"
          value={identity.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder={t("kyc.email_placeholder")}
        />
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
        >
          {t("kyc.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("kyc.confirm")}
        </Button>
      </div>
    </div>
  );
}
