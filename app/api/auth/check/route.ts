import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://admin.mazal.cloud/api";

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "No token" },
      { status: 401 },
    );
  }

  try {
    // Verify token by calling a protected endpoint on the backend
    const response = await fetch(`${API_BASE_URL}/v1/number-plates`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ valid: true });
    } else {
      // If the backend returns 401, the token is invalid
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 401 },
      );
    }
  } catch (error) {
    // Network or other server errors – don't invalidate the session
    return NextResponse.json(
      { valid: false, error: "Verification temporarily unavailable" },
      { status: 502 },
    );
  }
}
