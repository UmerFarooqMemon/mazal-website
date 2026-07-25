import { NextResponse } from "next/server";
import { getApiBaseUrl, withPublicApiHeaders } from "@/lib/api-config";

export async function GET() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/v1/partners`, {
      headers: withPublicApiHeaders({ Accept: "application/json" }),
      cache: "no-store",
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    return NextResponse.json(
      { status: false, message: "Failed to fetch partners", errors: null },
      { status: 500 },
    );
  }
}
