import { NextRequest, NextResponse } from "next/server";
import { getPlateOptions } from "@/services/number-plates";
import { normalizeAcceptLanguage } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    const acceptLanguage = normalizeAcceptLanguage(
      request.nextUrl.searchParams.get("locale") ||
        request.headers.get("accept-language"),
    );

    const data = await getPlateOptions(acceptLanguage);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch plate options:", error);
    return NextResponse.json(
      { error: "Failed to fetch plate options" },
      { status: 500 },
    );
  }
}
