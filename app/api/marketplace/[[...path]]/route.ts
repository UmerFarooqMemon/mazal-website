import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl, withPublicApiHeaders } from "@/lib/api-config";

function buildTargetUrl(
  request: NextRequest,
  path: string[] | undefined,
): string {
  const suffix = path?.length ? `/${path.join("/")}` : "";
  const search = request.nextUrl.search || "";
  return `${getApiBaseUrl()}/v1/marketplace${suffix}${search}`;
}

async function proxyRequest(
  request: NextRequest,
  path: string[] | undefined,
  method: string,
) {
  try {
    const targetUrl = buildTargetUrl(request, path);
    const contentType = request.headers.get("content-type") || "";
    const authHeader = request.headers.get("authorization");
    const locale = request.headers.get("accept-language");

    const headers: Record<string, string> = withPublicApiHeaders({
      Accept: "application/json",
    });

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    if (locale) {
      headers["Accept-Language"] = locale;
    }

    let body: BodyInit | undefined;
    if (method !== "GET" && method !== "DELETE") {
      if (contentType.includes("multipart/form-data")) {
        body = await request.formData();
      } else {
        const text = await request.text();
        if (text) {
          body = text;
          headers["Content-Type"] = contentType || "application/json";
        }
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseType = response.headers.get("content-type") || "";

    if (responseType.includes("application/json")) {
      const text = await response.text();
      let data: unknown;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        return NextResponse.json(
          { status: false, message: "Invalid response from server." },
          { status: 502 },
        );
      }

      return NextResponse.json(data, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        "Content-Type": responseType || "application/octet-stream",
        "Content-Disposition":
          response.headers.get("content-disposition") || "attachment",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to proxy marketplace request.",
      },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path, "GET");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path, "PUT");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path, "DELETE");
}
