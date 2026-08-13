import { normalizeAcceptLanguage } from "@/lib/api-config";

export interface ProductsApiResponse<T> {
  status?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface GiftProduct {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  price: string;
  currency: string;
  floral_theme?: string | null;
  flowers?: string | null;
  description?: string | null;
  sort_order?: number;
}

export interface GiftProductRecipient {
  name: string;
  phone: string;
  address: string;
  notes?: string | null;
}

export interface GiftProductSnapshot {
  product_id: number;
  name: string;
  name_ar?: string;
  name_zh?: string;
  name_ru?: string;
  slug: string;
  price: string;
  currency: string;
  floral_theme?: string | null;
  flowers?: string | null;
}

export interface GiftProductSelection {
  product_id: number;
  amount: string;
  snapshot?: GiftProductSnapshot | null;
  recipient?: GiftProductRecipient | null;
}

export interface SelectGiftProductPayload {
  product_id: number;
  gift_recipient_name: string;
  gift_recipient_phone: string;
  gift_recipient_address: string;
  gift_recipient_notes?: string;
}

export interface RemoveGiftProductPayload {
  product_id: null;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function formatProductsError(payload: {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}) {
  if (payload.errors) {
    const details = Object.entries(payload.errors)
      .flatMap(([field, messages]) =>
        messages.map((message) => `${field}: ${message}`),
      )
      .join("; ");
    if (details) {
      return `${payload.message || "Validation failed."} (${details})`;
    }
  }

  return payload.message || payload.error || "Request failed.";
}

async function productsRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: BodyInit | null;
    locale?: string;
    auth?: "required" | "optional";
  } = {},
): Promise<ProductsApiResponse<T>> {
  const authMode = options.auth ?? "optional";
  const token = getToken();

  if (authMode === "required" && !token) {
    throw new Error("Please login to continue.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  headers["Accept-Language"] = normalizeAcceptLanguage(options.locale);

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`/api/products${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  const responseType = response.headers.get("content-type") || "";
  if (!responseType.includes("application/json")) {
    throw new Error("Unexpected response from server.");
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(formatProductsError(payload));
  }

  return payload;
}

export function getProducts(locale: string) {
  return productsRequest<{ products: GiftProduct[] }>("", { locale });
}

export function getProduct(id: string | number, locale: string) {
  return productsRequest<{ product: GiftProduct }>(`/${id}`, { locale });
}

export function buildSelectGiftProductPayload(input: {
  productId: number;
  name: string;
  phone: string;
  address: string;
  notes?: string;
}): SelectGiftProductPayload {
  const payload: SelectGiftProductPayload = {
    product_id: input.productId,
    gift_recipient_name: input.name.trim(),
    gift_recipient_phone: input.phone.trim(),
    gift_recipient_address: input.address.trim(),
  };

  const notes = input.notes?.trim();
  if (notes) {
    payload.gift_recipient_notes = notes;
  }

  return payload;
}

export function buildRemoveGiftProductPayload(): RemoveGiftProductPayload {
  return { product_id: null };
}
