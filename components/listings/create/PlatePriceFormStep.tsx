"use client";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  EyeOff,
  Info,
  Upload,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import LivePreview from "./LivePreview";
import type { CreateListingData } from "./CreateListingWizard";

interface PlatePriceFormStepProps {
  data: CreateListingData;
  onChange: (patch: Partial<CreateListingData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

const EMIRATES = [
  { key: "Dubai", label: "Dubai" },
  { key: "Abu Dhabi", label: "Abu Dhabi" },
  { key: "Sharjah", label: "Sharjah" },
  { key: "Ajman", label: "Ajman" },
  { key: "RAK", label: "Ras Al Khaimah" },
  { key: "Fujairah", label: "Fujairah" },
  { key: "UAQ", label: "Umm Al Quwain" },
];

export default function PlatePriceFormStep({
  data,
  onChange,
  onBack,
  onContinue,
}: PlatePriceFormStepProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const canContinue =
    Boolean(data.emirate) &&
    Boolean(data.code.trim()) &&
    Boolean(data.digits.trim()) &&
    Boolean(data.price.trim());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-6 md:p-9">
        <h2
          className={`text-2xl font-serif font-bold text-[#041443] mb-6 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("listings.step_plate_price")}
        </h2>

        <div className="space-y-5">
          <Select
            label={t("listings.emirate")}
            options={EMIRATES}
            value={data.emirate}
            onChange={(v) => onChange({ emirate: v })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("listings.code")}
              value={data.code}
              onChange={(e) =>
                onChange({ code: e.target.value.toUpperCase().slice(0, 3) })
              }
              placeholder="K"
            />
            <Input
              label={t("listings.digits")}
              value={data.digits}
              onChange={(e) =>
                onChange({ digits: e.target.value.replace(/\D/g, "").slice(0, 5) })
              }
              placeholder="55"
            />
          </div>

          <div
            className={`flex flex-col sm:flex-row sm:items-center gap-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            <button
              type="button"
              onClick={() => onChange({ hideCode: !data.hideCode })}
              className={`inline-flex items-center gap-2 h-8 px-3 rounded-full border text-xs font-medium transition-colors ${
                data.hideCode
                  ? "bg-[#0A3B9E] border-[#0A3B9E] text-white"
                  : "bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#0A3B9E]"
              } ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <EyeOff className="w-4 h-4" />
              {t("listings.hide_code")}
            </button>
            <span
              className={`flex items-center gap-1.5 text-xs text-[#6B7280] ${isRTL ? "flex-row-reverse text-right" : ""}`}
            >
              {t("listings.hide_code_hint")}
              <Info className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
            </span>
          </div>

          <Input
            label={t("listings.asking_price_aed")}
            value={data.price}
            onChange={(e) =>
              onChange({
                price: e.target.value.replace(/[^\d,]/g, ""),
              })
            }
            placeholder="68,000"
          />

          <button
            type="button"
            className="w-full rounded-xl border border-dashed border-[#D1D5DB] bg-[#FAFAF8] py-8 px-4 flex flex-col items-center justify-center gap-2 text-sm text-[#6B7280] hover:border-[#0A3B9E] hover:text-[#0A3B9E] transition-colors"
          >
            <Camera className="w-6 h-6" />
            <span>{t("listings.scan_plate")}</span>
          </button>

          <div>
            <label
              className={`block text-[11px] font-medium text-[#6B7280] mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("listings.seller_notes")}
            </label>
            <textarea
              value={data.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder={t("listings.notes_placeholder")}
              rows={3}
              className={`w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#041443] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0A3B9E]/20 focus:border-[#0A3B9E] ${isRTL ? "text-right" : "text-left"}`}
            />
          </div>

          <div>
            <label
              className={`block text-[11px] font-medium text-[#6B7280] mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("listings.ownership_doc")}
            </label>
            <label className={`flex items-center gap-3 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 cursor-pointer hover:border-[#0A3B9E] transition-colors ${isRTL ? "flex-row-reverse" : ""}`}>
              <span className={`grow text-sm text-[#9CA3AF] ${isRTL ? "text-right" : "text-left"}`}>
                {data.ownershipFileName || t("listings.upload_document")}
              </span>
              <Upload className="w-[18px] h-[18px] text-[#6B7280] shrink-0" />
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  onChange({
                    ownershipFileName: e.target.files?.[0]?.name || "",
                  })
                }
              />
            </label>
          </div>
        </div>

        <div
          className={`flex items-center justify-between border-t border-[#E5E7EB] mt-8 pt-5 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            leftIcon={<BackIcon className="w-4 h-4" />}
            className="!rounded-lg text-[#6B7280]"
          >
            {t("listings.back")}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onContinue}
            disabled={!canContinue}
            rightIcon={<NextIcon className="w-4 h-4" />}
            className="!rounded-lg px-5"
          >
            {t("listings.continue")}
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-24">
        <LivePreview
          code={data.code}
          digits={data.digits}
          emirate={data.emirate}
          price={data.price}
          hideCode={data.hideCode}
        />
      </div>
    </div>
  );
}
