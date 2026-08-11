import { NextRequest, NextResponse } from "next/server";
import {
  getApiBaseUrl,
  normalizeAcceptLanguage,
  withAcceptLanguage,
  withPublicApiHeaders,
} from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    const locale = normalizeAcceptLanguage(
      request.headers.get("Accept-Language"),
    );

    const response = await fetch(`${getApiBaseUrl()}/v1/homepage/stats`, {
      headers: withPublicApiHeaders(
        withAcceptLanguage({ Accept: "application/json" }, locale),
      ),
      // Aggregate stats — short cache is fine per API guide
      next: { revalidate: 60 },
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch homepage stats:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch homepage stats",
        errors: null,
      },
      { status: 500 },
    );
  }
}
