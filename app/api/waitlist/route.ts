import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { appendWaitlistEntry } from "@/lib/google-sheets";
import { waitlistSchema } from "@/lib/waitlist";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await waitlistSchema.validate(body, { abortEarly: false });

    await appendWaitlistEntry(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        { success: false, message: "Invalid form data" },
        { status: 400 },
      );
    }

    console.error("Waitlist submission failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save your details. Please try again." },
      { status: 500 },
    );
  }
}
