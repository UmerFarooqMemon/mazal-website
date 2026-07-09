"use client";
import { useState } from "react";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";

interface CertificateFormProps {
  emirates: { key: string; label: string }[];
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
  const [form, setForm] = useState({
    emirate: "dubai",
    plate_code: "",
    plate_digits: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
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
        {/* Emirate - Dubai Only (Fixed) */}
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

        {/* Code & Digits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-xs text-gray-500 font-medium mb-1 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("listings.code")}
            </label>
            <input
              type="text"
              className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm ${isRTL ? "text-right" : "text-left"}`}
              placeholder="K"
              value={form.plate_code}
              onChange={(e) => setForm({ ...form, plate_code: e.target.value })}
            />
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
              placeholder="55"
              value={form.plate_digits}
              onChange={(e) =>
                setForm({ ...form, plate_digits: e.target.value })
              }
            />
          </div>
        </div>

        {/* Upload Document */}
        <div>
          <label
            className={`block text-xs text-gray-500 font-medium mb-1 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("certificates.upload_document")}
          </label>
          <div
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white flex items-center justify-between cursor-pointer hover:bg-gray-50 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span className="text-gray-400">
              {t("certificates.upload_placeholder")}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
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

        {/* Valuation Preview */}
        <div
          className={`bg-[#EEF2F8] border border-[#0A3B9E]/20 rounded-xl p-5 flex justify-between items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <div className="text-xs text-gray-500">
              {t("certificates.estimated_valuation")}
            </div>
            <div className="text-3xl font-bold text-[#0A3B9E]">AED 610,000</div>
          </div>
          <div className="relative h-14 w-25 shrink-0">
            <Image
              src="/plate-empty.png"
              alt="Plate preview"
              fill
              className="object-contain"
              sizes="100px"
            />
          </div>
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
