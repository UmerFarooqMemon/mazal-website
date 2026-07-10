"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import CertificateForm from "@/components/certificates/CertificateForm";
import CertificatePreview from "@/components/certificates/CertificatePreview";
import CertificateFAQ from "@/components/certificates/CertificateFAQ";
import { BadgeCheck, ShieldCheck, Sparkles, Stamp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function CertificateRequestPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const [isSubmitting, setIsSubmitting] = useState(false); // prevent double submission
  const [options, setOptions] = useState<any>(null);

  // Use the auth hook to get the token and authentication state
  const { token, isAuthenticated } = useAuth();

  // Fetch plate options (emirates, types, etc.) on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch("/api/number-plates/options");
        const data = await response.json();
        setOptions(data.data);
      } catch (error) {
        console.error("Error fetching plate options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmitValuation = async (formData: any) => {
    // Prevent double submission
    if (isSubmitting) return;

    // Check if user is authenticated
    if (!isAuthenticated || !token) {
      alert(t("common.login_required") || "Please log in first");
      router.push(`/${locale}/login`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/number-plates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Dubai ${formData.plate_code} ${formData.plate_digits}`,
          contact_number: "0501234567",
          emirate: "dubai",
          plate_type: "private_car",
          plate_code: formData.plate_code,
          plate_digits: formData.plate_digits,
          plate_design: "new",
          price: 0,
          description: "Certificate valuation request.",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      if (result.data?.number_plate?.id) {
        router.push(`/${locale}/valuation/${result.data.number_plate.id}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Submission failed:", error);
      alert(
        error.message || t("common.error_submission") || "An error occurred",
      );
    } finally {
      setIsSubmitting(false);
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
              isLoading={isSubmitting}
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
