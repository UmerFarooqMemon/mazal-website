import { NextResponse } from "next/server";
import { getPlateOptions } from "@/services/number-plates";

export async function GET() {
  try {
    const data = await getPlateOptions();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch plate options:", error);
    return NextResponse.json(
      { error: "Failed to fetch plate options" },
      { status: 500 },
    );
  }
}
