"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { formatEmiratesId } from "@/components/kyc/types";
import { Button, CountryPhoneInput, EmiratesIdInput, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import {
  ensurePhoneDigitsWithDial,
  hasNationalPhoneDigits,
  isValidCountryPhoneNumber,
} from "@/lib/phone-validation";
import { PRIVATE_DEAL_LICENSE_SOURCES } from "@/config/license-sources";
import GiftFlowPanel, {
  type GiftFlowStep,
} from "@/components/private-deal/GiftFlowPanel";
import type { GiftPackageId } from "@/components/private-deal/giftPackages";

export type CustodyIntent = "hold" | "transfer" | "gift";

export interface ConfirmDetailsData {
  fullName: string;
  mobile: string;
  mobileCountryIso?: string;
  mobileDialCode?: string;
  email: string;
  emiratesId: string;
  personType: string;
  identification: string;
  identificationValue: string;
  secondaryMobile: string;
  secondaryMobileCountryIso?: string;
  secondaryMobileDialCode?: string;
  licenseSource: string;
  /** Buyer private-deal: hold custody vs transfer plate into buyer's name vs gift. */
  custodyIntent?: CustodyIntent;
  giftPlate?: boolean;
  giftEmail?: string;
  giftMessage?: string;
  giftPackageId?: GiftPackageId | "";
  giftRecipientName?: string;
  giftRecipientPhone?: string;
  giftRecipientPhoneCountryIso?: string;
  giftRecipientPhoneDialCode?: string;
  giftRecipientAddress?: string;
  giftRecipientNotes?: string;
}

interface ConfirmDetailsStepProps {
  data: ConfirmDetailsData;
  onChange: (patch: Partial<ConfirmDetailsData>) => void;
  onBack: () => void;
  onContinue: () => void;
  /** Runs before form validation. Return false to stop (e.g. show a blocking modal). */
  beforeContinue?: () => boolean;
  variant: "seller" | "buyer";
  continueLabel?: string;
  /** Seller-only: show gift Yes/No + recipient email for private deals. */
  showGiftOptions?: boolean;
  /** Buyer private-deal: Hold the custody / Transfer on my name / Gifting tabs. */
  showCustodyOptions?: boolean;
  submitting?: boolean;
  licenseSources?: { key: string; label: string }[];
}

export default function ConfirmDetailsStep({
  data,
  onChange,
  onBack,
  onContinue,
  beforeContinue,
  variant,
  continueLabel,
  showGiftOptions = false,
  showCustodyOptions = false,
  submitting = false,
  licenseSources,
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
    giftRecipientPhone?: string;
  }>({});
  const [giftStep, setGiftStep] = useState<GiftFlowStep>("package");
  const licenseSourceOptions =
    licenseSources && licenseSources.length > 0
      ? licenseSources
      : PRIVATE_DEAL_LICENSE_SOURCES;
  const defaultLicenseSource =
    licenseSourceOptions.find((opt) => opt.key === "mbr")?.key ||
    licenseSourceOptions[0]?.key ||
    "mbr";
  const custodyIntent: CustodyIntent = data.custodyIntent || "hold";
  const isGifting = showCustodyOptions && custodyIntent === "gift";
  const showTransferFields =
    variant === "buyer" &&
    (!showCustodyOptions || custodyIntent === "transfer");
  const showStandardForm = !isGifting;

  useEffect(() => {
    if (!isGifting) {
      setGiftStep("package");
    }
  }, [isGifting]);

  useEffect(() => {
    if (!user || didPrefill.current) return;

    const sessionEmail =
      (typeof user.email === "string" && user.email.trim()) ||
      (typeof user.login === "string" && user.login.includes("@")
        ? user.login.trim()
        : "");
    const sessionPhone =
      typeof user.phone === "string" && user.phone.trim()
        ? ensurePhoneDigitsWithDial(user.phone, "+971")
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
      patch.mobileCountryIso = data.mobileCountryIso || "ae";
      patch.mobileDialCode = data.mobileDialCode || "+971";
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
        personType === "organization"
          ? data.licenseSource || defaultLicenseSource
          : "",
    });
  };

  const handleIdentificationChange = (identification: string) => {
    onChange({
      identification,
      identificationValue: "",
      ...(identification === "traffic" ? { emiratesId: "" } : {}),
    });
  };

  const validatePhone = (
    value: string,
    dialCode: string,
    iso: string,
    required: boolean,
  ) => {
    const lengthMsg =
      t("common.phone_length_invalid") ||
      "Enter the full phone number for the selected country.";
    if (!hasNationalPhoneDigits(value, dialCode)) {
      return required ? lengthMsg : undefined;
    }
    if (!isValidCountryPhoneNumber(value, iso)) {
      return lengthMsg;
    }
    return undefined;
  };

  const clearGiftFields = () =>
    onChange({
      giftPackageId: "",
      giftRecipientName: "",
      giftRecipientPhone: "",
      giftRecipientAddress: "",
      giftRecipientNotes: "",
    });

  const handleCustodyChange = (intent: CustodyIntent) => {
    if (intent === "gift") {
      onChange({ custodyIntent: "gift" });
      setGiftStep("package");
      return;
    }
    onChange({ custodyIntent: intent });
    if (custodyIntent === "gift") {
      clearGiftFields();
    }
    setGiftStep("package");
  };

  const handleBack = () => {
    if (isGifting && giftStep === "recipient") {
      setGiftStep("package");
      return;
    }
    onBack();
  };

  const handleContinue = () => {
    if (beforeContinue && !beforeContinue()) return;

    if (isGifting) {
      if (giftStep === "package") {
        if (!data.giftPackageId) {
          toast.error(
            t("private-deal.gift_package_required") ||
              "Please select a gift package to continue.",
          );
          return;
        }
        setGiftStep("recipient");
        return;
      }

      const recipientName = (data.giftRecipientName || "").trim();
      if (!recipientName) {
        toast.error(
          t("private-deal.gift_recipient_name_required") ||
            "Recipient name is required.",
        );
        return;
      }

      const giftIso = data.giftRecipientPhoneCountryIso || "ae";
      const giftDial = data.giftRecipientPhoneDialCode || "+971";
      const giftPhoneError = validatePhone(
        data.giftRecipientPhone || "",
        giftDial,
        giftIso,
        true,
      );
      setPhoneErrors((prev) => ({
        ...prev,
        giftRecipientPhone: giftPhoneError,
      }));
      if (giftPhoneError) {
        toast.error(
          giftPhoneError ||
            t("private-deal.gift_recipient_phone_required") ||
            "Recipient phone number is required.",
        );
        return;
      }

      onContinue();
      return;
    }

    const mobileIso = data.mobileCountryIso || "ae";
    const mobileDial = data.mobileDialCode || "+971";
    const secondaryIso = data.secondaryMobileCountryIso || "ae";
    const secondaryDial = data.secondaryMobileDialCode || "+971";

    const mobileError = validatePhone(data.mobile, mobileDial, mobileIso, true);
    const secondaryError =
      showTransferFields &&
      hasNationalPhoneDigits(data.secondaryMobile, secondaryDial)
        ? validatePhone(
            data.secondaryMobile,
            secondaryDial,
            secondaryIso,
            false,
          )
        : undefined;

    setPhoneErrors({
      mobile: mobileError,
      secondaryMobile: secondaryError,
    });

    if (mobileError || secondaryError) {
      toast.error(
        mobileError ||
          secondaryError ||
          t("common.phone_length_invalid") ||
          "Enter the full phone number for the selected country.",
      );
      return;
    }

    onContinue();
  };

  const title = isGifting
    ? t("private-deal.gift_flow_title")
    : t("private-deal.confirm_title");
  const subtitle = isGifting
    ? t("private-deal.gift_flow_subtitle")
    : t("private-deal.confirm_subtitle");

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
        {title}
      </h2>
      <p
        className={`text-sm mb-6 text-start`}
        style={{ color: getColor("secondaryText") }}
      >
        {subtitle}
      </p>

      {showCustodyOptions && variant === "buyer" && (
        <div className="mb-5">
          {!isGifting && (
            <p
              className="text-sm mb-2.5 text-start"
              style={{ color: getColor("secondaryText") }}
            >
              {t("private-deal.custody_intent_label")}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "hold" as const, label: t("private-deal.custody_hold") },
                {
                  key: "transfer" as const,
                  label: t("private-deal.custody_transfer"),
                },
                {
                  key: "gift" as const,
                  label: t("private-deal.custody_gifting"),
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleCustodyChange(tab.key)}
                className="rounded-full px-3.5 py-[5px] text-sm font-medium transition-colors border"
                style={
                  custodyIntent === tab.key
                    ? {
                        backgroundColor: getColor("primary"),
                        borderColor: getColor("primary"),
                        color: "#FFFFFF",
                      }
                    : {
                        backgroundColor: getColor("surface"),
                        borderColor: getColor("border"),
                        color: getColor("secondaryText"),
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isGifting ? (
        <GiftFlowPanel
          data={data}
          step={giftStep}
          onChange={onChange}
          phoneError={phoneErrors.giftRecipientPhone}
          onPhoneErrorClear={() =>
            setPhoneErrors((prev) => ({
              ...prev,
              giftRecipientPhone: undefined,
            }))
          }
        />
      ) : (
        <>
          {showStandardForm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                label={t("private-deal.full_name")}
                value={data.fullName}
                onChange={(e) => onChange({ fullName: e.target.value })}
                placeholder={t("private-deal.full_name_placeholder")}
              />
              <CountryPhoneInput
                label={t("private-deal.mobile_number")}
                country={data.mobileCountryIso || "ae"}
                value={data.mobile}
                onChange={(mobile, meta) => {
                  onChange({
                    mobile,
                    mobileCountryIso: meta.countryIso,
                    mobileDialCode: meta.dialCode,
                  });
                  if (phoneErrors.mobile) {
                    setPhoneErrors((prev) => ({ ...prev, mobile: undefined }));
                  }
                }}
                error={phoneErrors.mobile}
                required
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
            </div>
          )}

          {showTransferFields && (
            <div className="mb-4">
              {showCustodyOptions && (
                <p
                  className="text-sm font-medium mb-3 text-start"
                  style={{ color: getColor("primaryText") }}
                >
                  {t("private-deal.plate_transfer_info")}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <CountryPhoneInput
                  label={t("private-deal.mobile_number")}
                  country="ae"
                  onlyCountries={["ae"]}
                  enableSearch={false}
                  value={data.secondaryMobile}
                  onChange={(secondaryMobile) => {
                    onChange({
                      secondaryMobile,
                      secondaryMobileCountryIso: "ae",
                      secondaryMobileDialCode: "+971",
                    });
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
                      options={licenseSourceOptions}
                      value={data.licenseSource || defaultLicenseSource}
                      onChange={(v) => onChange({ licenseSource: v })}
                      placeholder={t("private-deal.license_source")}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

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
        </>
      )}

      <div
        className={`flex items-center justify-between border-t pt-6`}
        style={{ borderColor: getColor("border") }}
      >
        <Button
          variant="outline"
          size="md"
          onClick={handleBack}
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
          {isGifting
            ? t("private-deal.continue")
            : continueLabel || t("private-deal.continue")}
        </Button>
      </div>
    </div>
  );
}
