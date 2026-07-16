"use client";

import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button, Input } from "@/components/ui";
import Select from "@/components/ui/Select";

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
}

interface ConfirmDetailsStepProps {
  data: ConfirmDetailsData;
  onChange: (patch: Partial<ConfirmDetailsData>) => void;
  onBack: () => void;
  onContinue: () => void;
  variant: "seller" | "buyer";
  continueLabel?: string;
}

export default function ConfirmDetailsStep({
  data,
  onChange,
  onBack,
  onContinue,
  variant,
  continueLabel,
}: ConfirmDetailsStepProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

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

  return (
    <div className="bg-white rounded-[20px] border border-[#d9dee6] shadow-[0_20px_50px_-24px_rgba(1,15,81,0.25)] p-6 md:p-8">
      <h2
        className={`text-2xl font-serif text-[#081123] mb-1 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.confirm_title")}
      </h2>
      <p
        className={`text-sm text-[#545e6f] mb-6 ${isRTL ? "text-right" : "text-left"}`}
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
        <Input
          label={t("private-deal.mobile_number")}
          value={data.mobile}
          onChange={(e) => onChange({ mobile: e.target.value })}
          placeholder={t("private-deal.mobile_placeholder")}
        />
        <Input
          label={t("private-deal.email")}
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder={t("private-deal.email_placeholder")}
        />
        <Input
          label={t("private-deal.emirates_id")}
          value={data.emiratesId}
          onChange={(e) => onChange({ emiratesId: e.target.value })}
          placeholder={t("private-deal.emirates_id_placeholder")}
        />

        {variant === "buyer" && (
          <>
            <Select
              label={t("private-deal.type")}
              options={typeOptions}
              value={data.personType}
              onChange={(v) => onChange({ personType: v })}
            />
            <Select
              label={t("private-deal.select_identifications")}
              options={idOptions}
              value={data.identification}
              onChange={(v) => onChange({ identification: v })}
            />
            <Input
              label={idValueLabel}
              value={data.identificationValue}
              onChange={(e) => onChange({ identificationValue: e.target.value })}
              placeholder="88454"
            />
            <Input
              label={t("private-deal.mobile_number")}
              value={data.secondaryMobile}
              onChange={(e) => onChange({ secondaryMobile: e.target.value })}
              placeholder={t("private-deal.mobile_placeholder")}
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
        className={`flex gap-3 rounded-2xl border border-[rgba(10,47,148,0.25)] bg-[rgba(10,47,148,0.04)] p-4 mb-6 ${isRTL ? "flex-row-reverse text-right" : ""}`}
      >
        <ShieldCheck className="w-5 h-5 text-[#0a2f94] shrink-0 mt-0.5" />
        <p className="text-sm text-[#545e6f] leading-relaxed">
          <span className="font-medium text-[#081123]">
            {t("private-deal.verify_box_title")}{" "}
          </span>
          {t("private-deal.verify_box_desc")}
        </p>
      </div>

      <div
        className={`flex items-center justify-between border-t border-[#d9dee6] pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
        >
          {t("private-deal.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {continueLabel || t("private-deal.continue")}
        </Button>
      </div>
    </div>
  );
}
