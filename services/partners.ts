import { apiRequest } from "./api";

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string | null;
  sort_order: number;
}

export interface PartnersListResponse {
  status: boolean;
  message: string;
  data: {
    partners: Partner[];
  };
}

/** Server / direct backend call (public API token). */
export async function getPartners(): Promise<PartnersListResponse> {
  return apiRequest<PartnersListResponse>("/v1/partners");
}

/** Client-side fetch via Next.js proxy (avoids CORS). */
export async function fetchPartnersClient(): Promise<Partner[]> {
  const response = await fetch("/api/partners", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Request failed.");
  }

  return payload?.data?.partners ?? [];
}
