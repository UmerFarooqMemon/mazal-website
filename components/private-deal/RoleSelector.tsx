"use client";

import { Building2, User, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";
import toast from "react-hot-toast";

interface RoleSelectorProps {
  role: "seller" | "buyer" | null;
  setRole: (role: "seller" | "buyer") => void;
  onContinue: () => void;
  onBack?: () => void;
}

export default function RoleSelector({
  role,
  setRole,
  onContinue,
  onBack,
}: RoleSelectorProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleContinue = () => {
    if (!role) {
      toast.error(t("private-deal.select_role_error"));
      return;
    }
    onContinue();
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#d9dee6] shadow-[0_30px_60px_-25px_rgba(1,15,81,0.35)] p-8 md:p-10">
      <h2
        className={`text-2xl font-serif text-[#081123] tracking-tight mb-1 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.card_title")}
      </h2>
      <p
        className={`text-[#545e6f] text-sm mb-6 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.card_subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setRole("seller")}
          className={`text-start p-5 rounded-2xl border transition-all duration-200 ${
            role === "seller"
              ? "border-[#0a2f94] bg-[rgba(10,47,148,0.05)] shadow-[0_1px_2px_rgba(1,15,81,0.08),0_8px_24px_-12px_rgba(1,15,81,0.15)]"
              : "border-[#d9dee6] bg-white hover:border-gray-300"
          } ${isRTL ? "text-right" : "text-left"}`}
        >
          <div
            className={`flex items-center gap-3 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Building2
              className={`w-5 h-5 ${role === "seller" ? "text-[#0a2f94]" : "text-[#081123]"}`}
            />
            <span className="font-serif text-lg text-[#081123]">
              {t("private-deal.role_seller_title")}
            </span>
          </div>
          <p className="text-sm text-[#545e6f] leading-relaxed">
            {t("private-deal.role_seller_desc")}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRole("buyer")}
          className={`text-start p-5 rounded-2xl border transition-all duration-200 ${
            role === "buyer"
              ? "border-[#0a2f94] bg-[rgba(10,47,148,0.05)] shadow-[0_1px_2px_rgba(1,15,81,0.08),0_8px_24px_-12px_rgba(1,15,81,0.15)]"
              : "border-[#d9dee6] bg-white hover:border-gray-300"
          } ${isRTL ? "text-right" : "text-left"}`}
        >
          <div
            className={`flex items-center gap-3 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <User
              className={`w-5 h-5 ${role === "buyer" ? "text-[#0a2f94]" : "text-[#081123]"}`}
            />
            <span className="font-serif text-lg text-[#081123]">
              {t("private-deal.role_buyer_title")}
            </span>
          </div>
          <p className="text-sm text-[#545e6f] leading-relaxed">
            {t("private-deal.role_buyer_desc")}
          </p>
        </button>
      </div>

      <div
        className={`flex items-center justify-between border-t border-[#d9dee6] pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
          className="opacity-70"
        >
          {t("private-deal.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("private-deal.continue")}
        </Button>
      </div>
    </div>
  );
}
