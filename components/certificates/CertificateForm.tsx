"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PlateWithOverlay from "@/components/ui/PlateWithOverlay";
import { Upload, X, ArrowRight, AlertCircle } from "lucide-react";

// Types
interface Variant {
  key: string;
  label: string;
  plate_type: string;
  plate_design: string;
  has_code: boolean;
  fields?: string[];
  plate_codes?: string[] | null;
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

interface CertificateFormProps {
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

export default function CertificateForm({
  emirates,
  types,
  onSubmit,
  isLoading,
}: CertificateFormProps) {
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

  // Get Dubai variants
  const dubai = emirates.find((e) => e.key === "dubai");
  const variants: Variant[] = dubai?.variants || [];
  const selectedVariant = variants.find((v) => v.key === form.plate_variant);

  // Derive field visibility from variant
  const variantFields = selectedVariant?.fields || ["plate_code", "plate_digits"];
  const showCodeField = variantFields.includes("plate_code") && (selectedVariant?.has_code ?? true);
  const variantDigits = selectedVariant?.digits;
  const variantPlateCodes = selectedVariant?.plate_codes;

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

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          mulkiya:
            t("certificates.error_file_type") || "Please upload an image file",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          mulkiya:
            t("certificates.error_file_size") || "File size must be under 5MB",
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
        newErrors.plate_code =
          t("certificates.error_code_required") || "Plate code is required";
      } else if (variantPlateCodes && variantPlateCodes.length > 0) {
        if (!variantPlateCodes.includes(code)) {
          newErrors.plate_code =
            t("certificates.error_code_invalid") || `Invalid code. Allowed: ${variantPlateCodes.join(", ")}`;
        }
      }
    }

    // Plate digits validation using variant digits config
    const digits = form.plate_digits.trim();
    if (!digits) {
      newErrors.plate_digits =
        t("certificates.error_digits_required") || "Plate digits are required";
    } else if (!/^\d+$/.test(digits)) {
      newErrors.plate_digits =
        t("certificates.error_digits_numeric") || "Digits must be numbers only";
    } else if (variantDigits) {
      if (variantDigits.min != null && digits.length < variantDigits.min) {
        newErrors.plate_digits =
          t("certificates.error_digits_min") || `Minimum ${variantDigits.min} digit(s) required`;
      }
      if (variantDigits.max != null && digits.length > variantDigits.max) {
        newErrors.plate_digits =
          t("certificates.error_digits_max") || `Maximum ${variantDigits.max} digit(s) allowed`;
      }
      if (variantDigits.pattern) {
        try {
          // Strip JS regex delimiters (e.g. "/^\\d{1,5}$/" → "^\\d{1,5}$")
          const raw = variantDigits.pattern.replace(/^\/|\/$/g, "");
          const regex = new RegExp(raw);
          if (!regex.test(digits)) {
            newErrors.plate_digits =
              t("certificates.error_digits_pattern") || "Invalid digits format";
          }
        } catch {
          // invalid regex from API — skip pattern check
        }
      }
    }

    if (!selectedFile)
      newErrors.mulkiya =
        t("certificates.mulkiya_required") || "Please upload your Mulkiya";
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
          {t("certificates.order_valuation")}
        </div>
        <h2
          className="text-3xl font-serif font-bold"
          style={{ color: getColor("primaryText") }}
        >
          {t("certificates.certificate_request")}
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
          label={t("certificates.plate_variant")}
          options={variants}
          value={form.plate_variant}
          onChange={(value) => {
            const newVariant = variants.find((v) => v.key === value);
            const newFields = newVariant?.fields || ["plate_code", "plate_digits"];
            setForm((prev) => ({
              ...prev,
              plate_variant: value,
              plate_code: newFields.includes("plate_code") ? prev.plate_code : "",
              plate_digits: "",
            }));
            setErrors({});
          }}
          placeholder={t("common.select") || "Select..."}
        />

        {/* Code & Digits */}
        <div className="grid grid-cols-2 gap-4">
          {showCodeField ? (
            <Input
              name="plate_code"
              label={t("listings.code")}
              type="text"
              placeholder={
                variantPlateCodes && variantPlateCodes.length > 0
                  ? variantPlateCodes.slice(0, 3).join(", ") + "..."
                  : "M"
              }
              value={form.plate_code}
              onChange={(e) => handleChange("plate_code", e.target.value.toUpperCase())}
              onBlur={() => handleBlur("plate_code")}
              error={touched.plate_code ? errors.plate_code : undefined}
            />
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
                {t("certificates.digits_only") || "Digits only"}
              </div>
            </div>
          )}
          <Input
            name="plate_digits"
            label={t("listings.digits")}
            type="text"
            placeholder={variantDigits?.min ? `${variantDigits.min}-${variantDigits.max || ""} digits` : "777"}
            maxLength={variantDigits?.max}
            value={form.plate_digits}
            onChange={(e) => handleChange("plate_digits", e.target.value)}
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
            {t("certificates.your_estimate") || "Your estimate"}
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
            {t("certificates.justification") || "Justification"}
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
            {t("certificates.upload_document")}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="mulkiya-upload"
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
              <span>{t("certificates.upload_placeholder")}</span>
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

        {/* Rush Delivery */}
        <div
          className={`flex items-center border rounded-xl p-4 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{
            borderColor: getColor("border"),
            backgroundColor: getColor("surface"),
          }}
        >
          <div
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <input
              type="checkbox"
              className="w-5 h-5 rounded shrink-0"
              style={{ accentColor: getColor("primary") }}
            />
            <div className={isRTL ? "text-right" : "text-left"}>
              <div
                className="font-medium text-sm"
                style={{ color: getColor("primaryText") }}
              >
                {t("certificates.rush_delivery")}
              </div>
              <div
                className="text-xs"
                style={{ color: getColor("secondaryText") }}
              >
                {t("certificates.rush_desc")}
              </div>
            </div>
          </div>
        </div>

        {/* LIVE PREVIEW Box */}
        <div
          className="rounded-xl overflow-hidden border"
          style={{
            borderColor: getColor("border"),
            backgroundColor: getColor("primaryLight"),
          }}
        >
          <div className={`px-5 pt-5 ${isRTL ? "text-right" : "text-left"}`}>
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: getColor("secondaryText") }}
            >
              {t("certificates.live_preview") || "LIVE PREVIEW"}
            </span>
          </div>
          <div className="flex items-center justify-center px-4 py-4">
            <PlateWithOverlay
              plate_code={form.plate_code}
              plate_digits={form.plate_digits}
              emirate={t("listings.emirate_dubai")}
              imageUrl={selectedVariant?.preview?.background_image_url || "/certificates-preview.png"}
              preview={selectedVariant?.preview}
              isRTL={isRTL}
            />
          </div>
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
            ? t("common.loading") || "Sending..."
            : t("certificates.order_certificate")}
          <ArrowRight
            className={`w-5 h-5 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
          />
        </Button>

        {/* Delivery Notice */}
        <p
          className={`text-xs text-center mt-3 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("mutedText") }}
        >
          {t("certificates.delivery_notice")}
        </p>
      </form>
    </div>
  );
}
