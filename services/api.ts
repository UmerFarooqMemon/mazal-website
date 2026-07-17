// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://admin.mazal.cloud/api";

// ----- Response Types -----

export interface PlateOptionsResponse {
  data: {
    emirates: {
      key: string;
      label: string;
      selection_mode?: "variants" | "types";
      variants?: {
        key: string;
        label: string;
        plate_type: string;
        plate_design: string;
        has_code: boolean;
        preview?: { url: string; width: number; height: number };
      }[];
      types?: { key: string; label: string }[];
      plate_designs?: { key: string; label: string }[];
    }[];
    plate_codes: { key: string; label: string }[];
  };
}

export interface NumberPlateSubmitResponse {
  data: {
    number_plate: {
      id: string;
      title: string;
      emirate: string;
      plate_type: string;
      plate_code: string;
      plate_digits: string;
      plate_design: string;
      price: number;
      description: string;
      status: string;
      created_at: string;
    };
  };
}

export interface NumberPlate {
  id: string;
  title: string;
  contact_number: string;
  emirate: string;
  plate_type: string;
  plate_code: string;
  plate_digits: string;
  plate_design: string;
  price: number;
  description: string;
  status: string;
  valuation_certificate_url?: string;
  certificate_number?: string;
  created_at: string;
  updated_at: string;
}

export interface NumberPlatesListResponse {
  data: NumberPlate[];
}

export interface NumberPlateDetailResponse {
  data: NumberPlate;
}

export interface PreviewTemplateResponse {
  data: {
    id: string;
    emirate: string;
    plate_type: string;
    plate_design: string;
    background_image: {
      url: string;
      width: number;
      height: number;
    };
    overlay_positions: {
      code?: { x: number; y: number; width: number; height: number };
      digits?: { x: number; y: number; width: number; height: number };
    };
  };
}

export interface PreviewsListResponse {
  data: PreviewTemplateResponse["data"][];
}

// Certificate Verification (public)
export interface CertificateVerifyCertificate {
  certificate_number: string;
  is_valid?: boolean;
  is_expired?: boolean;
  issued_at?: string;
  valid_until?: string;
  expires_at?: string;
  display_plate?: string;
  emirate?: string;
  emirate_label?: string;
  plate_type?: string;
  plate_type_label?: string;
  plate_variant?: string;
  plate_design?: string;
  plate_code?: string;
  plate_digits?: string;
  valued_amount?: string | number;
  assessed_value?: number;
  fair_market_low?: string | number;
  fair_market_high?: string | number;
  certificate_purpose?: string;
  holder_name?: string;
  /** Legacy nested plate shape (older API) */
  plate?: {
    emirate?: string;
    plate_type?: string;
    plate_code?: string;
    plate_digits?: string;
    plate_design?: string;
  };
  valid?: boolean;
  status?: string;
}

export interface CertificateVerifyResponse {
  status?: boolean;
  message?: string;
  data: {
    certificate?: CertificateVerifyCertificate;
  } & Partial<CertificateVerifyCertificate>;
}

// ----- Generic API Request Helper -----

export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: string;
    token?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const { method = "GET", body, token, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  // Only set Content-Type for JSON bodies, not FormData
  if (body && typeof body === "string") {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body,
  });

  // Get the response text first
  const text = await response.text();

  // Try to parse as JSON
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    // If not JSON, throw with the text content
    console.error("Response is not JSON:", text);
    throw new Error(
      text || `Server returned ${response.status} ${response.statusText}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `API Error: ${response.status}`,
    );
  }

  return data;
}
