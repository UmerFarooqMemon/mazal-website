import { NextResponse } from "next/server";

// GET Request
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API is working! (GET)",
    data: [],
  });
}

// POST Request
export async function POST() {
  return NextResponse.json({
    success: true,
    message: "API is working! (POST)",
  });
}
