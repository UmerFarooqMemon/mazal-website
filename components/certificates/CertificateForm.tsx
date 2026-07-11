"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";
import { Upload, X } from "lucide-react";

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

export default function CertificateForm({
  emirates,
  types,
  onSubmit,
  isLoading,
}: CertificateFormProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    emirate: "dubai",
    plate_variant: "private_new_colorful",
    plate_code: "",
    plate_digits: "",
    price: "", // ✅ Your estimate
    description: "", // ✅ Justification
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const dubai = emirates.find((e) => e.key === "dubai");
  const variants: Variant[] = dubai?.variants || [];
  const selectedVariant = variants.find((v) => v.key === form.plate_variant);
  const showCodeField = selectedVariant?.has_code ?? true;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert(
        t("certificates.mulkiya_required") ||
          "Please upload your Mulkiya (vehicle registration card) image.",
      );
      return;
    }

    onSubmit({
      emirate: form.emirate,
      plate_variant: form.plate_variant,
      plate_code: showCodeField ? form.plate_code : undefined,
      plate_digits: form.plate_digits,
      price: form.price, // ✅ Send price
      description: form.description, // ✅ Send justification
      mulkiya_image: selectedFile,
    });
  };

  return (
    <div className="bg-[#FAFAF8] rounded-2xl border border-gray-200 p-8">
      <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="text-[#0A3B9E] text-xs font-bold uppercase tracking-wider mb-2">
          {t("certificates.order_valuation")}
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#041443]">
          {t("certificates.certificate_request")}
        </h2>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Emirate – fixed Dubai */}
        <div>
          <label
            className={`block text-xs text-gray-500 font-medium mb-1 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("listings.emirate")}
          </label>
          <div
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("listings.emirate_dubai")}
          </div>
        </div>

        {/* Plate Variant */}
        <div>
          <label
            className={`block text-xs text-gray-500 font-medium mb-1 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("certificates.plate_variant") || "Plate Variant"}
          </label>
          <select
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white ${isRTL ? "text-right" : "text-left"}`}
            value={form.plate_variant}
            onChange={(e) =>
              setForm({ ...form, plate_variant: e.target.value })
            }
          >
            {variants.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Code & Digits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-xs text-gray-500 font-medium mb-1 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("listings.code")}
            </label>
            {showCodeField ? (
              <input
                type="text"
                className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm ${isRTL ? "text-right" : "text-left"}`}
                placeholder="M"
                value={form.plate_code}
                onChange={(e) =>
                  setForm({ ...form, plate_code: e.target.value })
                }
              />
            ) : (
              <div
                className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("certificates.digits_only") || "Digits only"}
              </div>
            )}
          </div>
          <div>
            <label
              className={`block text-xs text-gray-500 font-medium mb-1 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("listings.digits")}
            </label>
            <input
              type="text"
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm ${isRTL ? "text-right" : "text-left"}`}
              placeholder="777"
              value={form.plate_digits}
              onChange={(e) =>
                setForm({ ...form, plate_digits: e.target.value })
              }
            />
          </div>
        </div>

        {/* ✅ Your Estimate */}
        <div>
          <label
            className={`block text-xs text-gray-500 font-medium mb-1 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("certificates.your_estimate") || "Your estimate"}
          </label>
          <div className="relative">
            <span
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-gray-400 text-sm`}
            >
              {/* AED */}
            </span>
            <input
              type="number"
              className={`w-full border border-gray-200 rounded-lg py-2 text-sm bg-white ${isRTL ? "pr-14 pl-3 text-right" : "pl-14 pr-3 text-left"}`}
              placeholder=""
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>

        {/* ✅ Justification */}
        <div>
          <label
            className={`block text-xs text-gray-500 font-medium mb-1 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("certificates.justification") || "Justification"}
          </label>
          <textarea
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white resize-none ${isRTL ? "text-right" : "text-left"}`}
            rows={3}
            // placeholder={t("certificates.justification_placeholder") || "Tell us why you believe your number plate is worth this price. Mention factors such as rarity, memorable digits, uniqueness, previous offers, or market demand."}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Upload Document */}
        <div>
          <label
            className={`block text-xs text-gray-500 font-medium mb-1 ${isRTL ? "text-right" : "text-left"}`}
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
              className={`flex items-center justify-between border border-green-200 rounded-lg px-3 py-2 text-sm bg-green-50 ${isRTL ? "flex-row-reverse" : ""}`}
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
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span className="text-gray-400">
                {t("certificates.upload_placeholder")}
              </span>
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Rush Delivery */}
        <div
          className={`flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-white ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <div className="font-medium text-sm text-[#041443]">
              {t("certificates.rush_delivery")}
            </div>
            <div className="text-xs text-gray-500">
              {t("certificates.rush_desc")}
            </div>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-gray-300 text-[#0A3B9E] focus:ring-[#0A3B9E]"
          />
        </div>

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
            : `${t("certificates.order_certificate")} - AED 750`}
        </Button>
        <p
          className={`text-xs text-gray-400 text-center mt-3 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("certificates.delivery_notice")}
        </p>
      </form>
    </div>
  );
}
