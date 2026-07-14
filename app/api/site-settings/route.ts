import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://admin.mazal.cloud/api";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/site-settings`, {
      headers: { Accept: "application/json" },
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
