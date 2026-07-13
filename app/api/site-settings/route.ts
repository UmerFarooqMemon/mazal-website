import { NextResponse } from "next/server";

const API_BASE_URL = "https://admin.mazal.cloud/api";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/site-settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 36000 },
    });
    const data = await response.json();

    // Return with cache headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch site settings" },
      { status: 500 },
    );
  }
}
