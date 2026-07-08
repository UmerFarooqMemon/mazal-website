"use client";
import { useLocale } from "@/context/LocaleContext";

interface DealSummaryProps {
  role: "seller" | "buyer" | null;
}

export default function DealSummary({ role }: DealSummaryProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
      {/* Summary Title */}
      <div
        className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.summary_title")}
      </div>

      {/* Plate Preview */}
      <div className="bg-[#F3F4F8] border border-gray-200 rounded-lg py-3 px-4 mb-4 flex items-center justify-center gap-2">
        <div className="text-center">
          <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
            DUBAI
          </div>
          <div className="flex items-center gap-1.5 text-xl font-serif font-bold text-[#0A3B9E] leading-none">
            <span>AA</span>
            <span className="text-gray-300 font-light text-sm">|</span>
            <span>777</span>
          </div>
        </div>
      </div>

      {/* Deal Details */}
      <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
        {/* Role */}
        <div
          className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-gray-500">{t("private-deal.role_label")}</span>
          <span className="font-medium text-[#041443]">
            {role
              ? role === "seller"
                ? t("private-deal.seller_label")
                : t("private-deal.buyer_label")
              : "—"}
          </span>
        </div>

        {/* Agreed Price */}
        <div
          className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-gray-500">
            {t("private-deal.agreed_price")}
          </span>
          <span className="font-medium text-[#041443]">AED 450,000</span>
        </div>

        {/* Total Fees */}
        <div
          className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-gray-500">{t("private-deal.total_fees")}</span>
          <span className="font-medium text-[#041443]">AED 36,000</span>
        </div>
      </div>

      {/* Net Amount */}
      <div
        className={`flex justify-between text-base font-bold text-[#041443] ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span>{t("private-deal.you_net")}</span>
        <span>AED 414,000</span>
      </div>
    </div>
  );
}
