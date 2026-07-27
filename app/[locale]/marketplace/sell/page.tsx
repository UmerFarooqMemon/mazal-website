"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import CreateListingWizard from "@/components/listings/create/CreateListingWizard";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { getListingDetail } from "@/services/marketplace";

/**
 * PayTabs listing-plan return lands on /marketplace/sell?listing_id=&listing_plan_return=1
 * Also used as the sell / create listing entry point.
 */
export default function MarketplaceSellPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    const isReturn = searchParams.get("listing_plan_return") === "1";
    if (!isReturn) return;

    const listingId = searchParams.get("listing_id");
    const failed = searchParams.get("paytabs_failed") === "1";

    if (failed) {
      toast.error(
        t("listings.paytabs_failed") ||
          "Payment was not completed. Please try again from My Listings.",
      );
      router.replace(`/${locale}/marketplace/sell`);
      return;
    }

    if (!listingId) {
      router.replace(`/${locale}/marketplace`);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    setPolling(true);

    const poll = async () => {
      try {
        const response = await getListingDetail(listingId, locale);
        if (cancelled) return;
        const listing = response.data.listing;

        if (
          listing.status === "pending_approval" ||
          listing.plan_payment_status === "paid" ||
          !listing.needs_plan_payment
        ) {
          setPolling(false);
          toast.success(
            t("listings.plan_payment_success") ||
              "Listing plan paid. Your listing is awaiting admin approval.",
          );
          router.replace(`/${locale}/marketplace`);
          return;
        }
      } catch {
        // keep polling
      }

      attempts += 1;
      if (attempts >= 20) {
        if (!cancelled) {
          setPolling(false);
          toast(
            t("listings.plan_payment_pending") ||
              "Payment received. Approval status is still updating — check My Listings shortly.",
          );
          router.replace(`/${locale}/marketplace`);
        }
        return;
      }

      if (!cancelled) {
        window.setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [locale, router, searchParams, t]);

  if (polling) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: getColor("background") }}
      >
        <p style={{ color: getColor("mutedText") }}>
          {t("listings.verifying_payment") ||
            "Verifying listing plan payment…"}
        </p>
      </div>
    );
  }

  return <CreateListingWizard />;
}
