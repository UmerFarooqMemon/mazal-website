"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FolderPlus, Layers, LineChart, ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import PortfolioPlateForm from "@/components/portfolio/PortfolioPlateForm";
import CertificatesRequestSkeleton from "@/components/skeletons/dashboard/valuation-certificates/CertificatesRequestSkeleton";

interface PortfolioAddPlateFormProps {
  onSuccess?: () => void;
}

export default function PortfolioAddPlateForm({
  onSuccess,
}: PortfolioAddPlateFormProps) {
  const router = useRouter();
  const { t, locale, loading: localeLoading } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, loading: themeLoading } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<any>(null);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    fetch(`/api/number-plates/options?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => setOptions(data.data))
      .catch(console.error);
  }, [locale]);

  const handleSubmit = async (formData: any) => {
    if (isSubmitting) return;
    if (!isAuthenticated || !token) {
      toast.error(t("common.login_required"));
      router.push(`/${locale}/login`);
      return;
    }

    if (!formData.mulkiya_image || !(formData.mulkiya_image instanceof File)) {
      toast.error(t("portfolio.add_plate_mulkiya_required"));
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

      toast.success(t("portfolio.add_plate_success"));
      onSuccess?.();
      router.push(`/${locale}/portfolio/plate/list`);
    } catch (error: any) {
      toast.error(error.message || t("common.error_submission"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (themeLoading || localeLoading) {
    return <CertificatesRequestSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div
        className={`hidden lg:flex flex-col justify-center ${isRTL ? "lg:order-2 items-end text-right" : "lg:order-1 items-start text-left"}`}
      >
        <span
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: getColor("primary") }}
        >
          {t("portfolio.add_plate_eyebrow")}
        </span>
        <h2
          className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6"
          style={{ color: getColor("primaryText") }}
        >
          {t("portfolio.add_plate_hero_title")}
        </h2>
        <p
          className="text-base leading-relaxed mb-8 max-w-md"
          style={{ color: getColor("secondaryText") }}
        >
          {t("portfolio.add_plate_hero_desc")}
        </p>
        <ul
          className="space-y-3 text-sm"
          style={{ color: getColor("secondaryText") }}
        >
          <li
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <FolderPlus
              className="w-5 h-5 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <span>{t("portfolio.add_plate_feature_1")}</span>
          </li>
          <li
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <LineChart
              className="w-5 h-5 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <span>{t("portfolio.add_plate_feature_2")}</span>
          </li>
          <li
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Layers
              className="w-5 h-5 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <span>{t("portfolio.add_plate_feature_3")}</span>
          </li>
          <li
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <ShieldCheck
              className="w-5 h-5 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <span>{t("portfolio.add_plate_feature_4")}</span>
          </li>
        </ul>
      </div>

      <div className={`${isRTL ? "lg:order-1" : "lg:order-2"} lg:col-span-1`}>
        <PortfolioPlateForm
          emirates={options?.emirates || []}
          types={options?.plate_types || []}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
