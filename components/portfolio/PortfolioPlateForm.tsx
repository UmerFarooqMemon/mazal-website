"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import {
  Upload,
  X,
  ArrowRight,
  AlertCircle,
  Search,
  ChevronDown,
} from "lucide-react";

// Types
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

interface PortfolioPlateFormProps {
  emirates: {
    key: string;
    label: string;
    selection_mode?: "variants" | "types";
    variants?: Variant[];
    types?: { key: string; label: string }[];
    plate_designs?: { key: string; label: string }[];
  }[];
  types: { key: string; label: string }[];
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

interface FormErrors {
  plate_code?: string;
  plate_digits?: string;
  price?: string;
  description?: string;
  mulkiya?: string;
}

export default function PortfolioPlateForm({
  emirates,
  types,
  onSubmit,
  isLoading,
}: PortfolioPlateFormProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    emirate: "dubai",
    plate_variant: "private_new_colorful",
    plate_code: "",
    plate_digits: "",
    price: "",
    description: "",
  });

  // File & error states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Code dropdown state
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const codeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
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

  // Get Dubai variants
  const dubai = emirates.find((e) => e.key === "dubai");
  const variants: Variant[] = dubai?.variants || [];
  const selectedVariant = variants.find((v) => v.key === form.plate_variant);

  // Derive field visibility from variant
  const variantFields = selectedVariant?.fields || [
    "plate_code",
    "plate_digits",
  ];
  const showCodeField =
    variantFields.includes("plate_code") && (selectedVariant?.has_code ?? true);
  const variantDigits = selectedVariant?.digits;
  const rawPlateCodes = selectedVariant?.plate_codes || [];

  // Normalize plate codes to { code, label, show_on_preview } format
  const variantPlateCodes: PlateCodeItem[] = Array.isArray(rawPlateCodes)
    ? rawPlateCodes.map((item) =>
        typeof item === "string"
          ? { code: item, label: item, show_on_preview: true }
          : item && typeof item === "object" && "code" in item
            ? item
            : { code: String(item), label: String(item), show_on_preview: true },
      )
    : [];

  // Codes available for selection in the dropdown (all codes)
  const selectableCodes = variantPlateCodes;

  // Filter codes based on search
  const filteredCodes = selectableCodes.filter((c) =>
    String(c.code || "").toLowerCase().includes(String(codeSearch || "").toLowerCase()),
  );

  // Mark field as touched on blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle code selection from dropdown
  const handleCodeSelect = (code: string) => {
    setForm((prev) => ({ ...prev, plate_code: code }));
    setCodeDropdownOpen(false);
    setCodeSearch("");
    if (errors.plate_code) {
      setErrors((prev) => ({ ...prev, plate_code: undefined }));
    }
  };

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          mulkiya: t("certificates.error_file_type"),
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          mulkiya: t("certificates.error_file_size"),
        }));
        return;
      }
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, mulkiya: undefined }));
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Validate all fields using variant-specific rules
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Plate code validation
    if (showCodeField) {
      const code = form.plate_code.trim();
      if (!code) {
        newErrors.plate_code = t("certificates.error_code_required");
      } else if (selectableCodes.length > 0) {
        if (!selectableCodes.some((c) => c.code === code)) {
          newErrors.plate_code = t("certificates.error_code_invalid");
        }
      }
    }

    // Plate digits validation
    const digits = form.plate_digits.trim();
    if (!digits) {
      newErrors.plate_digits = t("certificates.error_digits_required");
    } else if (!/^\d+$/.test(digits)) {
      newErrors.plate_digits = t("certificates.error_digits_numeric");
    } else if (variantDigits) {
      if (variantDigits.min != null && digits.length < variantDigits.min) {
        newErrors.plate_digits = t("certificates.error_digits_min");
      }
      if (variantDigits.max != null && digits.length > variantDigits.max) {
        newErrors.plate_digits = t("certificates.error_digits_max");
      }
      if (variantDigits.pattern) {
        try {
          const raw = variantDigits.pattern.replace(/^\/|\/$/g, "");
          const regex = new RegExp(raw);
          if (!regex.test(digits)) {
            newErrors.plate_digits = t("certificates.error_digits_pattern");
          }
        } catch {
          // invalid regex from API — skip pattern check
        }
      }
    }

    if (!selectedFile) {
      newErrors.mulkiya = t("portfolio.add_plate_mulkiya_required");
    }
    return newErrors;
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      plate_code: true,
      plate_digits: true,
      price: true,
      description: true,
      mulkiya: true,
    });
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({
      emirate: form.emirate,
      plate_variant: form.plate_variant,
      plate_code: showCodeField ? form.plate_code : undefined,
      plate_digits: form.plate_digits,
      price: form.price,
      description: form.description,
      mulkiya_image: selectedFile,
    });
  };

  return (
    <div
      className="rounded-2xl border p-8"
      style={{
        backgroundColor: getColor("background"),
        borderColor: getColor("border"),
      }}
    >
      {/* Header */}
      <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
        <div
          className="text-xs font-bold uppercase tracking-wider mb-2"
          style={{ color: getColor("primary") }}
        >
          {t("portfolio.add_plate_form_eyebrow")}
        </div>
        <h2
          className="text-3xl font-serif font-bold"
          style={{ color: getColor("primaryText") }}
        >
          {t("portfolio.add_plate_form_title")}
        </h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Emirate – fixed Dubai */}
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

        {/* Plate Variant - Custom Select */}
        <Select
          label={t("portfolio.add_plate_variant")}
          options={variants}
          value={form.plate_variant}
          onChange={(value) => {
            const newVariant = variants.find((v) => v.key === value);
            const newFields = newVariant?.fields || [
              "plate_code",
              "plate_digits",
            ];
            setForm((prev) => ({
              ...prev,
              plate_variant: value,
              plate_code: newFields.includes("plate_code")
                ? prev.plate_code
                : "",
              plate_digits: "",
            }));
            setErrors({});
          }}
          placeholder={t("common.select")}
        />

        {/* Code & Digits */}
        <div className="grid grid-cols-2 gap-4">
          {showCodeField ? (
            variantPlateCodes.length > 0 ? (
              /* Dropdown with search for plate codes */
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
                      borderColor:
                        touched.plate_code && errors.plate_code
                          ? getColor("error")
                          : getColor("border"),
                      color: form.plate_code
                        ? getColor("primaryText")
                        : getColor("mutedText"),
                    }}
                  >
                    <span>
                      {form.plate_code || t("portfolio.add_plate_select_code")}
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
                      {/* Search input */}
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

                      {/* Codes list */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCodes.length > 0 ? (
                          filteredCodes.map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => handleCodeSelect(item.code)}
                              className={`w-full px-4 py-2.5 text-sm transition-colors hover:bg-opacity-10 ${isRTL ? "text-right" : "text-left"}`}
                              style={{
                                color:
                                  item.code === form.plate_code
                                    ? getColor("primary")
                                    : getColor("primaryText"),
                                backgroundColor:
                                  item.code === form.plate_code
                                    ? `${getColor("primary")}10`
                                    : "transparent",
                              }}
                              onMouseEnter={(e) => {
                                if (item.code !== form.plate_code) {
                                  e.currentTarget.style.backgroundColor = `${getColor("primary")}05`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (item.code !== form.plate_code) {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }
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
                {touched.plate_code && errors.plate_code && (
                  <div
                    className={`flex items-center gap-1.5 mt-1.5 text-[11px] ${isRTL ? "flex-row-reverse" : "flex-row"}`}
                    style={{ color: getColor("error") }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.plate_code}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Regular input for plate code */
              <Input
                name="plate_code"
                label={t("listings.code")}
                type="text"
                placeholder="M"
                value={form.plate_code}
                onChange={(e) =>
                  handleChange("plate_code", e.target.value.toUpperCase())
                }
                onBlur={() => handleBlur("plate_code")}
                error={touched.plate_code ? errors.plate_code : undefined}
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
                {t("portfolio.add_plate_digits_only")}
              </div>
            </div>
          )}
          <Input
            name="plate_digits"
            label={t("listings.digits")}
            type="text"
            placeholder={
              variantDigits?.min
                ? `${variantDigits.min}-${variantDigits.max || ""} digits`
                : "777"
            }
            maxLength={variantDigits?.max}
            value={form.plate_digits}
            onChange={(e) => handleChange("plate_digits", e.target.value.replace(/\D/g, ""))}
            onBlur={() => handleBlur("plate_digits")}
            error={touched.plate_digits ? errors.plate_digits : undefined}
          />
        </div>

        {/* Your Estimate */}
        <div>
          <label
            className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("portfolio.add_plate_your_estimate")}
          </label>
          <div className="relative">
            <input
              type="text"
              className={`w-full rounded-xl border bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 transition-all ${isRTL ? "text-right" : "text-left"}`}
              style={{
                borderColor:
                  touched.price && errors.price
                    ? getColor("error")
                    : getColor("border"),
                color: getColor("primaryText"),
              }}
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              onBlur={() => handleBlur("price")}
            />
          </div>
          {touched.price && errors.price && (
            <div
              className={`flex items-center gap-1.5 mt-1.5 text-[11px] ${isRTL ? "flex-row-reverse" : "flex-row"}`}
              style={{ color: getColor("error") }}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.price}</span>
            </div>
          )}
        </div>

        {/* Justification */}
        <div>
          <label
            className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("portfolio.add_plate_justification")}
          </label>
          <textarea
            className={`w-full rounded-xl border bg-white py-3 px-4 text-sm resize-none focus:outline-none focus:ring-2 transition-all ${isRTL ? "text-right" : "text-left"}`}
            style={{
              borderColor:
                touched.description && errors.description
                  ? getColor("error")
                  : getColor("border"),
              color: getColor("primaryText"),
            }}
            rows={3}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
            placeholder={t("portfolio.add_plate_justification_placeholder")}
          />
          {touched.description && errors.description && (
            <div
              className={`flex items-center gap-1.5 mt-1.5 text-[11px] ${isRTL ? "flex-row-reverse" : "flex-row"}`}
              style={{ color: getColor("error") }}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.description}</span>
            </div>
          )}
          <p
            className={`text-[10px] mt-1.5 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("mutedText") }}
          >
            {form.description.length}/500
          </p>
        </div>

        {/* Upload Document */}
        <div>
          <label
            className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("portfolio.add_plate_upload_document")}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="portfolio-mulkiya-upload"
          />
          {selectedFile ? (
            <div
              className={`flex items-center justify-between border rounded-xl px-4 py-3 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
              style={{
                borderColor: getColor("success"),
                backgroundColor: `${getColor("success")}15`,
                color: getColor("success"),
              }}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="truncate max-w-50">{selectedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                style={{ color: getColor("mutedText") }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
              style={{
                borderColor: errors.mulkiya
                  ? getColor("error")
                  : getColor("border"),
                backgroundColor: getColor("surface"),
                color: getColor("mutedText"),
              }}
            >
              <span>{t("portfolio.add_plate_upload_placeholder")}</span>
              <Upload className="w-4 h-4" />
            </button>
          )}
          {errors.mulkiya && (
            <div
              className={`flex items-center gap-1.5 mt-1.5 text-[11px] ${isRTL ? "flex-row-reverse" : "flex-row"}`}
              style={{ color: getColor("error") }}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.mulkiya}</span>
            </div>
          )}
        </div>

        {/* LIVE PREVIEW Box */}
        <div
          className="rounded-xl overflow-hidden border"
          style={{
            borderColor: getColor("border"),
            backgroundColor: "#F5F5F5",
          }}
        >
          <div className={`px-5 pt-5 pb-3 ${isRTL ? "text-right" : "text-left"}`}>
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: getColor("secondaryText") }}
            >
              {t("portfolio.add_plate_live_preview")}
            </span>
          </div>
          <NumberPlateDisplay
            plate_code={form.plate_code}
            plate_digits={form.plate_digits}
            emirate={t("listings.emirate_dubai")}
            preview={selectedVariant?.preview}
            crop="form"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          className="rounded-full text-base"
          disabled={isLoading}
        >
          {isLoading
            ? t("common.loading")
            : t("portfolio.add_plate_submit")}
          <ArrowRight
            className={`w-5 h-5 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
          />
        </Button>

        {/* Delivery Notice */}
        <p
          className={`text-xs text-center mt-3 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("mutedText") }}
        >
          {t("portfolio.add_plate_footer_notice")}
        </p>
      </form>
    </div>
  );
}
