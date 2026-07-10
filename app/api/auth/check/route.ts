import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://admin.mazal.cloud/api";

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "No token" },
      { status: 401 },
    );
  }

  try {
    // Try to access a protected endpoint to verify token validity
    const response = await fetch(`${API_BASE_URL}/v1/number-plates`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 401 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Verification failed" },
      { status: 500 },
    );
  }
}
