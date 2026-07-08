"use client";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import Stepper from "@/components/private-deal/Stepper";
import RoleSelector from "@/components/private-deal/RoleSelector";
import DealSummary from "@/components/private-deal/DealSummary";
import EscrowBenefits from "@/components/private-deal/EscrowBenefits";

export default function PrivateDealPage() {
  const { t, locale } = useLocale();
  const [role, setRole] = useState<"seller" | "buyer" | null>(null);
  const isRTL = locale === "ar";

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* === Top Title Section === */}
        <div
          className={`max-w-3xl mb-10 ${isRTL ? "mr-0 ml-auto text-right" : "ml-0 mr-auto text-left"}`}
        >
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-blue-50 text-[#0A3B9E] text-[10px] font-bold px-3 py-1 rounded-full mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {t("private-deal.badge")}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#041443] leading-tight mb-4">
            {t("private-deal.title")}
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-lg leading-relaxed">
            {t("private-deal.description")}
          </p>
        </div>

        {/* === Stepper === */}
        <Stepper />

        {/* === Main Content Grid === */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRTL ? "direction-rtl" : ""}`}
        >
          {/* Main Card - Role Selector */}
          <div className="lg:col-span-2">
            <RoleSelector role={role} setRole={setRole} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <DealSummary role={role} />
            <EscrowBenefits />
          </div>
        </div>
      </div>
    </div>
  );
}
