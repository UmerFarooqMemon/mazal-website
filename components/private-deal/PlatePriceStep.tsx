"use client";

import { ArrowLeft, ArrowRight, Wallet } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import type { DealData } from "./DealSummary";

interface PlatePriceStepProps {
  data: DealData;
  onChange: (patch: Partial<DealData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

const EMIRATES = [
  { key: "DUBAI", label: "Dubai" },
  { key: "ABU DHABI", label: "Abu Dhabi" },
  { key: "SHARJAH", label: "Sharjah" },
  { key: "AJMAN", label: "Ajman" },
  { key: "RAK", label: "Ras Al Khaimah" },
  { key: "FUJAIRAH", label: "Fujairah" },
  { key: "UAQ", label: "Umm Al Quwain" },
];

const PLATE_TYPES = [
  { key: "private", label: "Private" },
  { key: "classic", label: "Classic" },
  { key: "motorcycle", label: "Motorcycle" },
];

export default function PlatePriceStep({
  data,
  onChange,
  onBack,
  onContinue,
}: PlatePriceStepProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="bg-white rounded-[20px] border border-[#d9dee6] shadow-[0_20px_50px_-24px_rgba(1,15,81,0.25)] p-6 md:p-8">
      <h2
        className={`text-2xl font-serif text-[#081123] mb-1 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.plate_title")}
      </h2>
      <p
        className={`text-sm text-[#545e6f] mb-6 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.plate_subtitle")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Select
          label={t("private-deal.emirate")}
          options={EMIRATES}
          value={data.emirate}
          onChange={(v) => onChange({ emirate: v })}
        />
        <Select
          label={t("private-deal.plate_type")}
          options={PLATE_TYPES}
          value={data.plateType}
          onChange={(v) => onChange({ plateType: v })}
        />
        <Input
          label={t("private-deal.code")}
          value={data.code}
          onChange={(e) => onChange({ code: e.target.value.toUpperCase() })}
          placeholder="AA"
        />
        <Input
          label={t("private-deal.digit")}
          value={data.digit}
          onChange={(e) =>
            onChange({ digit: e.target.value.replace(/\D/g, "") })
          }
          placeholder="777"
        />
      </div>

      <div className="bg-[#f5f6f9] border border-[#d9dee6] rounded-2xl p-5 mb-5">
        <div
          className={`text-[10px] font-bold tracking-[0.15em] text-[#9aa3b2] mb-3 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("private-deal.live_preview")}
        </div>
        <div className="bg-white border border-[#d9dee6] rounded-xl py-5 px-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[10px] text-[#9aa3b2] font-bold uppercase tracking-[0.25em] mb-1">
              {data.emirate || "DUBAI"}
            </div>
            <div className="flex items-center justify-center gap-3 text-3xl font-serif font-bold text-[#0a2f94]">
              <span>{data.code || "AA"}</span>
              <span className="text-gray-300">|</span>
              <span>{data.digit || "777"}</span>
            </div>
          </div>
        </div>
      </div>

      <Input
        label={t("private-deal.agreed_price_aed")}
        icon={<Wallet className="w-4 h-4" />}
        value={data.price ? data.price.toLocaleString("en-AE") : ""}
        onChange={(e) => {
          const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
          onChange({ price: raw ? Number(raw) : 0 });
        }}
        placeholder="450,000"
        className="mb-6"
      />

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
          {t("private-deal.continue")}
        </Button>
      </div>
    </div>
  );
}
