"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import OfferNegotiation from "@/components/listings/offer/OfferNegotiation";

export default function ListingOfferPage() {
  const { loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();

  if (themeLoading || localeLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  return <OfferNegotiation />;
}
