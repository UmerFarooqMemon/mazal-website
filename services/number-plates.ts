import {
  apiRequest,
  PlateOptionsResponse,
  NumberPlateSubmitResponse,
  NumberPlatesListResponse,
  NumberPlateDetailResponse,
  PreviewTemplateResponse,
  PreviewsListResponse,
} from "./api";

// Get options (emirates, types, codes, designs)
export async function getPlateOptions(): Promise<PlateOptionsResponse> {
  return apiRequest<PlateOptionsResponse>("/v1/number-plates/options");
}

// Get preview template by emirate, type, and design
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

// List all preview templates
export async function listAllPreviews(): Promise<PreviewsListResponse> {
  return apiRequest<PreviewsListResponse>("/v1/number-plates/previews");
}

// List user's number plates (authenticated)
export async function listMyNumberPlates(
  token: string,
): Promise<NumberPlatesListResponse> {
  return apiRequest<NumberPlatesListResponse>("/v1/number-plates", { token });
}

// Submit a number plate for valuation (authenticated)
export async function submitNumberPlate(
  data: {
    title: string;
    contact_number: string;
    emirate: string;
    plate_type: string;
    plate_code?: string;
    plate_digits: string;
    plate_design?: string;
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

// Get single number plate by ID (authenticated)
export async function getNumberPlate(
  id: string,
  token: string,
): Promise<NumberPlateDetailResponse> {
  return apiRequest<NumberPlateDetailResponse>(`/v1/number-plates/${id}`, {
    token,
  });
}
