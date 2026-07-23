export interface KycApiResponse<T> {
  status?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export type KycProfileTypeValue = "uae_resident" | "international";
export type KycStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | string;

export interface KycOptionItem {
  key: string;
  label: string;
}

export interface KycOptions {
  profile_types?: KycOptionItem[] | Record<string, string>;
  steps?: KycOptionItem[] | string[];
  emirates_of_residence?: KycOptionItem[] | Record<string, string>;
  document_requirements?: Record<string, unknown>;
  upload_limits?: {
    max_size_kb?: number;
    mimes?: string[];
  };
  [key: string]: unknown;
}

export interface KycApplication {
  id?: number;
  status?: KycStatus;
  profile_type?: KycProfileTypeValue | null;
  full_legal_name?: string | null;
  date_of_birth?: string | null;
  emirates_id?: string | null;
  emirate_of_residence?: string | null;
  passport_number?: string | null;
  country_of_residence?: string | null;
  phone_country_code?: string | null;
  phone?: string | null;
  email?: string | null;
  custody_agreement_accepted?: boolean | null;
  documents?: Array<{
    id?: number;
    type?: string;
    document_type?: string;
    name?: string;
    [key: string]: unknown;
  }> | Record<string, unknown>;
  [key: string]: unknown;
}

export interface KycCurrentResponse {
  kyc: KycApplication | null;
  verified?: boolean;
  kyc_verified?: boolean;
  kyc_verified_at?: string | null;
  kyc_profile_type?: KycProfileTypeValue | null;
}

export interface KycReviewSummary {
  profile?: string;
  verification?: string;
  legal_name?: string;
  custody?: string;
  [key: string]: unknown;
}

export interface KycReviewResponse {
  kyc?: KycApplication | null;
  review?: KycReviewSummary;
  [key: string]: unknown;
}

export interface KycIdentityPayload {
  full_legal_name: string;
  date_of_birth: string;
  phone_country_code: string;
  phone: string;
  email: string;
  emirates_id?: string;
  emirate_of_residence?: string;
  passport_number?: string;
  country_of_residence?: string;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function formatKycError(payload: {
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

export function firstFieldErrors(
  errors?: Record<string, string[]>,
): Record<string, string> {
  if (!errors) return {};
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      messages[0] || "Invalid value",
    ]),
  );
}

async function kycRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: BodyInit | null;
    locale?: string;
    contentType?: string | null;
  } = {},
): Promise<KycApiResponse<T>> {
  const token = getToken();
  if (!token) {
    throw new Error("Please login to continue.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  if (options.locale) {
    headers["Accept-Language"] = options.locale;
  }

  if (options.contentType) {
    headers["Content-Type"] = options.contentType;
  }

  const response = await fetch(`/api/kyc${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  const responseType = response.headers.get("content-type") || "";
  if (!responseType.includes("application/json")) {
    if (!response.ok) {
      throw new Error("Unexpected response from server.");
    }
    throw new Error("Unexpected response from server.");
  }

  const payload = await response.json();
  if (!response.ok || payload.status === false) {
    const error = new Error(formatKycError(payload)) as Error & {
      fieldErrors?: Record<string, string>;
      payload?: unknown;
    };
    error.fieldErrors = firstFieldErrors(payload.errors);
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function getKycOptions(locale?: string) {
  return kycRequest<KycOptions>("/options", { locale });
}

export function getCurrentKyc(locale?: string) {
  return kycRequest<KycCurrentResponse>("", { locale });
}

export function saveKycProfile(
  profileType: KycProfileTypeValue,
  locale?: string,
) {
  return kycRequest<{ kyc?: KycApplication }>("/profile", {
    method: "POST",
    locale,
    contentType: "application/json",
    body: JSON.stringify({ profile_type: profileType }),
  });
}

export function saveKycIdentity(payload: KycIdentityPayload, locale?: string) {
  return kycRequest<{ kyc?: KycApplication }>("/identity", {
    method: "PUT",
    locale,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

export function uploadKycDocuments(formData: FormData, locale?: string) {
  return kycRequest<{ kyc?: KycApplication }>("/documents", {
    method: "POST",
    locale,
    body: formData,
  });
}

export function getKycReview(locale?: string) {
  return kycRequest<KycReviewResponse>("/review", { locale });
}

export function submitKyc(locale?: string) {
  return kycRequest<{ kyc?: KycApplication }>("/submit", {
    method: "POST",
    locale,
  });
}

export function resetKyc(locale?: string) {
  return kycRequest<{ kyc?: null }>("", {
    method: "DELETE",
    locale,
  });
}

export async function downloadKycDocument(
  documentId: string | number,
  locale?: string,
) {
  const token = getToken();
  if (!token) {
    throw new Error("Please login to continue.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "*/*",
  };

  if (locale) {
    headers["Accept-Language"] = locale;
  }

  const response = await fetch(`/api/kyc/documents/${documentId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const responseType = response.headers.get("content-type") || "";
    if (responseType.includes("application/json")) {
      const payload = await response.json();
      throw new Error(formatKycError(payload));
    }
    throw new Error("Failed to download document.");
  }

  return response.blob();
}

export function normalizeOptionList(
  value?: KycOptionItem[] | Record<string, string> | string[] | null,
): KycOptionItem[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") {
        return { key: item, label: item };
      }
      return {
        key: String(item.key),
        label: String(item.label ?? item.key),
      };
    });
  }

  return Object.entries(value).map(([key, label]) => ({
    key,
    label: String(label),
  }));
}
