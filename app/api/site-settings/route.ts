import { NextResponse } from "next/server";
import { getApiBaseUrl, withPublicApiHeaders } from "@/lib/api-config";

export async function GET() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/v1/site-settings`, {
      headers: withPublicApiHeaders({ Accept: "application/json" }),
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
