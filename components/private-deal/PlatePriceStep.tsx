"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Search,
  Wallet,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import type { DealData } from "./DealSummary";

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
  preview?: {
    background_image_url?: string;
    width?: number;
    height?: number;
    aspect_ratio?: string;
    overlays?: {
      plate_code?: {
        left?: string;
        right?: string;
        top?: string;
        transform?: string;
        font_size?: string;
        font_weight?: string;
        color?: string;
        font_family?: string;
        hide_when_code?: string[];
      };
      plate_digits?: {
        left?: string;
        right?: string;
        top?: string;
        transform?: string;
        font_size?: string;
        font_weight?: string;
        color?: string;
        font_family?: string;
      };
    };
  };
}

interface FormErrors {
  code?: string;
  digit?: string;
  price?: string;
}

interface PlatePriceStepProps {
  data: DealData;
  onChange: (patch: Partial<DealData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function PlatePriceStep({
  data,
  onChange,
  onBack,
  onContinue,
}: PlatePriceStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const [variants, setVariants] = useState<Variant[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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

  const selectableCodes = variantPlateCodes;
  const filteredCodes = selectableCodes.filter((c) =>
    String(c.code || "")
      .toLowerCase()
      .includes(String(codeSearch || "").toLowerCase()),
  );

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCodeSelect = (code: string) => {
    onChange({ code });
    setCodeDropdownOpen(false);
    setCodeSearch("");
    clearError("code");
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (showCodeField) {
      const code = data.code.trim();
      if (!code) {
        newErrors.code = t("private-deal.error_code_required");
      } else if (selectableCodes.length > 0) {
        if (!selectableCodes.some((c) => c.code === code)) {
          newErrors.code = t("private-deal.error_code_invalid");
        }
      }
    }

    const digits = data.digit.trim();
    if (!digits) {
      newErrors.digit = t("private-deal.error_digits_required");
    } else if (!/^\d+$/.test(digits)) {
      newErrors.digit = t("private-deal.error_digits_numeric");
    } else if (variantDigits) {
      if (variantDigits.min != null && digits.length < variantDigits.min) {
        newErrors.digit = t("private-deal.error_digits_min");
      }
      if (variantDigits.max != null && digits.length > variantDigits.max) {
        newErrors.digit = t("private-deal.error_digits_max");
      }
      if (variantDigits.pattern) {
        try {
          const raw = variantDigits.pattern.replace(/^\/|\/$/g, "");
          const regex = new RegExp(raw);
          if (!regex.test(digits)) {
            newErrors.digit = t("private-deal.error_digits_pattern");
          }
        } catch {
          // invalid regex from API — skip pattern check
        }
      }
    }

    if (!data.price || data.price <= 0) {
      newErrors.price = t("private-deal.error_price_required");
    }

    return newErrors;
  };

  const handleContinue = () => {
    setTouched({ code: true, digit: true, price: true });
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
      <h2
        className={`text-2xl font-serif mb-1 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("primaryText") }}
      >
        {t("private-deal.plate_title")}
      </h2>
      <p
        className={`text-sm mb-6 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("private-deal.plate_subtitle")}
      </p>

      <div className="space-y-4 mb-4">
        <div>
          <label
            className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("private-deal.emirate")}
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
              digit: "",
            });
            setErrors({});
            setTouched({});
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
                  {t("private-deal.code")}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCodeDropdownOpen(!codeDropdownOpen)}
                    className={`w-full rounded-xl border bg-white py-3 px-4 text-sm flex items-center justify-between transition-all ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                    style={{
                      borderColor:
                        touched.code && errors.code
                          ? getColor("error")
                          : getColor("border"),
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
                {touched.code && errors.code && (
                  <div
                    className={`flex items-center gap-1.5 mt-1.5 text-[11px] ${isRTL ? "flex-row-reverse" : "flex-row"}`}
                    style={{ color: getColor("error") }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.code}</span>
                  </div>
                )}
              </div>
            ) : (
              <Input
                name="code"
                label={t("private-deal.code")}
                type="text"
                placeholder="M"
                value={data.code}
                onChange={(e) => {
                  onChange({ code: e.target.value.toUpperCase() });
                  clearError("code");
                }}
                onBlur={() => handleBlur("code")}
                error={touched.code ? errors.code : undefined}
              />
            )
          ) : (
            <div>
              <label
                className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
                style={{ color: getColor("secondaryText") }}
              >
                {t("private-deal.code")}
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
            name="digit"
            label={t("private-deal.digit")}
            type="text"
            placeholder={
              variantDigits?.min
                ? `${variantDigits.min}-${variantDigits.max || ""} digits`
                : "777"
            }
            maxLength={variantDigits?.max}
            value={data.digit}
            onChange={(e) => {
              onChange({ digit: e.target.value.replace(/\D/g, "") });
              clearError("digit");
            }}
            onBlur={() => handleBlur("digit")}
            error={touched.digit ? errors.digit : undefined}
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("secondaryText") }}
        >
          {t("private-deal.live_preview")}
        </label>
        <NumberPlateDisplay
          plate_code={showCodeField ? data.code : ""}
          plate_digits={data.digit}
          emirate={t("listings.emirate_dubai")}
          preview={selectedVariant?.preview}
          plateVariant={data.plateVariant}
          crop="card"
          showCode={showCodeField}
        />
      </div>

      <div className="w-full mb-6">
        <Input
          label={t("private-deal.agreed_price_aed")}
          icon={<Wallet className="w-4 h-4" />}
          value={data.price ? data.price.toLocaleString("en-AE") : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
            onChange({ price: raw ? Number(raw) : 0 });
            clearError("price");
          }}
          onBlur={() => handleBlur("price")}
          error={touched.price ? errors.price : undefined}
          placeholder="450,000"
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
        >
          {t("private-deal.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("private-deal.continue")}
        </Button>
      </div>
    </div>
  );
}
