"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PlateHero from "../../../../components/listings/PlateHero";
import ListingSidebar from "../../../../components/listings/ListingSidebar";
import SimilarPlates from "../../../../components/listings/SimilarPlates";

export default function ListingDetailPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const params = useParams();
  const listingId = (params?.id as string) || "1";
  const isRTL = locale === "ar";

  const emirate = "Dubai";
  const type = "Direct";

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

  const getTypeTranslation = (typeName: string) => {
    const typeMap: Record<string, string> = {
      Direct: "listings.type_direct",
      Auction: "listings.type_auction",
      Spot: "listings.type_spot",
    };
    return t(typeMap[typeName] || typeName);
  };

  if (themeLoading || localeLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div
          className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ color: getColor("mutedText") }}
        >
          <Link
            href={`/${locale}/marketplace`}
            className="hover:opacity-80 transition-opacity"
            style={{ color: getColor("mutedText") }}
          >
            {t("listings.breadcrumb_marketplace")}
          </Link>
          <span>/</span>
          <span>{getEmirateTranslation(emirate)}</span>
          <span>/</span>
          <span style={{ color: getColor("secondaryText") }}>
            {getTypeTranslation(type)}
          </span>
        </div>

        <div
          className={`grid grid-cols-1 lg:grid-cols-5 gap-10 ${isRTL ? "rtl-grid" : ""}`}
        >
          <div
            className={`lg:col-span-3 space-y-8 ${isRTL ? "lg:col-start-3 lg:row-start-1" : "lg:col-start-1 lg:row-start-1"}`}
          >
            <PlateHero />

            <div className={isRTL ? "text-right" : "text-left"}>
              <h3
                className="text-lg font-serif font-bold mb-2"
                style={{ color: getColor("primaryText") }}
              >
                {t("listings.description_title")}
              </h3>
              <p
                className="text-sm leading-relaxed max-w-2xl"
                style={{ color: getColor("mutedText") }}
              >
                {t("listings.description_text")}
              </p>
            </div>
          </div>

          <div
            className={`lg:col-span-2 ${isRTL ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-4 lg:row-start-1"}`}
          >
            <ListingSidebar
              listingId={listingId}
              emirate={emirate}
              type={type}
            />
          </div>
        </div>

        <SimilarPlates />
      </div>
    </div>
  );
}
