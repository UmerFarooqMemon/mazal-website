export const siteConfig = {
  name: "Mazal",
  fullName: "Mazal Plate Marketplace",
  description:
    "The UAE's trust-first marketplace for distinctive vehicle plates. Buy, sell and auction the country's rarest plates with escrow protection.",
  url: "https://mazal.ae",
  ogImage: "https://mazal.ae/og-image.jpg",
  links: {
    twitter: "https://twitter.com/mazal_ae",
    instagram: "https://instagram.com/mazal_ae",
    linkedin: "https://linkedin.com/company/mazal-ae",
  },
  contact: {
    email: "info@mazal.ae",
    phone: "+971 4 123 4567",
    whatsapp: "+971 50 123 4567",
  },
  address: {
    line1: "Dubai Internet City",
    line2: "Building 1, Office 301",
    city: "Dubai",
    country: "United Arab Emirates",
    poBox: "12345",
  },
  locales: ["en", "ar"] as const,
  defaultLocale: "en" as const,
  rtlLocales: ["ar"] as const,
  supportedCurrencies: ["AED"] as const,
  defaultCurrency: "AED" as const,
  platform: {
    escrowFee: "1%",
    platformFee: "4%",
    serviceFee: "3%",
    totalFee: "8%",
  },
  features: {
    escrow: true,
    liveAuctions: true,
    spotCashOffers: true,
    blindNegotiation: true,
    rtaIntegration: true,
  },
  socialProof: {
    totalPlatesTransacted: "AED 2.4B",
    verifiedBidders: "12,400+",
    escrowFee: "1%",
  },
} as const;

export type SiteConfig = typeof siteConfig;

// Helper functions
export function getSiteUrl(locale?: string) {
  if (locale && locale !== siteConfig.defaultLocale) {
    return `${siteConfig.url}/${locale}`;
  }
  return siteConfig.url;
}

export function getLocalizedSiteName(locale: string) {
  const names: Record<string, string> = {
    en: "Mazal - UAE Plate Marketplace",
    ar: "مازال - سوق اللوحات الإماراتية",
  };
  return names[locale] || names.en;
}

export function getLocalizedDescription(locale: string) {
  const descriptions: Record<string, string> = {
    en: "The UAE's trust-first marketplace for distinctive vehicle plates.",
    ar: "السوق الأول الموثوق للوحات المركبات المميزة في الإمارات.",
  };
  return descriptions[locale] || descriptions.en;
}
