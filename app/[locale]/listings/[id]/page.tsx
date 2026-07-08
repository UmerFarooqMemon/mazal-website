"use client";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import PlateHero from "../../../../components/listings/PlateHero";
import ListingSidebar from "../../../../components/listings/ListingSidebar";
import SimilarPlates from "../../../../components/listings/SimilarPlates";

export default function ListingDetailPage() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  // Static data for demonstration (usually fetched from API)
  const emirate = "Dubai";
  const type = "Direct";

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
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb Navigation */}
        <div
          className={`flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Link
            href={`/${locale}/marketplace`}
            className="hover:text-[#0A3B9E]"
          >
            {t("listings.breadcrumb_marketplace")}
          </Link>
          <span>/</span>
          <span>{getEmirateTranslation(emirate)}</span>
          <span>/</span>
          <span className="text-gray-600">{getTypeTranslation(type)}</span>
        </div>

        {/* Main Content Grid - Reversed for RTL */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-5 gap-10 ${isRTL ? "rtl-grid" : ""}`}
        >
          {/* Left: Plate details (3 columns) */}
          <div
            className={`lg:col-span-3 space-y-8 ${isRTL ? "lg:col-start-3 lg:row-start-1" : "lg:col-start-1 lg:row-start-1"}`}
          >
            <PlateHero />

            {/* Description Section */}
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-lg font-serif font-bold text-[#041443] mb-2">
                {t("listings.description_title")}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                {t("listings.description_text")}
              </p>
            </div>
          </div>

          {/* Right: Price and buttons (2 columns) */}
          <div
            className={`lg:col-span-2 ${isRTL ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-4 lg:row-start-1"}`}
          >
            <ListingSidebar emirate={emirate} type={type} />
          </div>
        </div>

        {/* Similar plates (bottom of page) */}
        <SimilarPlates />
      </div>
    </div>
  );
}
