"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronDown,
  EyeOff,
  Info,
  Search,
  Upload,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import type { PlatePreviewConfig } from "@/lib/plate-preview";
import LivePreview from "./LivePreview";
import type { CreateListingData } from "./CreateListingWizard";

interface PlateCodeItem {
  code: string;
  label: string;
  show_on_preview: boolean;
}

interface Variant {
  key: string;
  label: string;
  plate_type: string;
  plate_design: string;
  has_code: boolean;
  fields?: string[];
  plate_codes?: (string | PlateCodeItem)[] | null;
  digits?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  preview?: PlatePreviewConfig;
}

interface PlatePriceFormStepProps {
  data: CreateListingData;
  onChange: (patch: Partial<CreateListingData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function PlatePriceFormStep({
  data,
  onChange,
  onBack,
  onContinue,
}: PlatePriceFormStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const [variants, setVariants] = useState<Variant[]>([]);
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const codeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/number-plates/options?locale=${locale}`)
      .then((r) => r.json())
      .then((res) => {
        const emirates = res?.data?.emirates || [];
        const dubai = emirates.find(
          (e: { key: string }) => e.key === "dubai",
        );
        const nextVariants: Variant[] = dubai?.variants || [];
        setVariants(nextVariants);

        if (
          nextVariants.length > 0 &&
          !nextVariants.some((v) => v.key === data.plateVariant)
        ) {
          const first = nextVariants[0];
          onChange({
            plateVariant: first.key,
            plateType: first.plate_type || data.plateType,
            emirate: "dubai",
          });
        }
      })
      .catch(console.error);
    // Intentionally only re-fetch when locale changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        codeDropdownRef.current &&
        !codeDropdownRef.current.contains(e.target as Node)
      ) {
        setCodeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedVariant =
    variants.find((v) => v.key === data.plateVariant) || variants[0];
  const variantFields = selectedVariant?.fields || [
    "plate_code",
    "plate_digits",
  ];
  const showCodeField =
    variantFields.includes("plate_code") &&
    (selectedVariant?.has_code ?? true);
  const variantDigits = selectedVariant?.digits;
  const rawPlateCodes = selectedVariant?.plate_codes || [];

  const variantPlateCodes: PlateCodeItem[] = Array.isArray(rawPlateCodes)
    ? rawPlateCodes.map((item) =>
        typeof item === "string"
          ? { code: item, label: item, show_on_preview: true }
          : item && typeof item === "object" && "code" in item
            ? item
            : {
                code: String(item),
                label: String(item),
                show_on_preview: true,
              },
      )
    : [];

  const filteredCodes = variantPlateCodes.filter((c) =>
    String(c.code || "")
      .toLowerCase()
      .includes(String(codeSearch || "").toLowerCase()),
  );

  const handleCodeSelect = (code: string) => {
    onChange({ code });
    setCodeDropdownOpen(false);
    setCodeSearch("");
  };

  const canContinue =
    Boolean(data.plateVariant) &&
    Boolean(data.digits.trim()) &&
    Boolean(data.price.trim()) &&
    (!showCodeField || Boolean(data.code.trim()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
      <div
        className="rounded-2xl border shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-6 md:p-9"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <h2
          className={`text-2xl font-serif font-bold mb-6 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("primaryText") }}
        >
          {t("listings.step_plate_price")}
        </h2>

        <div className="space-y-5">
          <div>
            <label
              className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("secondaryText") }}
            >
              {t("listings.emirate")}
            </label>
            <div
              className={`w-full rounded-xl border py-3 px-4 text-sm ${isRTL ? "text-right" : "text-left"}`}
              style={{
                backgroundColor: `${getColor("background")}80`,
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            >
              {t("listings.emirate_dubai")}
            </div>
          </div>

          <Select
            label={t("private-deal.plate_variant")}
            options={variants}
            value={data.plateVariant}
            onChange={(value) => {
              const newVariant = variants.find((v) => v.key === value);
              const newFields = newVariant?.fields || [
                "plate_code",
                "plate_digits",
              ];
              onChange({
                plateVariant: value,
                plateType: newVariant?.plate_type || data.plateType,
                code: newFields.includes("plate_code") ? data.code : "",
                digits: "",
                hideCode:
                  (newFields.includes("plate_code") &&
                    (newVariant?.has_code ?? true))
                    ? data.hideCode
                    : false,
              });
            }}
            placeholder={t("common.select")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showCodeField ? (
              variantPlateCodes.length > 0 ? (
                <div ref={codeDropdownRef}>
                  <label
                    className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
                    style={{ color: getColor("secondaryText") }}
                  >
                    {t("listings.code")}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCodeDropdownOpen(!codeDropdownOpen)}
                      className={`w-full rounded-xl border bg-white py-3 px-4 text-sm flex items-center justify-between transition-all ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                      style={{
                        borderColor: getColor("border"),
                        color: data.code
                          ? getColor("primaryText")
                          : getColor("mutedText"),
                      }}
                    >
                      <span>
                        {data.code || t("private-deal.select_code")}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${codeDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {codeDropdownOpen && (
                      <div
                        className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border overflow-hidden"
                        style={{ borderColor: getColor("border") }}
                      >
                        <div
                          className="p-2 border-b"
                          style={{ borderColor: getColor("border") }}
                        >
                          <div className="relative">
                            <Search
                              className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isRTL ? "right-3" : "left-3"}`}
                              style={{ color: getColor("mutedText") }}
                            />
                            <input
                              type="text"
                              placeholder={t("common.search")}
                              value={codeSearch}
                              onChange={(e) => setCodeSearch(e.target.value)}
                              className={`w-full py-2 text-sm bg-transparent focus:outline-none ${isRTL ? "pr-8 pl-3 text-right" : "pl-8 pr-3 text-left"}`}
                              style={{ color: getColor("primaryText") }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto">
                          {filteredCodes.length > 0 ? (
                            filteredCodes.map((item) => (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => handleCodeSelect(item.code)}
                                className={`w-full px-4 py-2.5 text-sm transition-colors ${isRTL ? "text-right" : "text-left"}`}
                                style={{
                                  color:
                                    item.code === data.code
                                      ? getColor("primary")
                                      : getColor("primaryText"),
                                  backgroundColor:
                                    item.code === data.code
                                      ? `${getColor("primary")}10`
                                      : "transparent",
                                }}
                              >
                                {item.label}
                              </button>
                            ))
                          ) : (
                            <div
                              className="px-4 py-3 text-xs"
                              style={{ color: getColor("mutedText") }}
                            >
                              {t("common.no_results")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Input
                  name="code"
                  label={t("listings.code")}
                  type="text"
                  placeholder="M"
                  value={data.code}
                  onChange={(e) =>
                    onChange({ code: e.target.value.toUpperCase() })
                  }
                />
              )
            ) : (
              <div>
                <label
                  className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("listings.code")}
                </label>
                <div
                  className={`w-full rounded-xl border py-3 px-4 text-sm ${isRTL ? "text-right" : "text-left"}`}
                  style={{
                    backgroundColor: `${getColor("background")}80`,
                    borderColor: getColor("border"),
                    color: getColor("mutedText"),
                  }}
                >
                  {t("private-deal.digits_only")}
                </div>
              </div>
            )}

            <Input
              name="digits"
              label={t("listings.digits")}
              type="text"
              placeholder={
                variantDigits?.min
                  ? `${variantDigits.min}-${variantDigits.max || ""} digits`
                  : "777"
              }
              maxLength={variantDigits?.max}
              value={data.digits}
              onChange={(e) =>
                onChange({ digits: e.target.value.replace(/\D/g, "") })
              }
            />
          </div>

          <div
            className={`flex flex-col sm:flex-row sm:items-center gap-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            <button
              type="button"
              disabled={!showCodeField}
              onClick={() => {
                if (!showCodeField) return;
                onChange({ hideCode: !data.hideCode });
              }}
              className={`inline-flex items-center gap-2 h-8 px-3 rounded-full border text-xs font-medium transition-colors ${isRTL ? "flex-row-reverse" : ""} ${!showCodeField ? "opacity-50 cursor-not-allowed" : ""}`}
              style={
                showCodeField && data.hideCode
                  ? {
                      backgroundColor: getColor("primary"),
                      borderColor: getColor("primary"),
                      color: "#fff",
                    }
                  : {
                      backgroundColor: getColor("surface"),
                      borderColor: getColor("border"),
                      color: getColor("secondaryText"),
                    }
              }
              title={
                !showCodeField ? t("listings.hide_code_unavailable") : undefined
              }
            >
              <EyeOff className="w-4 h-4" />
              {t("listings.hide_code")}
            </button>
            <span
              className={`flex items-center gap-1.5 text-xs ${isRTL ? "flex-row-reverse text-right" : ""}`}
              style={{ color: getColor("secondaryText") }}
            >
              {showCodeField
                ? t("listings.hide_code_hint")
                : t("listings.hide_code_unavailable")}
              <Info
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: getColor("mutedText") }}
              />
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

          {/* <button
            type="button"
            className="w-full rounded-xl border border-dashed py-8 px-4 flex flex-col items-center justify-center gap-2 text-sm transition-colors"
            style={{
              backgroundColor: `${getColor("background")}80`,
              borderColor: getColor("border"),
              color: getColor("secondaryText"),
            }}
          >
            <Camera className="w-6 h-6" />
            <span>{t("listings.scan_plate")}</span>
          </button> */}

          <div>
            <label
              className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("secondaryText") }}
            >
              {t("listings.seller_notes")}
            </label>
            <textarea
              value={data.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder={t("listings.notes_placeholder")}
              rows={3}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 ${isRTL ? "text-right" : "text-left"}`}
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            />
          </div>

          <div>
            <label
              className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("secondaryText") }}
            >
              {t("listings.ownership_doc")}
            </label>
            <label
              className={`flex items-center gap-3 w-full rounded-xl border bg-white px-4 py-3 cursor-pointer transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ borderColor: getColor("border") }}
            >
              <span
                className={`grow text-sm ${isRTL ? "text-right" : "text-left"}`}
                style={{ color: getColor("mutedText") }}
              >
                {data.ownershipFileName || t("listings.upload_document")}
              </span>
              <Upload
                className="w-[18px] h-[18px] shrink-0"
                style={{ color: getColor("secondaryText") }}
              />
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
          className={`flex items-center justify-between border-t mt-8 pt-5 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ borderColor: getColor("border") }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            leftIcon={<BackIcon className="w-4 h-4" />}
            className="!rounded-lg"
            style={{ color: getColor("secondaryText") }}
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
          emirate={t("listings.emirate_dubai")}
          plateVariant={data.plateVariant}
          preview={selectedVariant?.preview}
          showCode={showCodeField}
          price={data.price}
          hideCode={showCodeField && data.hideCode}
        />
      </div>
    </div>
  );
}
