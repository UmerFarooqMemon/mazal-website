"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";

/**
 * PayTabs auction deposit return lands on /marketplace/{listingId}?auction_deposit_return=1.
 * Forward to the auction register flow (or listing detail).
 */
export default function MarketplaceListingRedirectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLocale();
  const listingId = (params?.id as string) || "";

  useEffect(() => {
    if (!listingId) return;

    const isReturn = searchParams.get("auction_deposit_return") === "1";
    if (isReturn) {
      const failed = searchParams.get("paytabs_failed");
      const qs = new URLSearchParams({ auction_deposit_return: "1" });
      if (failed) qs.set("paytabs_failed", failed);
      router.replace(
        `/${locale}/auctions/${listingId}/register?${qs.toString()}`,
      );
      return;
    }

    router.replace(`/${locale}/listings/${listingId}`);
  }, [listingId, locale, router, searchParams]);

  return null;
}
