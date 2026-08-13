import type { Locale } from "@/lib/locale";
export type { Locale };

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
import enPartners from "@/config/translations/en/partners.json";
import enWallet from "@/config/translations/en/wallet.json";
import enNotifications from "@/config/translations/en/notifications.json";
import enProfile from "@/config/translations/en/profile.json";

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
import arPartners from "@/config/translations/ar/partners.json";
import arWallet from "@/config/translations/ar/wallet.json";
import arNotifications from "@/config/translations/ar/notifications.json";
import arProfile from "@/config/translations/ar/profile.json";

import zhCommon from "@/config/translations/zh/common.json";
import zhAuth from "@/config/translations/zh/auth.json";
import zhMarketplace from "@/config/translations/zh/marketplace.json";
import zhHome from "@/config/translations/zh/home.json";
import zhAuctions from "@/config/translations/zh/auctions.json";
import zhDashboard from "@/config/translations/zh/dashboard.json";
import zhListings from "@/config/translations/zh/listings.json";
import zhPrivateDeal from "@/config/translations/zh/private-deal.json";
import zhOffer from "@/config/translations/zh/offer.json";
import zhAbout from "@/config/translations/zh/about.json";
import zhCertificates from "@/config/translations/zh/certificates.json";
import zhValuation from "@/config/translations/zh/valuation.json";
import zhPortfolio from "@/config/translations/zh/portfolio.json";
import zhKyc from "@/config/translations/zh/kyc.json";
import zhPartners from "@/config/translations/zh/partners.json";
import zhWallet from "@/config/translations/zh/wallet.json";
import zhNotifications from "@/config/translations/zh/notifications.json";
import zhProfile from "@/config/translations/zh/profile.json";

import ruCommon from "@/config/translations/ru/common.json";
import ruAuth from "@/config/translations/ru/auth.json";
import ruMarketplace from "@/config/translations/ru/marketplace.json";
import ruHome from "@/config/translations/ru/home.json";
import ruAuctions from "@/config/translations/ru/auctions.json";
import ruDashboard from "@/config/translations/ru/dashboard.json";
import ruListings from "@/config/translations/ru/listings.json";
import ruPrivateDeal from "@/config/translations/ru/private-deal.json";
import ruOffer from "@/config/translations/ru/offer.json";
import ruAbout from "@/config/translations/ru/about.json";
import ruCertificates from "@/config/translations/ru/certificates.json";
import ruValuation from "@/config/translations/ru/valuation.json";
import ruPortfolio from "@/config/translations/ru/portfolio.json";
import ruKyc from "@/config/translations/ru/kyc.json";
import ruPartners from "@/config/translations/ru/partners.json";
import ruWallet from "@/config/translations/ru/wallet.json";
import ruNotifications from "@/config/translations/ru/notifications.json";
import ruProfile from "@/config/translations/ru/profile.json";

const enTranslations = {
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
  partners: enPartners,
  wallet: enWallet,
  notifications: enNotifications,
  profile: enProfile,
};

const translationsMap: Record<Locale, Record<string, unknown>> = {
  en: enTranslations,
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
    partners: arPartners,
    wallet: arWallet,
    notifications: arNotifications,
    profile: arProfile,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    marketplace: zhMarketplace,
    home: zhHome,
    auctions: zhAuctions,
    dashboard: zhDashboard,
    listings: zhListings,
    "private-deal": zhPrivateDeal,
    offer: zhOffer,
    about: zhAbout,
    certificates: zhCertificates,
    valuation: zhValuation,
    portfolio: zhPortfolio,
    kyc: zhKyc,
    partners: zhPartners,
    wallet: zhWallet,
    notifications: zhNotifications,
    profile: zhProfile,
  },
  ru: {
    common: ruCommon,
    auth: ruAuth,
    marketplace: ruMarketplace,
    home: ruHome,
    auctions: ruAuctions,
    dashboard: ruDashboard,
    listings: ruListings,
    "private-deal": ruPrivateDeal,
    offer: ruOffer,
    about: ruAbout,
    certificates: ruCertificates,
    valuation: ruValuation,
    portfolio: ruPortfolio,
    kyc: ruKyc,
    partners: ruPartners,
    wallet: ruWallet,
    notifications: ruNotifications,
    profile: ruProfile,
  },
};

export function loadEnglishTranslations() {
  return enTranslations;
}

// A synchronous function for loading subtitles
export function loadAllTranslations(locale: Locale) {
  return translationsMap[locale] || translationsMap.en;
}
