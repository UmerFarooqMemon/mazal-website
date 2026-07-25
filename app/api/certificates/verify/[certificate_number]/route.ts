import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate } from "@/services/number-plates";
import { normalizeAcceptLanguage } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificate_number: string }> },
) {
  try {
    const { certificate_number } = await params;
    const locale = normalizeAcceptLanguage(
      request.headers.get("accept-language"),
    );
    const data = await verifyCertificate(certificate_number, locale);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 },
    );
  }
}
