"use client";

import { useLocale } from "@/context/LocaleContext";
import CreateListingWizard from "@/components/listings/create/CreateListingWizard";

/** Figma — Portfolio Management · List for sale (Featured Listing) */
export default function PortfolioListForSalePage() {
  const { locale } = useLocale();

  return (
    <CreateListingWizard
      backHref={`/${locale}/portfolio`}
      successHref={`/${locale}/portfolio`}
      initialStep={2}
      initialData={{
        emirate: "dubai",
        code: "AA",
        digits: "777",
        price: "68000",
        boostTier: "silver",
      }}
    />
  );
}
