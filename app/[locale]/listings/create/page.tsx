"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { apiRequest, NumberPlateSubmitResponse } from "@/services/api";
import { Button } from "@/components/ui";
import FeatureCard from "@/components/listings/FeatureCard";

// SVG Icons
const CashIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 8h20" />
  </svg>
);

const CertIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const MarketIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function CreateListingPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const [formData, setFormData] = useState({
    plate_code: "",
    plate_digits: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitValuation = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const body = {
        title: `Dubai ${formData.plate_code} ${formData.plate_digits}`,
        contact_number: "0501234567",
        emirate: "dubai",
        plate_type: "private_car",
        plate_code: formData.plate_code,
        plate_digits: formData.plate_digits,
        plate_design: "new",
        price: 0,
        description: "Valuation request from marketplace.",
      };

      const response = await apiRequest<NumberPlateSubmitResponse>(
        "/api/v1/number-plates",
        {
          method: "POST",
          body: JSON.stringify(body),
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

  const cards = [
    {
      variant: "primary" as const,
      icon: <CashIcon />,
      title: t("listings.spot_cash_title"),
      subtitle: t("listings.spot_cash_subtitle"),
      description: t("listings.spot_cash_desc"),
      buttonText: t("listings.get_cash_offer"),
      onClick: () => console.log("Cash offer clicked"),
      features: [
        t("listings.feature_manual"),
        t("listings.feature_app"),
        t("listings.feature_paid"),
      ],
    },
    {
      variant: "outline" as const,
      icon: <CertIcon />,
      title: t("listings.val_cert_title"),
      subtitle: t("listings.val_cert_subtitle"),
      description: t("listings.val_cert_desc"),
      buttonText: t("listings.request_cert"),
      href: "/certificates/request",
    },
    {
      variant: "outline" as const,
      icon: <MarketIcon />,
      title: t("listings.marketplace_title"),
      subtitle: t("listings.marketplace_subtitle"),
      description: t("listings.marketplace_desc"),
      buttonText: t("listings.create_listing"),
      href: "/marketplace",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16 items-start">
          <div
            className={`flex flex-col justify-center ${isRTL ? "lg:order-2 items-end text-right" : "lg:order-1 items-start text-left"}`}
          >
            <span className="text-[#0A3B9E] text-xs font-bold uppercase tracking-wider mb-3">
              {t("listings.three_ways_to_sell")}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#041443] mb-4 leading-tight">
              {t("listings.liquidity_title")}
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-md">
              {t("listings.liquidity_subtitle")}
            </p>
          </div>

          <div
            className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm ${isRTL ? "lg:order-1" : "lg:order-2"}`}
          >
            <div
              className={`text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-4 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("listings.spot_estimator_title")}
            </div>

            <form
              className="space-y-4 mb-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitValuation();
              }}
            >
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
                    value={formData.plate_code}
                    onChange={(e) =>
                      setFormData({ ...formData, plate_code: e.target.value })
                    }
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
                    value={formData.plate_digits}
                    onChange={(e) =>
                      setFormData({ ...formData, plate_digits: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                className={`bg-[#F3F4F8] rounded-xl p-4 flex items-center border border-gray-200 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                  <div className="text-xs text-gray-500">
                    {t("listings.estimated_offer")}
                  </div>
                  <div className="text-2xl font-bold text-[#041443]">
                    AED 610,000
                  </div>
                </div>
                <div className="relative h-16 w-28 shrink-0">
                  <Image
                    src="/plate-empty.png"
                    alt="Plate preview"
                    fill
                    className="object-contain"
                    sizes="112px"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="rounded-full"
                disabled={isLoading}
              >
                {isLoading
                  ? t("common.loading") || "Loading..."
                  : t("listings.get_my_offer")}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Cards */}
        <div
          className={`flex gap-6 flex-col md:flex-row ${isRTL ? "md:flex-row-reverse" : ""} items-stretch`}
        >
          {cards.map((card, index) => (
            <div key={index} className="flex-1 flex">
              <FeatureCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
