import { NextResponse } from "next/server";
import { getApiBaseUrl, withPublicApiHeaders } from "@/lib/api-config";

export async function GET() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/v1/site-settings`, {
      headers: withPublicApiHeaders({ Accept: "application/json" }),
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
