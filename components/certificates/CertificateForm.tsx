"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
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
  const showCodeField = selectedVariant?.has_code ?? true;

  // Mark field as touched on blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          mulkiya:
            t("certificates.error_file_type") || "Please upload an image file",
        }));
        return;
      }
      // Validate file size (max 5MB)
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate all fields
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (showCodeField && !form.plate_code.trim()) {
      newErrors.plate_code =
        t("certificates.error_code_required") || "Plate code is required";
    }

    if (!form.plate_digits.trim()) {
      newErrors.plate_digits =
        t("certificates.error_digits_required") || "Plate digits are required";
    } else if (!/^\d+$/.test(form.plate_digits.trim())) {
      newErrors.plate_digits =
        t("certificates.error_digits_numeric") || "Digits must be numbers only";
    }

    if (!selectedFile) {
      newErrors.mulkiya =
        t("certificates.mulkiya_required") || "Please upload your Mulkiya";
    }

    return newErrors;
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      plate_code: true,
      plate_digits: true,
      price: true,
      description: true,
      mulkiya: true,
    });

    // Validate
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit data
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
    <div className="bg-[#FAFAF8] rounded-2xl border border-gray-200 p-8">
      {/* Header */}
      <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="text-[#0A3B9E] text-xs font-bold uppercase tracking-wider mb-2">
          {t("certificates.order_valuation")}
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#041443]">
          {t("certificates.certificate_request")}
        </h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Emirate – fixed Dubai */}
        <div>
          <label
            className={`block text-[11px] font-medium text-gray-500 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("listings.emirate")}
          </label>
          <div
            className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("listings.emirate_dubai")}
          </div>
        </div>

        {/* Plate Variant - Custom Select */}
        <Select
          label={t("certificates.plate_variant")}
          options={variants}
          value={form.plate_variant}
          onChange={(value) => setForm({ ...form, plate_variant: value })}
          placeholder={t("common.select") || "Select..."}
        />

        {/* Code & Digits */}
        <div className="grid grid-cols-2 gap-4">
          {showCodeField ? (
            <Input
              name="plate_code"
              label={t("listings.code")}
              type="text"
              placeholder="M"
              value={form.plate_code}
              onChange={(e) => handleChange("plate_code", e.target.value)}
              onBlur={() => handleBlur("plate_code")}
              error={touched.plate_code ? errors.plate_code : undefined}
            />
          ) : (
            <div>
              <label
                className={`block text-[11px] font-medium text-gray-500 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("listings.code")}
              </label>
              <div
                className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-400 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("certificates.digits_only") || "Digits only"}
              </div>
            </div>
          )}
          <Input
            name="plate_digits"
            label={t("listings.digits")}
            type="text"
            placeholder="777"
            value={form.plate_digits}
            onChange={(e) => handleChange("plate_digits", e.target.value)}
            onBlur={() => handleBlur("plate_digits")}
            error={touched.plate_digits ? errors.plate_digits : undefined}
          />
        </div>

        {/* Your Estimate */}
        <div>
          <label
            className={`block text-[11px] font-medium text-gray-500 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("certificates.your_estimate") || "Your estimate"}
          </label>
          <div className="relative">
            {/* Input with proper padding like Justification */}
            <input
              type="text"
              className={`w-full rounded-xl border bg-white py-3 px-4 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all ${
                touched.price && errors.price
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 focus:border-[#0A3B9E] focus:ring-[#0A3B9E]/20"
              } ${isRTL ? "text-right pr-16" : "text-left pl-16"}`}
              placeholder=""
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              onBlur={() => handleBlur("price")}
            />
          </div>
          {/* Error for Price */}
          {touched.price && errors.price && (
            <div
              className={`flex items-center gap-1.5 mt-1.5 text-[11px] text-red-500 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.price}</span>
            </div>
          )}
        </div>

        {/* Justification */}
        <div>
          <label
            className={`block text-[11px] font-medium text-gray-500 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("certificates.justification") || "Justification"}
          </label>
          <textarea
            className={`w-full rounded-xl border bg-white py-3 px-4 text-sm resize-none placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all ${
              touched.description && errors.description
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-200 focus:border-[#0A3B9E] focus:ring-[#0A3B9E]/20"
            } ${isRTL ? "text-right" : "text-left"}`}
            rows={3}
            placeholder={
              t("certificates.justification_placeholder") || "Tell us why..."
            }
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
          />
          {/* Error for Description */}
          {touched.description && errors.description && (
            <div
              className={`flex items-center gap-1.5 mt-1.5 text-[11px] text-red-500 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.description}</span>
            </div>
          )}
          {/* Character count */}
          <p
            className={`text-[10px] text-gray-400 mt-1.5 ${isRTL ? "text-right" : "text-left"}`}
          >
            {form.description.length}/500
          </p>
        </div>

        {/* Upload Document */}
        <div>
          <label
            className={`block text-[11px] font-medium text-gray-500 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
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
              className={`flex items-center justify-between border border-green-200 rounded-xl px-4 py-3 text-sm bg-green-50 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm truncate max-w-50">
                  {selectedFile.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border rounded-xl px-4 py-3 text-sm bg-white flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${
                errors.mulkiya ? "border-red-300" : "border-gray-200"
              } ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span className="text-gray-400">
                {t("certificates.upload_placeholder")}
              </span>
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {/* Error for Mulkiya */}
          {errors.mulkiya && (
            <div
              className={`flex items-center gap-1.5 mt-1.5 text-[11px] text-red-500 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.mulkiya}</span>
            </div>
          )}
        </div>

        {/* Rush Delivery */}
        <div
          className={`flex items-center border border-gray-200 rounded-xl p-4 bg-white ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-gray-300 text-[#0A3B9E] focus:ring-[#0A3B9E] shrink-0"
            />
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className="font-medium text-sm text-[#041443]">
                {t("certificates.rush_delivery")}
              </div>
              <div className="text-xs text-gray-500">
                {t("certificates.rush_desc")}
              </div>
            </div>
          </div>
        </div>

        {/* LIVE PREVIEW Box */}
        <div
          className="rounded-xl overflow-hidden border border-gray-200"
          style={{ backgroundColor: "#F6F8FC" }}
        >
          <div className={`px-5 pt-5 ${isRTL ? "text-right" : "text-left"}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
              {t("certificates.live_preview") || "LIVE PREVIEW"}
            </span>
          </div>
          <div className="flex items-center justify-center px-4 py-6">
            <PlateWithOverlay
              plate_code={form.plate_code}
              plate_digits={form.plate_digits}
              emirate={t("listings.emirate_dubai")}
              width={280}
              height={84}
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
          className={`text-xs text-gray-400 text-center mt-3 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("certificates.delivery_notice")}
        </p>
      </form>
    </div>
  );
}
