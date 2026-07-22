export type Locale = "en" | "ar";

import enCommon from "@/config/translations/en/common.json";
import enAuth from "@/config/translations/en/auth.json";
import enMarketplace from "@/config/translations/en/marketplace.json";
import enHome from "@/config/translations/en/home.json";
import enAuctions from "@/config/translations/en/auctions.json";
import enDashboard from "@/config/translations/en/dashboard.json";
import enListings from "@/config/translations/en/listings.json";
import enPrivateDeal from "@/config/translations/en/private-deal.json";
import enOffer from "@/config/translations/en/offer.json";
import enAbout from "@/config/translations/en/about.json";
import enCertificates from "@/config/translations/en/certificates.json";
import enValuation from "@/config/translations/en/valuation.json";
import enPortfolio from "@/config/translations/en/portfolio.json";
import enKyc from "@/config/translations/en/kyc.json";

import arCommon from "@/config/translations/ar/common.json";
import arAuth from "@/config/translations/ar/auth.json";
import arMarketplace from "@/config/translations/ar/marketplace.json";
import arHome from "@/config/translations/ar/home.json";
import arAuctions from "@/config/translations/ar/auctions.json";
import arDashboard from "@/config/translations/ar/dashboard.json";
import arListings from "@/config/translations/ar/listings.json";
import arPrivateDeal from "@/config/translations/ar/private-deal.json";
import arOffer from "@/config/translations/ar/offer.json";
import arAbout from "@/config/translations/ar/about.json";
import arCertificates from "@/config/translations/ar/certificates.json";
import arValuation from "@/config/translations/ar/valuation.json";
import arPortfolio from "@/config/translations/ar/portfolio.json";
import arKyc from "@/config/translations/ar/kyc.json";

const translationsMap: Record<Locale, any> = {
  en: {
    common: enCommon,
    auth: enAuth,
    marketplace: enMarketplace,
    home: enHome,
    auctions: enAuctions,
    dashboard: enDashboard,
    listings: enListings,
    "private-deal": enPrivateDeal,
    offer: enOffer,
    about: enAbout,
    certificates: enCertificates,
    valuation: enValuation,
    portfolio: enPortfolio,
    kyc: enKyc,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    marketplace: arMarketplace,
    home: arHome,
    auctions: arAuctions,
    dashboard: arDashboard,
    listings: arListings,
    "private-deal": arPrivateDeal,
    offer: arOffer,
    about: arAbout,
    certificates: arCertificates,
    valuation: arValuation,
    portfolio: arPortfolio,
    kyc: arKyc,
  },
};

// A synchronous function for loading subtitles
export function loadAllTranslations(locale: Locale) {
  return translationsMap[locale] || translationsMap.en;
}
