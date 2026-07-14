import { NextRequest, NextResponse } from "next/server";
import { getPlateOptions } from "@/services/number-plates";

export async function GET(request: NextRequest) {
  try {
    const acceptLanguage = request.nextUrl.searchParams.get("locale") || "en";

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
