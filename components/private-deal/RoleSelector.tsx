"use client";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui"; // ✅ استيراد الـ Button

interface RoleSelectorProps {
  role: "seller" | "buyer" | null;
  setRole: (role: "seller" | "buyer") => void;
}

export default function RoleSelector({ role, setRole }: RoleSelectorProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-8">
      {/* Card Title */}
      <h2
        className={`text-2xl font-serif font-bold text-[#041443] mb-1 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.card_title")}
      </h2>
      <p
        className={`text-gray-500 text-sm mb-8 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.card_subtitle")}
      </p>

      {/* Role Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {/* Seller Option */}
        <div
          onClick={() => setRole("seller")}
          className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 border-[1.5px] shadow-sm ${
            role === "seller"
              ? "border-[#0A3B9E] bg-[#0A3B9E]/5 ring-1 ring-[#0A3B9E]"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div
            className={`flex items-center gap-3 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={role === "seller" ? "#0A3B9E" : "#041443"}
              strokeWidth="2"
            >
              <path d="M3 21h18" />
              <path d="M9 8h1" />
              <path d="M9 12h1" />
              <path d="M9 16h1" />
              <path d="M14 8h1" />
              <path d="M14 12h1" />
              <path d="M14 16h1" />
              <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            </svg>
            <span className="font-semibold text-base">
              {t("private-deal.role_seller_title")}
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed text-left">
            {t("private-deal.role_seller_desc")}
          </p>
        </div>

        {/* Buyer Option */}
        <div
          onClick={() => setRole("buyer")}
          className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 border-[1.5px] shadow-sm ${
            role === "buyer"
              ? "border-[#0A3B9E] bg-[#0A3B9E]/5 ring-1 ring-[#0A3B9E]"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div
            className={`flex items-center gap-3 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={role === "buyer" ? "#0A3B9E" : "#041443"}
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="font-semibold text-base">
              {t("private-deal.role_buyer_title")}
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed text-left">
            {t("private-deal.role_buyer_desc")}
          </p>
        </div>
      </div>

      <div
        className={`flex justify-between items-center border-t pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1 text-gray-400 hover:text-gray-600 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={isRTL ? "rotate-180" : ""}
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t("private-deal.back")}
        </Button>

        {/* Continue Button */}
        <Button variant="primary" size="lg" className="flex items-center gap-2">
          {t("private-deal.continue")}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={isRTL ? "rotate-180" : ""}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
