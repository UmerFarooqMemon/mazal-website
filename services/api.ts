const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    return isLocalhost
      ? process.env.NEXT_PUBLIC_API_URL || "http://mazal-backend.test"
      : process.env.NEXT_PUBLIC_API_URL || "https://admin.mazal.cloud/api";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://mazal-backend.test";
};

const API_BASE_URL = getBaseUrl();

// Mock Data - so the website works until you start the server
const MOCK_OPTIONS = {
  data: {
    emirates: [
      { key: "dubai", label: "Dubai" },
      { key: "abu_dhabi", label: "Abu Dhabi" },
      { key: "sharjah", label: "Sharjah" },
      { key: "ajman", label: "Ajman" },
      { key: "rak", label: "RAK" },
    ],
    plate_types: [
      { key: "private_car", label: "Private Car" },
      { key: "classic_car", label: "Classic Car" },
      { key: "motorcycle", label: "Motorcycle" },
    ],
    plate_designs: [{ key: "new", label: "New" }],
    preview_background: { url: "" },
  },
};

const MOCK_SUBMIT_RESPONSE = {
  data: {
    number_plate: {
      id: "mock-id-" + Date.now(),
      title: "Mock Plate Submission",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  },
};

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  // If you're in Development and don't want to run the server, restore the fake data.
  if (process.env.NODE_ENV === "development") {
    console.warn("[DEV] Using Mock Data for API:", endpoint);

    if (endpoint === "/api/v1/number-plates/options") {
      return MOCK_OPTIONS as T;
    }
    if (endpoint === "/api/v1/number-plates") {
      return MOCK_SUBMIT_RESPONSE as T;
    }
  }

  // Setting up the order headers
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  try {
    // Attempting to connect to the server (if the server is running, this will work)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = "Something went wrong";
      try {
        const error = await response.json();
        if (error.message) errorMessage = error.message;
      } catch {
        errorMessage = response.statusText || `Error ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // If an error occurs in the Fetch, we throw a clear error
    console.error("API Request Error:", error);
    throw new Error(
      "Network error: Unable to connect to the server. Make sure the backend is running.",
    );
  }
}

// Types of data that will be returned from the API
export interface PlateOptionsResponse {
  data: {
    emirates: { key: string; label: string }[];
    plate_types: { key: string; label: string }[];
    plate_designs: { key: string; label: string }[];
    preview_background: { url: string };
  };
}

export interface NumberPlateSubmitResponse {
  data: {
    number_plate: {
      id: string;
      title: string;
      status: string;
      created_at: string;
    };
  };
}
