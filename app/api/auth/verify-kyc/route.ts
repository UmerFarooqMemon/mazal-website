import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "KYC verification endpoint ready",
    data: {
      status: "pending",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let profileType: string | null = null;
    let fullLegalName: string | null = null;
    let email: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      profileType = String(formData.get("profile_type") || "");
      fullLegalName = String(formData.get("full_legal_name") || "");
      email = String(formData.get("email") || "");
    } else {
      const body = await request.json().catch(() => ({}));
      profileType = body.profile_type || null;
      fullLegalName = body.full_legal_name || null;
      email = body.email || null;
    }

    return NextResponse.json({
      success: true,
      message: "KYC submitted for verification",
      data: {
        status: "submitted",
        profile_type: profileType || "uae_resident",
        full_legal_name: fullLegalName || null,
        email: email || null,
        submitted_at: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to process KYC submission",
      },
      { status: 500 },
    );
  }
}
