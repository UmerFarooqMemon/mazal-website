import { normalizeAcceptLanguage } from "@/lib/api-config";

export interface CollectionSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  label: string;
  is_available: boolean;
}

interface CollectionSlotsApiResponse {
  status?: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  data?: {
    collection_slots?: CollectionSlot[];
  };
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function formatError(payload: CollectionSlotsApiResponse) {
  if (payload.errors) {
    const first = Object.values(payload.errors).flat()[0];
    if (first) return first;
  }
  return payload.message || payload.error || "Request failed.";
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getAvailableCollectionSlots(
  locale?: string,
  options?: { from?: string; to?: string; limit?: number },
): Promise<CollectionSlot[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Please login to continue.");
  }

  const query = buildQuery({
    from: options?.from,
    to: options?.to,
    limit: options?.limit,
  });

  const response = await fetch(
    `/api/cash-cheque-collections/available-slots${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Accept-Language": normalizeAcceptLanguage(locale),
      },
    },
  );

  const responseType = response.headers.get("content-type") || "";
  if (!responseType.includes("application/json")) {
    throw new Error("Unexpected response from server.");
  }

  const payload = (await response.json()) as CollectionSlotsApiResponse;
  if (!response.ok || payload.status === false) {
    throw new Error(formatError(payload));
  }

  return (payload.data?.collection_slots || []).filter(
    (slot) => slot.is_available !== false,
  );
}

export function normalizeSlotTime(value: string): string {
  const [hours = "00", minutes = "00"] = value.trim().split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

export function formatSlotClock(value: string): string {
  const normalized = normalizeSlotTime(value);
  const [hoursStr, minutes] = normalized.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

export function collectionSlotDates(slots: CollectionSlot[]): string[] {
  return Array.from(new Set(slots.map((slot) => slot.date))).sort();
}

export function collectionSlotsOnDate(
  slots: CollectionSlot[],
  date: string,
): CollectionSlot[] {
  if (!date) return [];
  return slots.filter((slot) => slot.date === date);
}

export function findCollectionSlot(
  slots: CollectionSlot[],
  date: string,
  time: string,
): CollectionSlot | undefined {
  if (!date || !time) return undefined;
  const selected = normalizeSlotTime(time);
  const daySlots = collectionSlotsOnDate(slots, date);
  const exactStart = daySlots.find(
    (slot) => normalizeSlotTime(slot.start_time) === selected,
  );
  return exactStart;
}
