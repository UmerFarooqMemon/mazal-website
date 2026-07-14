import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://admin.mazal.cloud/api";

// GET - List all user's number plates
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/v1/number-plates`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Response is not JSON:", text);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 502 },
      );
    }

    console.log("External API Response:", JSON.stringify(data).slice(0, 300));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Failed to fetch" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch number plates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch number plates" },
      { status: 500 },
    );
  }
}

// ✅ POST - Submit new number plate
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const response = await fetch(`${API_BASE_URL}/v1/number-plates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 502 },
        );
      }

      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || data.error || "Submission failed" },
          { status: response.status },
        );
      }
      return NextResponse.json(data);
    } else {
      const body = await request.json();
      const response = await fetch(`${API_BASE_URL}/v1/number-plates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 502 },
        );
      }

      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || data.error || "Submission failed" },
          { status: response.status },
        );
      }
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error("Failed to submit number plate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit number plate" },
      { status: 500 },
    );
  }
}
