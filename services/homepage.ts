import { apiRequest } from "./api";
import { normalizeAcceptLanguage } from "@/lib/api-config";

export type HomepageStats = {
  currency: string;
  plates_transacted: {
    amount: string;
    display: string;
    label: string;
  };
  verified_bidders: {
    count: number;
    display: string;
    label: string;
  };
  live_auction: {
    is_live: boolean;
    trades_count: number;
    trades_display: string;
    plates_count: number;
    plates_display: string;
    total_value: string;
    total_value_display: string;
    label_auctioning: string;
    label_value: string;
  };
};

export type HomepageStatsResponse = {
  status: boolean;
  message: string;
  data: HomepageStats;
};

/** Server / direct backend call (public API token). */
export async function getHomepageStats(
  locale?: string,
): Promise<HomepageStatsResponse> {
  return apiRequest<HomepageStatsResponse>("/v1/homepage/stats", { locale });
}

/** Client-side fetch via Next.js proxy (avoids CORS). */
export async function fetchHomepageStatsClient(
  locale?: string,
): Promise<HomepageStats> {
  const response = await fetch("/api/homepage/stats", {
    headers: {
      Accept: "application/json",
      ...(locale
        ? { "Accept-Language": normalizeAcceptLanguage(locale) }
        : {}),
    },
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Request failed.");
  }

  return payload.data;
}
