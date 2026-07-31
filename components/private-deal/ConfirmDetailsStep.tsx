"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { formatEmiratesId } from "@/components/kyc/types";
import { Button, EmiratesIdInput, Input, PhoneInput } from "@/components/ui";
import Select from "@/components/ui/Select";
import {
  formatUaePhone,
  isValidUaeMobile,
  uaeMobileStartsWithFive,
} from "@/lib/uae-phone";

export interface ConfirmDetailsData {
  fullName: string;
  mobile: string;
  email: string;
  emiratesId: string;
  personType: string;
  identification: string;
  identificationValue: string;
  secondaryMobile: string;
  licenseSource: string;
  giftPlate?: boolean;
  giftEmail?: string;
  giftMessage?: string;
}

interface ConfirmDetailsStepProps {
  data: ConfirmDetailsData;
  onChange: (patch: Partial<ConfirmDetailsData>) => void;
  onBack: () => void;
  onContinue: () => void;
  variant: "seller" | "buyer";
  continueLabel?: string;
  /** Seller-only: show gift Yes/No + recipient email for private deals. */
  showGiftOptions?: boolean;
  submitting?: boolean;
}

export default function ConfirmDetailsStep({
  data,
  onChange,
  onBack,
  onContinue,
  variant,
  continueLabel,
  showGiftOptions = false,
  submitting = false,
}: ConfirmDetailsStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const { user } = useAuth();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const didPrefill = useRef(false);
  const [phoneErrors, setPhoneErrors] = useState<{
    mobile?: string;
    secondaryMobile?: string;
  }>({});

  useEffect(() => {
    if (!user || didPrefill.current) return;

    const sessionEmail =
      (typeof user.email === "string" && user.email.trim()) ||
      (typeof user.login === "string" && user.login.includes("@")
        ? user.login.trim()
        : "");
    const sessionPhone =
      typeof user.phone === "string" && user.phone.trim()
        ? formatUaePhone(user.phone)
        : "";
    const sessionEmiratesId =
      typeof user.emirates_id === "string" && user.emirates_id.trim()
        ? formatEmiratesId(user.emirates_id)
        : "";

    const patch: Partial<ConfirmDetailsData> = {};

    if (!data.fullName.trim() && user.name?.trim()) {
      patch.fullName = user.name.trim();
    }
    if (!data.mobile.trim() && sessionPhone) {
      patch.mobile = sessionPhone;
    }
    if (!data.email.trim() && sessionEmail) {
      patch.email = sessionEmail;
    }
    if (!data.emiratesId.trim() && sessionEmiratesId) {
      patch.emiratesId = sessionEmiratesId;
    }
    if (
      variant === "buyer" &&
      data.identification === "emirates_id" &&
      !data.identificationValue.trim() &&
      sessionEmiratesId
    ) {
      patch.identificationValue = sessionEmiratesId;
    }

    didPrefill.current = true;
    if (Object.keys(patch).length > 0) {
      onChange(patch);
    }
  }, [
    data.email,
    data.emiratesId,
    data.fullName,
    data.identification,
    data.identificationValue,
    data.mobile,
    onChange,
    user,
    variant,
  ]);

  const typeOptions = [
    { key: "individual", label: t("private-deal.type_individual") },
    { key: "organization", label: t("private-deal.type_organization") },
  ];

  const idOptions = [
    { key: "emirates_id", label: t("private-deal.id_emirates") },
    { key: "trade_license", label: t("private-deal.id_trade_license") },
    { key: "traffic", label: t("private-deal.id_traffic") },
  ];

  const idValueLabel =
    data.identification === "trade_license"
      ? t("private-deal.trade_license_number")
      : data.identification === "traffic"
        ? t("private-deal.traffic_code")
        : t("private-deal.emirates_id");

  const handlePersonTypeChange = (personType: string) => {
    onChange({
      personType,
      identification:
        personType === "organization" ? "trade_license" : "emirates_id",
      identificationValue: "",
      emiratesId: personType === "organization" ? "" : data.emiratesId,
      secondaryMobile: "",
      licenseSource:
        personType === "organization" ? data.licenseSource || "mbr" : "",
    });
  };

  const handleIdentificationChange = (identification: string) => {
    onChange({
      identification,
      identificationValue: "",
      ...(identification === "traffic" ? { emiratesId: "" } : {}),
    });
  };

  const validatePhone = (value: string, required: boolean) => {
    if (!value.trim()) {
      return required ? t("common.mobile_invalid") : undefined;
    }
    if (uaeMobileStartsWithFive(value) === false) {
      return t("common.mobile_must_start_with_5");
    }
    if (!isValidUaeMobile(value)) {
      return t("common.mobile_invalid");
    }
    return undefined;
  };

  const handleContinue = () => {
    const mobileError = validatePhone(data.mobile, true);
    const secondaryError =
      variant === "buyer" && data.secondaryMobile.trim()
        ? validatePhone(data.secondaryMobile, false)
        : undefined;

    setPhoneErrors({
      mobile: mobileError,
      secondaryMobile: secondaryError,
    });

    if (mobileError || secondaryError) {
      toast.error(mobileError || secondaryError || t("common.mobile_invalid"));
      return;
    }

    onContinue();
  };

  return (
    <div
      className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(1,15,81,0.25)] p-6 md:p-8"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      {showGiftOptions && (
        <div className="mb-6">
          <p
            className={`text-sm font-medium mb-3 text-start`}
            style={{ color: getColor("primaryText") }}
          >
            {t("private-deal.gift_plate_title")}
          </p>
          <div
            className={`inline-flex rounded-full border p-1 mb-3`}
            style={{
              borderColor: getColor("border"),
              backgroundColor: getColor("primaryLight"),
            }}
          >
            <button
              type="button"
              onClick={() => onChange({ giftPlate: true })}
              className="px-5 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                data.giftPlate
                  ? { backgroundColor: getColor("primary"), color: "#fff" }
                  : { color: getColor("secondaryText") }
              }
            >
              {t("private-deal.gift_yes")}
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({ giftPlate: false, giftEmail: "", giftMessage: "" })
              }
              className="px-5 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                !data.giftPlate
                  ? { backgroundColor: getColor("primary"), color: "#fff" }
                  : { color: getColor("secondaryText") }
              }
            >
              {t("private-deal.gift_no")}
            </button>
          </div>
          {data.giftPlate && (
            <div className="space-y-3">
              <Input
                label={t("private-deal.gift_email")}
                type="email"
                value={data.giftEmail || ""}
                onChange={(e) => onChange({ giftEmail: e.target.value })}
                placeholder={t("private-deal.gift_email_placeholder")}
              />
              <div>
                <label
                  className={`block text-[11px] font-medium mb-1.5 text-start`}
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.gift_message")}
                </label>
                <textarea
                  value={data.giftMessage || ""}
                  onChange={(e) =>
                    onChange({ giftMessage: e.target.value.slice(0, 1000) })
                  }
                  rows={3}
                  maxLength={1000}
                  placeholder={t("private-deal.gift_message_placeholder")}
                  className={`w-full rounded-xl border py-3 px-4 text-sm focus:outline-none text-start`}
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("surface"),
                    color: getColor("primaryText"),
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <h2
        className={`text-2xl font-serif mb-1 text-start`}
        style={{ color: getColor("primaryText") }}
      >
        {t("private-deal.confirm_title")}
      </h2>
      <p
        className={`text-sm mb-6 text-start`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("private-deal.confirm_subtitle")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Input
          label={t("private-deal.full_name")}
          value={data.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder={t("private-deal.full_name_placeholder")}
        />
        <PhoneInput
          label={t("private-deal.mobile_number")}
          value={data.mobile}
          onChange={(mobile) => {
            onChange({ mobile });
            if (phoneErrors.mobile) {
              setPhoneErrors((prev) => ({ ...prev, mobile: undefined }));
            }
          }}
          error={phoneErrors.mobile}
        />
        <Input
          label={t("private-deal.email")}
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder={t("private-deal.email_placeholder")}
        />
        <EmiratesIdInput
          label={t("private-deal.emirates_id")}
          value={data.emiratesId}
          onChange={(value) => onChange({ emiratesId: value })}
        />

        {variant === "buyer" && (
          <>
            <Select
              label={t("private-deal.type")}
              options={typeOptions}
              value={data.personType}
              onChange={handlePersonTypeChange}
            />
            <Select
              label={t("private-deal.select_identifications")}
              options={idOptions}
              value={data.identification}
              onChange={handleIdentificationChange}
            />
            {data.identification === "emirates_id" ? (
              <EmiratesIdInput
                label={idValueLabel}
                value={data.identificationValue}
                onChange={(value) =>
                  onChange({ identificationValue: value })
                }
              />
            ) : (
              <Input
                label={idValueLabel}
                value={data.identificationValue}
                onChange={(e) =>
                  onChange({ identificationValue: e.target.value })
                }
                placeholder="88454"
              />
            )}
            <PhoneInput
              label={t("private-deal.mobile_number")}
              value={data.secondaryMobile}
              onChange={(secondaryMobile) => {
                onChange({ secondaryMobile });
                if (phoneErrors.secondaryMobile) {
                  setPhoneErrors((prev) => ({
                    ...prev,
                    secondaryMobile: undefined,
                  }));
                }
              }}
              error={phoneErrors.secondaryMobile}
            />
            {data.personType === "organization" && (
              <div className="sm:col-span-2">
                <Select
                  label={t("private-deal.license_source")}
                  options={[
                    {
                      key: "mbr",
                      label: t("private-deal.license_source_default"),
                    },
                  ]}
                  value={data.licenseSource || "mbr"}
                  onChange={(v) => onChange({ licenseSource: v })}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div
        className={`flex gap-3 rounded-2xl border p-4 mb-6 text-start`}
        style={{
          borderColor: `${getColor("primary")}40`,
          backgroundColor: `${getColor("primary")}0D`,
        }}
      >
        <ShieldCheck
          className="w-5 h-5 shrink-0 mt-0.5"
          style={{ color: getColor("primary") }}
        />
        <p
          className="text-sm leading-relaxed"
          style={{ color: getColor("secondaryText") }}
        >
          <span
            className="font-medium"
            style={{ color: getColor("primaryText") }}
          >
            {t("private-deal.verify_box_title")}{" "}
          </span>
          {t("private-deal.verify_box_desc")}
        </p>
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
          disabled={submitting}
        >
          {t("private-deal.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
          disabled={submitting}
        >
          {continueLabel || t("private-deal.continue")}
        </Button>
      </div>
    </div>
  );
}
