"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import {
  apiRequest,
  PlateOptionsResponse,
  NumberPlateSubmitResponse,
} from "@/services/api";
import CertificateForm from "@/components/certificates/CertificateForm";
import CertificatePreview from "@/components/certificates/CertificatePreview";
import CertificateFAQ from "@/components/certificates/CertificateFAQ";
import { BadgeCheck, ShieldCheck, Sparkles, Stamp } from "lucide-react";

export default function CertificateRequestPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<PlateOptionsResponse["data"] | null>(
    null,
  );

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await apiRequest<PlateOptionsResponse>(
          "/api/v1/number-plates/options",
        );
        setOptions(data.data);
      } catch (error) {
        console.error("Error fetching plate options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmitValuation = async (formData: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await apiRequest<NumberPlateSubmitResponse>(
        "/api/v1/number-plates",
        {
          method: "POST",
          body: JSON.stringify(formData),
          token: token || undefined,
        },
      );

      if (response.data?.number_plate?.id) {
        router.push(`/${locale}/valuation/${response.data.number_plate.id}`);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert(t("common.error_submission") || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section 1: Form + Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* Features - Right for Arabic */}
          <div
            className={`flex flex-col justify-center ${isRTL ? "lg:order-2 items-end text-right" : "lg:order-1 items-start text-left"}`}
          >
            <span className="text-[#0A3B9E] text-xs font-bold uppercase tracking-wider mb-3">
              {t("certificates.independent_valuation")}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#041443] leading-tight mb-6">
              {t("certificates.hero_title")}
            </h1>
            <p className="text-gray-600 text-base leading-relaxed mb-8 max-w-md">
              {t("certificates.hero_desc")}
            </p>

            <ul className="space-y-3 text-sm text-gray-600">
              <li
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <BadgeCheck className="w-5 h-5 text-[#0A3B9E] shrink-0" />
                <span>{t("certificates.feature_1")}</span>
              </li>
              <li
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <ShieldCheck className="w-5 h-5 text-[#0A3B9E] shrink-0" />
                <span>{t("certificates.feature_2")}</span>
              </li>
              <li
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Sparkles className="w-5 h-5 text-[#0A3B9E] shrink-0" />
                <span>{t("certificates.feature_3")}</span>
              </li>
              <li
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Stamp className="w-5 h-5 text-[#0A3B9E] shrink-0" />
                <span>{t("certificates.feature_4")}</span>
              </li>
            </ul>
          </div>

          {/* Form - Left for Arabic */}
          <div className={isRTL ? "lg:order-1" : "lg:order-2"}>
            <CertificateForm
              emirates={options?.emirates || []}
              types={options?.plate_types || []}
              onSubmit={handleSubmitValuation}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Section 2: Preview */}
        <CertificatePreview />

        {/* Section 3: FAQ */}
        <CertificateFAQ />
      </div>
    </div>
  );
}
