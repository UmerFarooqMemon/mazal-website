import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://admin.mazal.cloud/api";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/site-settings`, {
      headers: { Accept: "application/json" },
    });
    const data = await response.json();
    const faviconUrl = data?.data?.branding?.favicon_url;

    if (faviconUrl) {
      // Fetch the actual image
      const imageResponse = await fetch(faviconUrl);
      if (!imageResponse.ok) throw new Error("Failed to fetch favicon image");

      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType =
        imageResponse.headers.get("content-type") || "image/x-icon";

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return new NextResponse(null, {
      status: 302,
      headers: { Location: "/favicon.ico" },
    });
  } catch (error) {
    console.error("Favicon proxy error:", error);
    return new NextResponse(null, {
      status: 302,
      headers: { Location: "/favicon.ico" },
    });
  }
}
