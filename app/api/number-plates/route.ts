import { NextRequest, NextResponse } from "next/server";
import {
  listMyNumberPlates,
  submitNumberPlate,
} from "@/services/number-plates";

// GET /api/number-plates - List authenticated user's number plates
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await listMyNumberPlates(token);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch number plates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch number plates" },
      { status: 500 },
    );
  }
}

// POST /api/number-plates - Submit a new number plate valuation request
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = await submitNumberPlate(body, token);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to submit number plate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit number plate" },
      { status: 500 },
    );
  }
}
