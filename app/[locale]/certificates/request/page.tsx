"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import CertificateForm from "@/components/certificates/CertificateForm";
import CertificatePreview from "@/components/certificates/CertificatePreview";
import CertificateFAQ from "@/components/certificates/CertificateFAQ";
import { BadgeCheck, ShieldCheck, Sparkles, Stamp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function CertificateRequestPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor } = useTheme();
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
      toast.error(t("common.login_required"));
      router.push(`/${locale}/login`);
      return;
    }

    if (!formData.mulkiya_image || !(formData.mulkiya_image instanceof File)) {
      toast.error(t("certificates.mulkiya_required"));
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
      if (formData.plate_code)
        formDataToSend.append("plate_code", formData.plate_code);
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
      toast.error(error.message || t("common.error_submission"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("surface") }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* Features Section - Hidden on Mobile, Shown on Desktop */}
          <div
            className={`hidden lg:flex flex-col justify-center ${isRTL ? "lg:order-2 items-end text-right" : "lg:order-1 items-start text-left"}`}
          >
            <span
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: getColor("primary") }}
            >
              {t("certificates.independent_valuation")}
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6"
              style={{ color: getColor("primaryText") }}
            >
              {t("certificates.hero_title")}
            </h1>
            <p
              className="text-base leading-relaxed mb-8 max-w-md"
              style={{ color: getColor("secondaryText") }}
            >
              {t("certificates.hero_desc")}
            </p>
            <ul
              className="space-y-3 text-sm"
              style={{ color: getColor("secondaryText") }}
            >
              <li
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <BadgeCheck
                  className="w-5 h-5 shrink-0"
                  style={{ color: getColor("primary") }}
                />
                <span>{t("certificates.feature_1")}</span>
              </li>
              <li
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <ShieldCheck
                  className="w-5 h-5 shrink-0"
                  style={{ color: getColor("primary") }}
                />
                <span>{t("certificates.feature_2")}</span>
              </li>
              <li
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Sparkles
                  className="w-5 h-5 shrink-0"
                  style={{ color: getColor("primary") }}
                />
                <span>{t("certificates.feature_3")}</span>
              </li>
              <li
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Stamp
                  className="w-5 h-5 shrink-0"
                  style={{ color: getColor("primary") }}
                />
                <span>{t("certificates.feature_4")}</span>
              </li>
            </ul>
          </div>

          {/* Form - Full width on mobile, half on desktop */}
          <div
            className={`${isRTL ? "lg:order-1" : "lg:order-2"} lg:col-span-1`}
          >
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
