"use client";

import { Gift } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

interface GiftNoPaymentBannerProps {
  className?: string;
}

/** Shown on gift private deals — payment UI is skipped (buyer_payment_required === false). */
export default function GiftNoPaymentBanner({
  className = "",
}: GiftNoPaymentBannerProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  return (
    <div
      className={`rounded-2xl border px-4 py-3 flex items-start gap-3 text-start ${className}`}
      style={{
        backgroundColor: `${getColor("primary")}0D`,
        borderColor: `${getColor("primary")}33`,
      }}
      role="status"
    >
      <Gift
        className="w-5 h-5 shrink-0 mt-0.5"
        style={{ color: getColor("primary") }}
      />
      <div className="min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: getColor("primaryText") }}
        >
          {t("private-deal.gift_banner_title")}
        </p>
        <p
          className="text-sm mt-0.5"
          style={{ color: getColor("secondaryText") }}
        >
          {t("private-deal.gift_banner_desc")}
        </p>
      </div>
    </div>
  );
}
