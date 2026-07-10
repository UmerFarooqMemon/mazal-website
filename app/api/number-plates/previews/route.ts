import { NextResponse } from "next/server";
import { listAllPreviews } from "@/services/number-plates";

export async function GET() {
  try {
    const data = await listAllPreviews();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch previews:", error);
    return NextResponse.json(
      { error: "Failed to fetch previews" },
      { status: 500 },
    );
  }
}
