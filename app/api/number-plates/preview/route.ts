import { NextRequest, NextResponse } from "next/server";
import { getPlatePreview } from "@/services/number-plates";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emirate = searchParams.get("emirate") || "dubai";
    const plate_type = searchParams.get("plate_type") || "private_car";
    const plate_design = searchParams.get("plate_design");

    const params: any = { emirate, plate_type };
    if (plate_design) params.plate_design = plate_design;

    const data = await getPlatePreview(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch plate preview:", error);
    return NextResponse.json(
      { error: "Failed to fetch plate preview" },
      { status: 500 },
    );
  }
}
