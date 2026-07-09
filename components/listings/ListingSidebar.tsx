"use client";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";

interface ListingSidebarProps {
  emirate: string;
  type: string;
}

export default function ListingSidebar({ emirate, type }: ListingSidebarProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  // Helper function to get translated emirate name
  const getEmirateTranslation = (emirateName: string) => {
    const emirateMap: Record<string, string> = {
      Dubai: "listings.emirate_dubai",
      "Abu Dhabi": "listings.emirate_abu_dhabi",
      Sharjah: "listings.emirate_sharjah",
      Ajman: "listings.emirate_ajman",
      "Ras Al Khaimah": "listings.emirate_rak",
    };
    return t(emirateMap[emirateName] || emirateName);
  };

  // Helper function to get translated type
  const getTypeTranslation = (typeName: string) => {
    const typeMap: Record<string, string> = {
      Direct: "listings.type_direct",
      Auction: "listings.type_auction",
      Spot: "listings.type_spot",
    };
    return t(typeMap[typeName] || typeName);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-24">
      {/* Price Section */}
      <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          {t("listings.asking_price")}
        </div>
        <div className="text-5xl font-serif font-bold text-[#041443] mb-2">
          AED 12,500,000
        </div>
        <div className="text-xs text-gray-400">
          {t("listings.fees_breakdown")}
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col gap-3 mb-6">
        {/* ✅ Buy through escrow Button */}
        <Button variant="primary" size="lg" fullWidth className="shadow-md">
          {t("listings.buy_escrow")}
        </Button>

        {/* ✅ Make a blind offer Button */}
        <Button
          variant="outline"
          size="lg"
          fullWidth
          className="border-gray-300 text-gray-700"
        >
          {t("listings.blind_offer")}
        </Button>
      </div>

      {/* Secondary Buttons */}
      <div
        className={`grid grid-cols-2 gap-3 mb-8 ${isRTL ? "direction-rtl" : ""}`}
      >
        {/* ✅ Watchlist Button */}
        <Button
          variant="outline"
          size="md"
          className={`flex items-center justify-center gap-2 border-gray-200 text-gray-600 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {t("listings.watchlist")}
        </Button>

        {/* ✅ Share Button */}
        <Button
          variant="outline"
          size="md"
          className={`flex items-center justify-center gap-2 border-gray-200 text-gray-600 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {t("listings.share")}
        </Button>
      </div>

      {/* Details Table */}
      <div
        className={`border-t border-gray-100 pt-6 space-y-3 ${isRTL ? "text-right" : "text-left"}`}
      >
        <div
          className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-gray-500">{t("listings.emirate")}</span>
          <span className="font-medium text-[#041443]">
            {getEmirateTranslation(emirate)}
          </span>
        </div>
        <div
          className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-gray-500">{t("listings.code")}</span>
          <span className="font-medium text-[#041443]">M</span>
        </div>
        <div
          className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-gray-500">{t("listings.digits")}</span>
          <span className="font-medium text-[#041443]">7 (1-digit)</span>
        </div>
        <div
          className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-gray-500">{t("listings.seller")}</span>
          <span className="font-medium text-[#041443]">Al Marwan</span>
        </div>
        <div
          className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-gray-500">{t("listings.type")}</span>
          <span className="font-medium text-[#041443]">
            {getTypeTranslation(type)}
          </span>
        </div>
      </div>
    </div>
  );
}
