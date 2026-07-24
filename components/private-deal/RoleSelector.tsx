"use client";

import { Building2, User, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
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
  const { getColor } = useTheme();
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

  const roleCardStyle = (selected: boolean) =>
    selected
      ? {
          borderColor: getColor("primary"),
          backgroundColor: `${getColor("primary")}0D`,
        }
      : {
          borderColor: getColor("border"),
          backgroundColor: getColor("surface"),
        };

  return (
    <div
      className="rounded-[20px] border shadow-[0_30px_60px_-25px_rgba(1,15,81,0.35)] p-8 md:p-10"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h2
        className={`text-2xl font-serif tracking-tight mb-1 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("primaryText") }}
      >
        {t("private-deal.card_title")}
      </h2>
      <p
        className={`text-sm mb-6 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("private-deal.card_subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setRole("seller")}
          className={`text-start p-5 rounded-2xl border transition-all duration-200 ${isRTL ? "text-right" : "text-left"}`}
          style={roleCardStyle(role === "seller")}
        >
          <div
            className={`flex items-center gap-3 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Building2
              className="w-5 h-5"
              style={{
                color:
                  role === "seller"
                    ? getColor("primary")
                    : getColor("primaryText"),
              }}
            />
            <span
              className="font-serif text-lg"
              style={{ color: getColor("primaryText") }}
            >
              {t("private-deal.role_seller_title")}
            </span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: getColor("secondaryText") }}
          >
            {t("private-deal.role_seller_desc")}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRole("buyer")}
          className={`text-start p-5 rounded-2xl border transition-all duration-200 ${isRTL ? "text-right" : "text-left"}`}
          style={roleCardStyle(role === "buyer")}
        >
          <div
            className={`flex items-center gap-3 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <User
              className="w-5 h-5"
              style={{
                color:
                  role === "buyer"
                    ? getColor("primary")
                    : getColor("primaryText"),
              }}
            />
            <span
              className="font-serif text-lg"
              style={{ color: getColor("primaryText") }}
            >
              {t("private-deal.role_buyer_title")}
            </span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: getColor("secondaryText") }}
          >
            {t("private-deal.role_buyer_desc")}
          </p>
        </button>
      </div>

      <div
        className={`flex items-center justify-between border-t pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ borderColor: getColor("border") }}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
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
