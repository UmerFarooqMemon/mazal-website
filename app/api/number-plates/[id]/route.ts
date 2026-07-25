import { NextRequest, NextResponse } from "next/server";
import { getNumberPlate } from "@/services/number-plates";
import { normalizeAcceptLanguage } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locale = normalizeAcceptLanguage(
      request.headers.get("accept-language"),
    );

    // Await params to get the actual id
    const { id } = await params;
    const data = await getNumberPlate(id, token, locale);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch number plate:", error);
    return NextResponse.json(
      { error: "Failed to fetch number plate" },
      { status: 500 },
    );
  }
}
