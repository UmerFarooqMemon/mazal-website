import {
  apiRequest,
  PlateOptionsResponse,
  NumberPlateSubmitResponse,
  NumberPlatesListResponse,
  NumberPlateDetailResponse,
  PreviewTemplateResponse,
  PreviewsListResponse,
  CertificateVerifyResponse,
} from "./api";

// Get options (now includes Dubai variants)
export async function getPlateOptions(): Promise<PlateOptionsResponse> {
  return apiRequest<PlateOptionsResponse>("/v1/number-plates/options");
}

// Get preview template
export async function getPlatePreview(params: {
  emirate: string;
  plate_type: string;
  plate_design?: string;
}): Promise<PreviewTemplateResponse> {
  const query = new URLSearchParams(params as any).toString();
  return apiRequest<PreviewTemplateResponse>(
    `/v1/number-plates/preview?${query}`,
  );
}

// List all previews
export async function listAllPreviews(): Promise<PreviewsListResponse> {
  return apiRequest<PreviewsListResponse>("/v1/number-plates/previews");
}

// List user's plates
export async function listMyNumberPlates(
  token: string,
): Promise<NumberPlatesListResponse> {
  return apiRequest<NumberPlatesListResponse>("/v1/number-plates", { token });
}

// Submit a plate (now accepts optional plate_variant)
export async function submitNumberPlate(
  data: {
    title: string;
    contact_number: string;
    emirate: string;
    plate_variant?: string; // preferred for Dubai
    plate_type?: string; // legacy
    plate_code?: string;
    plate_digits: string;
    plate_design?: string; // legacy
    price: number;
    description: string;
  },
  token: string,
): Promise<NumberPlateSubmitResponse> {
  return apiRequest<NumberPlateSubmitResponse>("/v1/number-plates", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

// Get single plate
export async function getNumberPlate(
  id: string,
  token: string,
): Promise<NumberPlateDetailResponse> {
  return apiRequest<NumberPlateDetailResponse>(`/v1/number-plates/${id}`, {
    token,
  });
}

// NEW: Public certificate verification (no auth required)
export async function verifyCertificate(
  certificateNumber: string,
): Promise<CertificateVerifyResponse> {
  return apiRequest<CertificateVerifyResponse>(
    `/v1/certificates/verify/${certificateNumber}`,
  );
}
