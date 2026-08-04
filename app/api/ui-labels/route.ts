import { NextRequest, NextResponse } from "next/server";
import {
  getApiBaseUrl,
  normalizeAcceptLanguage,
  withAcceptLanguage,
  withPublicApiHeaders,
} from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    // Prefer explicit ?locale= so HTTP/Next caches never mix en/ar responses.
    const locale = normalizeAcceptLanguage(
      request.nextUrl.searchParams.get("locale") ||
        request.headers.get("accept-language"),
    );

    const response = await fetch(`${getApiBaseUrl()}/v1/ui-labels`, {
      headers: withPublicApiHeaders(
        withAcceptLanguage({ Accept: "application/json" }, locale),
      ),
      // Locale is in our query string; do not reuse a shared fetch cache across locales.
      cache: "no-store",
    });
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control":
          "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
        Vary: "Accept-Language",
      },
    });
  } catch (error) {
    console.error("Failed to fetch UI labels:", error);
    return NextResponse.json(
      { error: "Failed to fetch UI labels" },
      { status: 500 },
    );
  }
}
