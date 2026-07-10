// API Base URL
const API_BASE_URL = "https://admin.mazal.cloud/api";

// Types
export interface PlateOptionsResponse {
  data: {
    emirates: { key: string; label: string }[];
    plate_types: { key: string; label: string }[];
    plate_codes: { key: string; label: string }[];
    plate_designs: { key: string; label: string }[];
    background_image?: {
      url: string;
      width: number;
      height: number;
      overlay_positions?: any;
    };
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

/**
 * Generic API request function.
 * Automatically adds JSON headers and Bearer token if provided.
 * Throws an error with the server's message if the response is not ok.
 */
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

  if (body) {
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

  // Parse the response JSON (even if error)
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Throw the server's error message if available, otherwise generic
    throw new Error(
      data.message || data.error || `API Error: ${response.status}`,
    );
  }

  return data;
}
