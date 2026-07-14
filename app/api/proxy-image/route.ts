import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = (process.env.NEXT_PUBLIC_API_BASE_URL
  ? [new URL(process.env.NEXT_PUBLIC_API_BASE_URL).hostname]
  : []
).concat(["admin.mazal.cloud"]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);

    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }

    const imageResponse = await fetch(url, {
      headers: { Accept: "image/*" },
      cache: "no-store",
    });

    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: imageResponse.status });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/png";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
