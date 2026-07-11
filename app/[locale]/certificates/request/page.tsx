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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<any>(null);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    fetch("/api/number-plates/options")
      .then((r) => r.json())
      .then((data) => setOptions(data.data))
      .catch(console.error);
  }, []);

  const handleSubmitValuation = async (formData: any) => {
    if (isSubmitting) return;
    if (!isAuthenticated || !token) {
      alert(t("common.login_required") || "Please log in first");
      router.push(`/${locale}/login`);
      return;
    }

    if (!formData.mulkiya_image || !(formData.mulkiya_image instanceof File)) {
      alert(
        t("certificates.mulkiya_required") ||
          "Please upload your Mulkiya image.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append(
        "title",
        `Dubai ${formData.plate_code || ""} ${formData.plate_digits}`,
      );
      formDataToSend.append("contact_number", "0501234567");
      formDataToSend.append("emirate", "dubai");
      formDataToSend.append(
        "plate_variant",
        formData.plate_variant || "private_new_colorful",
      );
      if (formData.plate_code) {
        formDataToSend.append("plate_code", formData.plate_code);
      }
      formDataToSend.append("plate_digits", formData.plate_digits);
      formDataToSend.append("price", formData.price || "0");
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append(
        "mulkiya",
        formData.mulkiya_image,
        formData.mulkiya_image.name,
      );

      const response = await fetch("/api/number-plates", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed");
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
        {/* Desktop: Title + Form side by side */}
        {/* Mobile: Only Form (title hidden) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* Features Section - Hidden on Mobile, Shown on Desktop */}
          <div
            className={`hidden lg:flex flex-col justify-center ${isRTL ? "lg:order-2 items-end text-right" : "lg:order-1 items-start text-left"}`}
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

          {/* Form - Full width on mobile, half on desktop */}
          <div
            className={`${isRTL ? "lg:order-1" : "lg:order-2"} lg:col-span-1`}
          >
            {/* Mobile Title - Only shown on mobile */}
            <div className="lg:hidden mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#041443]">
                {t("certificates.certificate_request") || "Certificate Request"}
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                {t("certificates.order_valuation") ||
                  "Order a valuation for your plate"}
              </p>
            </div>

            <CertificateForm
              emirates={options?.emirates || []}
              types={options?.plate_types || []}
              onSubmit={handleSubmitValuation}
              isLoading={isSubmitting}
            />
          </div>
        </div>

        {/* Preview & FAQ - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <CertificatePreview />
          <CertificateFAQ />
        </div>
      </div>
    </div>
  );
}
