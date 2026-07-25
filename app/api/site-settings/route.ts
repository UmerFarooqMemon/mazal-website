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
      request.headers.get("accept-language"),
    );

    const response = await fetch(`${getApiBaseUrl()}/v1/site-settings`, {
      headers: withPublicApiHeaders(
        withAcceptLanguage({ Accept: "application/json" }, locale),
      ),
      cache: "no-store",
    });
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch site settings" },
      { status: 500 },
    );
  }
}
